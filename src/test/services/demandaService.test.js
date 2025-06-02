import DemandaService from '../../service/DemandaService.js'
import DemandaRepository from '../../repository/DemandaRepository.js';
import { CustomError, HttpStatusCodes } from '../../utils/helpers/index.js';
import { beforeEach, describe, expect, jest } from '@jest/globals'
import { DemandaSchema } from '../../utils/validators/schemas/zod/DemandaSchema.js';

jest.mock('../../repository/DemandaRepository.js');

describe('DemandaService', () => {
    let demandaService;
    let demandaRepositoryMock;

    beforeEach(() => {
        demandaRepositoryMock = {
        listar: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        buscarPorID: jest.fn()
        };
        DemandaRepository.mockImplementation(() => demandaRepositoryMock);
        demandaService = new DemandaService();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('listar', () => {
        it('deve listar as demandas', async() => {
        demandaRepositoryMock.listar.mockResolvedValue([{ tipo: 'Coleta' }]);

        const resultado = await demandaService.listar({});

        expect(resultado).toEqual([{ tipo: 'Coleta' }]);
        expect(demandaRepositoryMock.listar).toHaveBeenCalled();
        })
    })

    describe('criar', () => {
        it('deve criar uma demanda', async () => {
            const parsedData = { tipo: 'Coleta', status: 'Concluída' };
            const expectedData = { id: 1, tipo: 'Coleta', status: 'Concluída' };

            demandaRepositoryMock.criar.mockResolvedValue(expectedData);

            const data = await demandaService.criar(parsedData);

            expect(data).toEqual(expectedData);
            expect(demandaRepositoryMock.criar).toHaveBeenCalledWith(parsedData);
        });
    });

    describe('atualizar', () => {
        it('deve atualizar uma demanda existente removendo campos tipo e data', async () => {
            const id = '123';
            const input = {
            tipo: 'Coleta',
            data: '2025-06-01',
            status: 'Em andamento',
            descricao: 'Atualizando dados',
            };
            const parsedData = { ...input }; 
            const esperado = { status: 'Em andamento', descricao: 'Atualizando dados' };

            demandaRepositoryMock.buscarPorID.mockResolvedValue({ id });
            demandaRepositoryMock.atualizar.mockResolvedValue({ id, ...esperado });

            const resultado = await demandaService.atualizar(id, parsedData);

            expect(demandaRepositoryMock.buscarPorID).toHaveBeenCalledWith(id);
            expect(demandaRepositoryMock.atualizar).toHaveBeenCalledWith(id, esperado);
            expect(resultado).toEqual({ id, ...esperado });
        });

        // it('deve lançar erro se a demanda não existir', async () => {
        //     const id = 'inexistente';
        //     const input = { status: 'Concluída' };

        //     demandaRepositoryMock.buscarPorID.mockResolvedValue(null);

        //     await expect(service.atualizar(id, input)).rejects.toThrow('Demanda não encontrada');
        //     expect(demandaRepositoryMock.buscarPorID).toHaveBeenCalledWith(id);
        //     expect(demandaRepositoryMock.atualizar).not.toHaveBeenCalled();
        // });
    })

    describe('deletar', () => {
        it('deve deletar a demanda quando ela existir', async () => {
            const id = '123';
            const demanda = { id, tipo: 'Coleta' };

            // Mock para garantir que demanda existe
            jest.spyOn(demandaService, 'ensureDemandaExists').mockResolvedValue(demanda);

            demandaRepositoryMock.deletar.mockResolvedValue({ deleted: true });

            const resultado = await demandaService.deletar(id);

            expect(demandaService.ensureDemandaExists).toHaveBeenCalledWith(id);
            expect(demandaRepositoryMock.deletar).toHaveBeenCalledWith(id);
            expect(resultado).toEqual({ deleted: true });
        });
    })

})
