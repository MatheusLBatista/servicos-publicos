import { CommonResponse, CustomError, HttpStatusCodes } from "../../utils/helpers";
import DemandaRepository from '../../repository/DemandaRepository.js';
// import DemandaFilterBuild from "../../repository/filters/DemandaFilterBuild.js";

const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockPaginate = jest.fn();
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockPopulate = jest.fn();

class DemandaFilterBuild {
    comTipo = jest.fn().mockReturnThis();
    comData = jest.fn().mockReturnThis();
    comEndereco = jest.fn().mockReturnThis();
    comStatus = jest.fn().mockReturnThis();
    comUsuario = jest.fn().mockReturnThis();
}

class DemandaModelMock {
    constructor(dados) {
        this.dados = dados;
        this.save = mockSave;
    }

    save = mockSave;

    static findOne = mockFindOne;
    static findById = mockFindById;
    static paginate = mockPaginate;
    static findByIdAndUpdate = mockFindByIdAndUpdate;
    static findByIdAndDelete = mockFindByIdAndDelete;
}

const UsuarioModelMock = {};

describe('DemandaRepository', () => {
    let demandaRepository;
    global.DemandaFilterBuild = DemandaFilterBuild;

    beforeEach(() => {
        jest.clearAllMocks();

        demandaRepository = new DemandaRepository({
        demandaModel: DemandaModelMock,
        usuarioModel: UsuarioModelMock
        });
    });

    describe('buscarPorId', () => {
        it('deve retornar a demanda quando encontrada', async() => {
            const fakeId = '123'
            const fakeDemanda = { _id: fakeId, tipo: 'Coleta' };

             mockFindById.mockReturnValue({
                select: jest.fn().mockResolvedValue(fakeDemanda),
                then: jest.fn(), // para caso use promise
            });

            // Aqui, quando incluir includeTokens=false, chama apenas findById
            mockFindById.mockResolvedValue(fakeDemanda);

            const resultado = await demandaRepository.buscarPorID(fakeId);

            expect(mockFindById).toHaveBeenCalledWith(fakeId);
            expect(resultado).toEqual(fakeDemanda);
        })

        it('deve lançar erro se demanda não for encontrada', async () => {
            const fakeId = 'naoexiste';

            mockFindById.mockResolvedValue(null);

            await expect(demandaRepository.buscarPorID(fakeId)).rejects.toThrow(CustomError);
        });
    })

    describe('criar', () => {
        it('deve criar e salvar a demanda', async () => {
            const demandaDados = { tipo: 'Coleta' };
            const demandaSalva = { _id: '123', tipo: 'Coleta' };

            mockSave.mockResolvedValue(demandaSalva);

            const resultado = await demandaRepository.criar(demandaDados);

            expect(mockSave).toHaveBeenCalled();
            expect(resultado).toEqual(demandaSalva);
        });
    });

    describe('listar', () => {
        it('deve retornar uma demanda específica quando ID é fornecido', async () => {
            const fakeId = '123';
            const fakeDemanda = { 
                _id: fakeId, 
                tipo: 'Coleta',
                usuarios: ['user1', 'user2'] 
            };

            mockFindById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeDemanda)
            });

            const req = { params: { id: fakeId } };
            const resultado = await demandaRepository.listar(req);

            expect(mockFindById).toHaveBeenCalledWith(fakeId);
            expect(resultado).toEqual(fakeDemanda);
        });

        it('deve lançar erro se demanda não for encontrada quando buscar por ID', async () => {
            const fakeId = 'naoexiste';
            mockFindById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            const req = { params: { id: fakeId } };
            await expect(demandaRepository.listar(req)).rejects.toThrow(CustomError);
        });

        it('deve listar demandas com paginação quando não há ID', async () => {
            const fakePaginatedResult = {
                docs: [
                    { _id: '1', tipo: 'Coleta', usuarios: [] },
                    { _id: '2', tipo: 'Entrega', usuarios: ['user1'] }
                ],
                totalDocs: 2,
                page: 1,
                limit: 10
            };

            mockPaginate.mockResolvedValue(fakePaginatedResult);

            const req = { 
                params: {},
                query: { 
                    page: '1', 
                    limite: '10' 
                }
            };
            const resultado = await demandaRepository.listar(req);

            expect(mockPaginate).toHaveBeenCalled();
            expect(resultado.docs).toHaveLength(2);
            expect(resultado.docs[0].estatisticas).toEqual({ totalUsuarios: 0 });
            expect(resultado.docs[1].estatisticas).toEqual({ totalUsuarios: 1 });
        });

        // it('deve aplicar filtros corretamente na listagem', async () => {
        //     const fakeFilterBuilder = {
        //         comTipo: jest.fn().mockReturnThis(),
        //         comData: jest.fn().mockReturnThis(),
        //         comEndereco: jest.fn().mockReturnThis(),
        //         comStatus: jest.fn().mockReturnThis(),
        //         comUsuario: jest.fn().mockImplementation(() => Promise.resolve(fakeFilterBuilder)),
        //         build: jest.fn().mockReturnValue({ tipo: 'Coleta' })
        //     };

        //     // jest.spyOn(DemandaFilterBuild.prototype, 'comTipo').mockImplementation(fakeFilterBuilder.comTipo);
        //     // jest.spyOn(DemandaFilterBuild.prototype, 'comData').mockImplementation(fakeFilterBuilder.comData);

        //     const req = { 
        //         params: {},
        //         query: { 
        //             tipo: 'Coleta',
        //             page: '1'
        //         } 
        //     };

        //     await demandaRepository.listar(req);

        //     // expect(fakeFilterBuilder.comTipo).toHaveBeenCalledWith('Coleta');
        //     expect(fakeFilterBuilder.build).toHaveBeenCalled();
        // });
    });

    describe('atualizar', () => {
        it('deve atualizar a demanda e retornar', async () => {
        const id = '123abc';
        const parsedData = { status: 'Em andamento' };
        const demandaAtualizada = { _id: id, ...parsedData };

        mockFindByIdAndUpdate.mockResolvedValue(demandaAtualizada);

        const resultado = await demandaRepository.atualizar(id, parsedData);

        expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, parsedData, { new: true });
        expect(resultado).toEqual(demandaAtualizada);
        });

        it('deve lançar erro se demanda não existir para atualizar', async () => {
        const id = 'inexistente';
        const parsedData = { status: 'Cancelada' };

        mockFindByIdAndUpdate.mockResolvedValue(null);

        await expect(demandaRepository.atualizar(id, parsedData)).rejects.toThrow(CustomError);
        });
    });

    describe('deletar', () => {
        it('deve deletar a demanda e retornar', async () => {
        const id = '123abc';
        const demandaDeletada = { _id: id, tipo: 'Coleta' };

        mockFindByIdAndDelete.mockResolvedValue(demandaDeletada);

        const resultado = await demandaRepository.deletar(id);

        expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
        expect(resultado).toEqual(demandaDeletada);
        });

        it('deve lançar erro se demanda não existir para deletar', async () => {
        const id = 'inexistente';

        mockFindByIdAndDelete.mockResolvedValue(null);

        await expect(demandaRepository.deletar(id)).rejects.toThrow(CustomError);
        });
    });

})


