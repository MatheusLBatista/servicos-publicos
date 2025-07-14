import { CommonResponse, CustomError, HttpStatusCodes } from "../../utils/helpers/index.js";
import DemandaRepository from '../../repository/DemandaRepository.js';

const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockPaginate = jest.fn();
const mockSave = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

class DemandaFilterBuild {
  comTipo = jest.fn().mockReturnThis();
  comData = jest.fn().mockReturnThis();
  comEndereco = jest.fn().mockReturnThis();
  comStatus = jest.fn().mockReturnThis();
  comUsuario = jest.fn().mockReturnThis();
  comSecretaria = jest.fn().mockReturnThis();
  build = jest.fn().mockReturnValue({});
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

  describe('buscarPorID', () => {
    it('deve retornar a demanda com populate', async () => {
        const fakeId = '123abc';
        const fakeResult = { _id: fakeId, tipo: 'Coleta' };

        const finalQueryMock = Promise.resolve(fakeResult);

        const secondPopulateMock = jest.fn().mockReturnValue(finalQueryMock);

        const firstPopulateMock = jest.fn().mockReturnValue({
            populate: secondPopulateMock
        });

        const findByIdMock = jest.fn().mockReturnValue({
            populate: firstPopulateMock
        });

        DemandaModelMock.findById = findByIdMock;

        const resultado = await demandaRepository.buscarPorID(fakeId);

        expect(findByIdMock).toHaveBeenCalledWith(fakeId);
        expect(firstPopulateMock).toHaveBeenCalledWith({
            path: 'usuarios',
            populate: [
            { path: 'secretarias' },
            { path: 'grupo' }
            ]
        });
        expect(secondPopulateMock).toHaveBeenCalledWith('secretarias');
        expect(resultado).toEqual(fakeResult);
    });

    it('deve lançar erro se demanda não for encontrada', async () => {
        const fakeId = 'naoexiste';

        const selectMock = jest.fn().mockResolvedValue(null);
        const populateMock = jest.fn().mockReturnValue({ select: selectMock });
        const populateUsuariosMock = jest.fn().mockReturnValue({ populate: populateMock });

        DemandaModelMock.findById = jest.fn().mockReturnValue({
            populate: populateUsuariosMock
        });

        await expect(demandaRepository.buscarPorID(fakeId, true)).rejects.toThrow(CustomError);

        expect(DemandaModelMock.findById).toHaveBeenCalledWith(fakeId);
        expect(populateUsuariosMock).toHaveBeenCalledWith({
            path: 'usuarios',
            populate: [
                { path: 'secretarias' },
                { path: 'grupo' }
            ]
        });
        expect(populateMock).toHaveBeenCalledWith('secretarias');
        expect(selectMock).toHaveBeenCalledWith('+refreshtoken +accesstoken');
    });

  });

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

//   describe('DemandaRepository › listar', () => {
//     it('deve retornar uma demanda específica quando ID é fornecido', async () => {
//       const demandaMock = {
//         _id: "dem-1",
//         nome: "Demanda Teste",
//         usuarios: [{}, {}, {}],
//         toObject: function () { return this; }
//       };

//       const paginateMock = jest.fn().mockResolvedValue({
//         docs: [demandaMock],
//         totalDocs: 1,
//         limit: 10,
//         page: 1,
//         totalPages: 1
//       });

//       const modelDemandaMock = {
//         paginate: paginateMock
//       };

//       const repository = new DemandaRepository(modelDemandaMock);

//       const req = {
//         query: {
//           tipo: '',
//           status: '',
//           data_inicio: '',
//           data_fim: '',
//           endereco: '',
//           usuario: '',
//           secretaria: '',
//           page: 1,
//           limite: 10
//         }
//       };

//       const resultado = await repository.listar(req);

//       expect(paginateMock).toHaveBeenCalled(); // Garantimos que paginate foi chamado
//       expect(resultado.docs).toBeDefined();
//       expect(resultado.docs[0]._id).toBe("dem-1");
//       expect(resultado.docs[0].estatisticas.totalUsuarios).toBe(3);
//     });
// }); 
 
  //todo: revisar listar
  // describe('listar', () => {
  //       function mockPopulateChain(finalResult) {
  //       const finalQueryMock = Promise.resolve(finalResult);
  //       const secondPopulateMock = jest.fn().mockReturnValue(finalQueryMock);
  //       const firstPopulateMock = jest.fn().mockReturnValue({ populate: secondPopulateMock });

  //       return {
  //           firstPopulateMock,
  //           secondPopulateMock,
  //           findByIdReturn: { populate: firstPopulateMock }
  //       };
  //       }

  //       it('deve retornar uma demanda específica quando ID é fornecido', async () => {
  //           const fakeId = '123';
  //           const fakeDemanda = {
  //           _id: fakeId,
  //           tipo: 'Coleta',
  //           usuarios: ['user1', 'user2'],
  //           toObject: () => ({
  //               _id: fakeId,
  //               tipo: 'Coleta',
  //               usuarios: ['user1', 'user2']
  //           })
  //           };

  //           const { firstPopulateMock, secondPopulateMock, findByIdReturn } = mockPopulateChain(fakeDemanda);
  //           const mockFindById = jest.fn().mockReturnValue(findByIdReturn);
  //           demandaRepository.modelDemanda.findById = mockFindById;

  //           const req = { params: { id: fakeId }, query: {} };
  //           const resultado = await demandaRepository.listar(req);

  //           expect(mockFindById).toHaveBeenCalledWith(fakeId);
  //           expect(firstPopulateMock).toHaveBeenCalledWith({
  //           path: 'usuarios',
  //           populate: [{ path: 'secretarias' }, { path: 'grupo' }]
  //           });
  //           expect(secondPopulateMock).toHaveBeenCalledWith('secretarias');
  //           expect(resultado).toEqual(fakeDemanda);
  //       });

  //       it('deve lançar erro se demanda não for encontrada quando buscar por ID', async () => {
  //           const { findByIdReturn } = mockPopulateChain(null);
  //           const mockFindById = jest.fn().mockReturnValue(findByIdReturn);
  //           demandaRepository.modelDemanda.findById = mockFindById;

  //           const req = { params: { id: 'naoexiste' }, query: {} };
  //           await expect(demandaRepository.listar(req)).rejects.toThrow(CustomError);
  //       });

  //       it('deve listar demandas com paginação quando não há ID', async () => {
  //           const fakePaginatedResult = {
  //           docs: [
  //               { toObject: () => ({ _id: '1', tipo: 'Coleta', usuarios: [] }) },
  //               { toObject: () => ({ _id: '2', tipo: 'Entrega', usuarios: ['user1'] }) }
  //           ],
  //           totalDocs: 2,
  //           page: 1,
  //           limit: 10
  //           };

  //           const mockPaginate = jest.fn().mockResolvedValue(fakePaginatedResult);
  //           demandaRepository.modelDemanda.paginate = mockPaginate;

  //           const req = {
  //           params: {},
  //           query: { page: '1', limite: '10' }
  //           };
  //           const resultado = await demandaRepository.listar(req);

  //           expect(mockPaginate).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
  //           page: 1,
  //           limit: 10,
  //           populate: [
  //               { path: 'usuarios', populate: [{ path: 'secretarias' }, { path: 'grupo' }] },
  //               { path: 'secretarias' }
  //           ]
  //           }));
  //           expect(resultado.docs).toHaveLength(2);
  //           expect(resultado.docs[0].estatisticas).toEqual({ totalUsuarios: 0 });
  //           expect(resultado.docs[1].estatisticas).toEqual({ totalUsuarios: 1 });
  //       });
  // });

  describe('atualizar', () => {
    it('deve atualizar a demanda e retornar', async () => {
      const id = '123abc';
      const parsedData = { status: 'Em andamento' };
      const demandaAtualizada = { _id: id, ...parsedData };

      const secondPopulate = jest.fn().mockResolvedValue(demandaAtualizada);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      mockFindByIdAndUpdate.mockReturnValue({ populate: firstPopulate });

      const resultado = await demandaRepository.atualizar(id, parsedData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, parsedData, { new: true });
      expect(resultado).toEqual(demandaAtualizada);
    });

    it('deve lançar erro se demanda não existir para atualizar', async () => {
      const id = 'inexistente';
      const parsedData = { status: 'Cancelada' };

      const secondPopulate = jest.fn().mockResolvedValue(null);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      mockFindByIdAndUpdate.mockReturnValue({ populate: firstPopulate });

      await expect(demandaRepository.atualizar(id, parsedData)).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar a demanda e retornar', async () => {
      const id = '123abc';
      const demandaDeletada = { _id: id, tipo: 'Coleta' };

      const secondPopulate = jest.fn().mockResolvedValue(demandaDeletada);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      mockFindByIdAndDelete.mockReturnValue({ populate: firstPopulate });

      const resultado = await demandaRepository.deletar(id);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
      expect(resultado).toEqual(demandaDeletada);
    });

    it('deve lançar erro se demanda não existir para deletar', async () => {
      const id = 'inexistente';

      const secondPopulate = jest.fn().mockResolvedValue(null);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      mockFindByIdAndDelete.mockReturnValue({ populate: firstPopulate });

      await expect(demandaRepository.deletar(id)).rejects.toThrow(CustomError);
    });
  });

  const fakeId = '123';
  const parsedData = { status: 'atribuir' };

  const fakeDemanda = {
    _id: fakeId,
    status: 'atribuir',
    usuarios: ['user1'],
    toObject: () => ({
      _id: fakeId,
      status: 'atribuir',
      usuarios: ['user1']
    })
  };
  describe('atribuir, devolver, resolver', () => {
    const populateSecond = jest.fn().mockResolvedValue(fakeDemanda);
    const populateFirst = jest.fn().mockReturnValue({ populate: populateSecond });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('atribuir - deve atualizar e retornar a demanda', async () => {
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ populate: populateFirst });
      demandaRepository.modelDemanda.findByIdAndUpdate = mockFindByIdAndUpdate;

      const result = await demandaRepository.atribuir(fakeId, parsedData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(fakeId, parsedData, { new: true });
      expect(result).toEqual(fakeDemanda);
    });

    it('atribuir - deve lançar erro se demanda não for encontrada', async () => {
      const populateSecond = jest.fn().mockResolvedValue(null);
      const populateFirst = jest.fn().mockReturnValue({ populate: populateSecond });
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ populate: populateFirst });

      demandaRepository.modelDemanda.findByIdAndUpdate = mockFindByIdAndUpdate;

      await expect(demandaRepository.atribuir(fakeId, parsedData)).rejects.toThrow(CustomError);
    });

    it('devolver - deve atualizar e retornar a demanda', async () => {
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ populate: populateFirst });
      demandaRepository.modelDemanda.findByIdAndUpdate = mockFindByIdAndUpdate;

      const result = await demandaRepository.devolver(fakeId, parsedData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(fakeId, parsedData, { new: true });
      expect(result).toEqual(fakeDemanda);
    });

    it('resolver - deve atualizar e retornar a demanda', async () => {
      const mockFindByIdAndUpdate = jest.fn().mockReturnValue({ populate: populateFirst });
      demandaRepository.modelDemanda.findByIdAndUpdate = mockFindByIdAndUpdate;

      const result = await demandaRepository.resolver(fakeId, parsedData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(fakeId, parsedData, { new: true });
      expect(result).toEqual(fakeDemanda);
    });
  });

});
