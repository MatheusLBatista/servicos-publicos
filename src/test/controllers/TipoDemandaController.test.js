import TipoDemandaService from '../../service/TipoDemandaService.js';
import TipoDemandaController from '../../controllers/TipoDemandaController.js';
import { jest } from '@jest/globals';
import { CustomError, HttpStatusCodes } from '../../../src/utils/helpers/index.js';
import { TipoDemandaIDSchema, TipoDemandaQuerySchema } from '../../utils/validators/schemas/zod/querys/TipoDemandaQuerySchema.js';
import { TipoDemandaSchema, TipoDemandaUpdateSchema } from '../../utils/validators/schemas/zod/TipoDemandaSchema.js';

jest.mock('../../service/TipoDemandaService.js');

describe('TipoDemandaController', () => {
    let req, res, tipoDemandaController;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        TipoDemandaService.mockClear();
        tipoDemandaController = new TipoDemandaController();
    });
    

    it('deve listar TipoDemandas', async () => {
        const mockData = [{ id: '6832ad0c109564baed4cda0e', titulo: 'tipoDemanda 1' }];
        tipoDemandaController.service.listar.mockResolvedValue(mockData);

        await tipoDemandaController.listar(req, res);

        expect(tipoDemandaController.service.listar).toHaveBeenCalledTimes(1);
        expect(tipoDemandaController.service.listar).toHaveBeenCalledWith(req);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 200,
            message: 'Requisição bem-sucedida',
            data: mockData,
            errors: []
        });
    });

    it('deve validar o ID da tipoDemanda', async () => {
        req.params.id = 'invalid-id';
        try {
            await tipoDemandaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('ID inválido');
        }
    });

    it('deve validar a query titulo da tipoDemanda', async () => {
        req.query = { titulo: '' }; 
        try {
            await tipoDemandaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('titulo não pode ser vazio');
        }
    });

    it('deve validar a query tipo da tipoDemanda', async () => {
        req.query = { tipo: '' }; 
        try {
            await tipoDemandaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('Tipo não pode ser vazio');
        }
    });

    it('deve criar uma nova tipoDemanda', async () => {
        const mockData = { id: '6832ad0c109564baed4cda0e', titulo: 'tipoDemanda 1'};
        req.body = { titulo: 'tipoDemanda 1', descricao: "descrição", subdescricao: "subdescrição",
            icone: "foto.png", link_imagem: "foto.png", tipo: "coleta" };
        //tipoDemandaController.service.criar = jest.fn().mockResolvedValue(mockData);

        tipoDemandaController.service.criar = jest.fn().mockResolvedValue({
            _doc: { 
              id: '6832ad0c109564baed4cda0e', 
              titulo: 'tipoDemanda 1' 
            },
            toObject: function() { 
              return this._doc; 
            }
          });

        await tipoDemandaController.criar(req, res);

        expect(tipoDemandaController.service.criar).toHaveBeenCalledTimes(1);
        expect(tipoDemandaController.service.criar).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 201,
            message: 'Recurso criado com sucesso',
            data: mockData,
            errors: []
        });
    });

    it('deve atualizar uma tipoDemanda', async () => {
        const mockData = {
            toObject: () => ({
            id: '6832ad0c109564baed4cda0e',
            titulo: 'tipoDemanda Atualizada',
            descricao: "descrição",
            subdescricao: "subdescrição",
            icone: "foto.png",
            link_imagem: "foto.png"
            })
        };

        req.params.id = '6832ad0c109564baed4cda0e';
        req.body = {
            titulo: 'tipoDemanda Atualizada',
            descricao: "descrição",
            subdescricao: "subdescrição",
            icone: "foto.png",
            link_imagem: "foto.png"
        };

        tipoDemandaController.service.atualizar = jest.fn().mockResolvedValue(mockData);

        await tipoDemandaController.atualizar(req, res);

        expect(tipoDemandaController.service.atualizar).toHaveBeenCalledTimes(1);
        expect(tipoDemandaController.service.atualizar).toHaveBeenCalledWith(req.params.id, req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'TipoDemanda atualizada com sucesso.',
            data: mockData,
            errors: []
        });
    });
    
    it('deve deletar uma tipoDemanda', async () => {
        const mockData = { id: '6832ad0c109564baed4cda0e' };
        req.params = { id: '6832ad0c109564baed4cda0e' };
        tipoDemandaController.service.deletar = jest.fn().mockResolvedValue(mockData);

        await tipoDemandaController.deletar(req, res);

        expect(tipoDemandaController.service.deletar).toHaveBeenCalledTimes(1);
        expect(tipoDemandaController.service.deletar).toHaveBeenCalledWith(req.params.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 200,
            message: 'TipoDemanda excluída com sucesso.',
            data: mockData,
            errors: []
        });
    });

    describe('Testes complementares para tipoDemandaController', () => {
        it('deve listar sem validar ID quando não houver parâmetro', async () => {
            const mockData = [{ id: '1', titulo: 'tipoDemanda' }];
            tipoDemandaController.service.listar.mockResolvedValue(mockData);

            await tipoDemandaController.listar(req, res);

            expect(tipoDemandaController.service.listar).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve listar sem validar query quando não houver query params', async () => {
            const mockData = [{ id: '1', titulo: 'tipoDemanda' }];
            tipoDemandaController.service.listar.mockResolvedValue(mockData);

            await tipoDemandaController.listar(req, res);

            expect(tipoDemandaController.service.listar).toHaveBeenCalledWith(req);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve lidar com erro ao transformar objeto no criar', async () => {
            req.body = { titulo: 'tipoDemanda', email: 'test@test.com' };
            tipoDemandaController.service.criar.mockResolvedValue({
                _doc: { id: '1', titulo: 'tipoDemanda' },
                toObject: jest.fn().mockImplementation(() => {
                    throw new Error('Erro ao transformar');
                })
            });

            await expect(tipoDemandaController.criar(req, res)).rejects.toThrowError(
                expect.objectContaining({
                    issues: expect.arrayContaining([
                    expect.objectContaining({ path: ['descricao'], message: 'Required' }),
                    expect.objectContaining({ path: ['subdescricao'], message: 'Required' }),
                    expect.objectContaining({ path: ['icone'], message: 'Required' }),
                    ])
                })
            );
        });

        it('deve lidar com erro inesperado no service.criar', async () => {
            req.body = {
                titulo: "Teste",
                descricao: "Descrição",
                subdescricao: "Subdescrição",
                icone: "icone.png",
                link_imagem: "imagem.png",
                tipo: "Algum tipo"
            };

            tipoDemandaController.service.criar = jest.fn().mockRejectedValue(new Error('Erro inesperado'));

            await expect(tipoDemandaController.criar(req, res)).rejects.toThrow('Erro inesperado');
        });

        it('deve lidar com erro inesperado no service.atualizar', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = { titulo: 'tipoDemanda Atualizada' };
            tipoDemandaController.service.atualizar.mockRejectedValue(new Error('Erro inesperado'));
            
            await expect(tipoDemandaController.atualizar(req, res)).rejects.toThrow('Erro inesperado');
        });

        it('deve lidar com erro inesperado no service.deletar', async () => {
            req.params.id = '507f1f77bcf86cd799439011';
            tipoDemandaController.service.deletar.mockRejectedValue(new Error('Erro inesperado'));
            
            await expect(tipoDemandaController.deletar(req, res)).rejects.toThrow('Erro inesperado');
        });

         it('deve lançar CustomError quando ID não for fornecido no deletar', async () => {
            jest.spyOn(TipoDemandaIDSchema, 'parse').mockImplementation(() => true);
            
            req.params = {};
            
            try {
                await tipoDemandaController.deletar(req, res);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.BAD_REQUEST.code);
                expect(error.customMessage).toMatch("ID da TipoDemanda é obrigatório para deletar.");
            }
            
            expect(tipoDemandaController.service.deletar).not.toHaveBeenCalled();
            jest.restoreAllMocks();
        });

        it('deve lidar com erro de validação do Zod no deletar', async () => {
            req.params = { id: 'id-invalido' };
            
            await expect(tipoDemandaController.deletar(req, res)).rejects.toThrow();
            expect(tipoDemandaController.service.deletar).not.toHaveBeenCalled();
        });
    });
});
