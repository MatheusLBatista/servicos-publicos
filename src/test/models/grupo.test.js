// src/tests/unit/models/Grupo.test.js
import mongoose from 'mongoose';
import Grupo from '../../models/Grupo.js'
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

// Limpeza após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Grupo.deleteMany({});
});

describe('Grupo Model', () => {
    it('deve criar um Grupo com dados válidos', async () => {
        const grupoData = {
            nome: 'Grupo Teste',
            descricao: 'Descrição do Grupo Teste',
            ativo: true,
            unidades: [],
            permissoes: [
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true,
                },
            ],
        };

        const grupo = new Grupo(grupoData);
        const savedGrupo = await grupo.save();

        expect(savedGrupo.nome).toBe(grupoData.nome);
        expect(savedGrupo.descricao).toBe(grupoData.descricao);
        expect(savedGrupo.ativo).toBe(grupoData.ativo);
        expect(savedGrupo.permissoes.length).toBe(1);
        expect(savedGrupo.permissoes[0].rota).toBe(grupoData.permissoes[0].rota);
    });

    it('não deve criar um Grupo com rota + domínio duplicados em permissões', async () => {
        const grupoData = {
            nome: 'Grupo Teste Duplicado',
            descricao: 'Descrição do Grupo Teste Duplicado',
            ativo: true,
            unidades: [],
            permissoes: [
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true,
                },
                {
                    rota: 'usuarios',
                    dominio: 'http://localhost:3000',
                    ativo: true,
                    buscar: true,
                    enviar: true,
                    substituir: true,
                    modificar: true,
                    excluir: true,
                },
            ],
        };

        const grupo = new Grupo(grupoData);
        let error;

        try {
            await grupo.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Permissões duplicadas encontradas: rota + domínio devem ser únicas dentro de cada grupo.');
    });

    it('deve paginar os resultados corretamente', async () => {
        // Inserir múltiplos grupos para testar a paginação
        const grupos = [];
        for (let i = 1; i <= 15; i++) {
            grupos.push({
                nome: `Grupo ${i}`,
                descricao: `Descrição do Grupo ${i}`,
                ativo: true,
                unidades: [],
                permissoes: [
                    {
                        rota: `rota${i}`,
                        dominio: `http://localhost:${3000 + i}`,
                        ativo: true,
                        buscar: true,
                        enviar: true,
                        substituir: true,
                        modificar: true,
                        excluir: true,
                    },
                ],
            });
        }
        await Grupo.insertMany(grupos);

        const options = {
            page: 2,
            limit: 5,
        };

        const result = await Grupo.paginate({}, options);

        expect(result.docs.length).toBe(5);
        expect(result.page).toBe(2);
        expect(result.limit).toBe(5);
        expect(result.totalDocs).toBe(15);
        expect(result.totalPages).toBe(3);
    });

    it('deve permitir salvar um grupo sem o campo permissoes', async () => {
        const grupoData = {
            nome: 'Grupo Sem Permissões',
            descricao: 'Grupo válido sem permissões',
            ativo: true,
            unidades: [],
            // permissoes omitido completamente
        };

        const grupo = new Grupo(grupoData);
        const savedGrupo = await grupo.save();

        expect(savedGrupo.nome).toBe(grupoData.nome);
        expect(savedGrupo.permissoes).toEqual([]);
    });

    it('deve permitir salvar um grupo com permissão sem domínio (cobertura do dominio || "")', async () => {
        const grupoData = {
            nome: 'Grupo Sem Dominio',
            descricao: 'Cobertura de p.dominio || ""',
            ativo: true,
            unidades: [],
            permissoes: [
            {
                rota: 'relatorios',
                // dominio omitido completamente
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false,
            },
            ],
        };

        const grupo = new Grupo(grupoData);
        const savedGrupo = await grupo.save();

        expect(savedGrupo.permissoes[0].rota).toBe('relatorios');
        expect(savedGrupo.permissoes[0].dominio).toBeUndefined(); // confirma que dominio não foi setado
    });

});
