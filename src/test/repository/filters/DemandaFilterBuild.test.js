import DemandaFilterBuild from '../../../repository/filters/DemandaFilterBuild.js';
import UsuarioRepository from '../../../repository/UsuarioRepository.js';

jest.mock('../../../repository/UsuarioRepository.js');

describe('DemandaFilterBuild', () => {
    let filterBuilder;
    let usuarioMock;

    beforeEach(() => {
        usuarioMock = { _id: '12345' };
        UsuarioRepository.mockImplementation(() => ({
            buscarPorNome: jest.fn().mockResolvedValue(usuarioMock),
        }));
        filterBuilder = new DemandaFilterBuild();
    });

    describe('comTipo()', () => {
        it('deve adicionar filtro de tipo', () => {
            const tipo = "Limpeza";
            filterBuilder.comTipo(tipo);
            expect(filterBuilder.build()).toEqual({
                tipo: { $regex: tipo, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de tipo se for vazio', () => {
            filterBuilder.comTipo('');
            expect(filterBuilder.build()).toEqual({});
        });
    });

    describe('comStatus()', () => {
        it('deve adicionar filtro de status', () => {
            const status = "Aberto";
            filterBuilder.comStatus(status);
            expect(filterBuilder.build()).toEqual({
                status: { $regex: status, $options: 'i' }
            });
        });

        it('não deve adicionar filtro de status se for vazio', () => {
            filterBuilder.comStatus('');
            expect(filterBuilder.build()).toEqual({});
        });
    });

    describe('comData()', () => {
        it('deve adicionar filtro de data com início e fim', () => {
            const inicio = '2023-01-01';
            const fim = '2023-01-31';
            filterBuilder.comData(inicio, fim);

            const filtros = filterBuilder.build();

            // Comparando só a data YYYY-MM-DD
            expect(filtros.data.$gte.toISOString().slice(0, 10)).toBe('2023-01-01');
            expect(filtros.data.$lte.toISOString().slice(0, 10)).toBe('2023-01-31');
        });

        it('não deve adicionar filtro de data se não houver datas', () => {
            filterBuilder.comData(null, null);
            expect(filterBuilder.build()).toEqual({});
        });
    });

    describe('comEndereco()', () => {
        it('deve adicionar filtro de endereço', () => {
            const endereco = "Rua A";
            filterBuilder.comEndereco(endereco);
            expect(filterBuilder.build()).toEqual({
                endereco: {
                    $or: [
                        { 'endereco.logradouro': { $regex: endereco, $options: 'i' } },
                        { 'endereco.cep': { $regex: endereco, $options: 'i' } },
                        { 'endereco.bairro': { $regex: endereco, $options: 'i' } },
                        { 'endereco.numero': { $regex: endereco, $options: 'i' } },
                        { 'endereco.complemento': { $regex: endereco, $options: 'i' } }
                    ]
                }
            });
        });

        it('não deve adicionar filtro de endereço se for vazio', () => {
            filterBuilder.comEndereco('');
            expect(filterBuilder.build()).toEqual({});
        });
    });

    describe('comUsuario()', () => {
        it('deve adicionar filtro de usuário com ID retornado do repositório', async () => {
            await filterBuilder.comUsuario("João");
            expect(filterBuilder.build()).toEqual({
                usuarios: { $in: ['12345'] }
            });
        });

        it('não deve adicionar filtro se nenhum usuário for encontrado', async () => {
            UsuarioRepository.mockImplementation(() => ({
                buscarPorNome: jest.fn().mockResolvedValue(null),
            }));
            filterBuilder = new DemandaFilterBuild();
            await filterBuilder.comUsuario("Desconhecido");
            expect(filterBuilder.build()).toEqual({
                usuarios: { $in: [] }
            });
        });
    });

    describe('build()', () => {
        it('deve retornar objeto vazio se nenhum filtro for usado', () => {
            expect(filterBuilder.build()).toEqual({});
        });
    });
});
