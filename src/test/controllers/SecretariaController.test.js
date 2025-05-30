import SecretariaService from '../../service/SecretariaService.js';
import SecretariaController from '../../controllers/SecretariaController.js';
import { jest } from '@jest/globals';
import { SecretariaIDSchema, SecretariaQuerySchema } from '../../utils/validators/schemas/zod/querys/SecretariaQuerySchema.js';
import { SecretariaSchema, SecretariaUpdateSchema } from '../../utils/validators/schemas/zod/SecretariaSchema.js';

jest.mock('../../service/SecretariaService.js');

describe('SecretariaController', () => {
    let req, res, secretariaController;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        SecretariaService.mockClear();
        secretariaController = new SecretariaController();
    });
    

    it('deve listar secretarias', async () => {
        const mockData = [{ id: '6832ad0c109564baed4cda0e', nome: 'Secretaria 1' }];
        secretariaController.service.listar.mockResolvedValue(mockData);

        await secretariaController.listar(req, res);

        expect(secretariaController.service.listar).toHaveBeenCalledTimes(1);
        expect(secretariaController.service.listar).toHaveBeenCalledWith(req);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 200,
            message: 'Requisição bem-sucedida',
            data: mockData,
            errors: []
        });
    });

    it('deve validar o ID da secretaria', async () => {
        req.params.id = 'invalid-id';
        try {
            await secretariaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('ID inválido');
        }
    });

    it('deve validar a query nome da secretaria', async () => {
        req.query = { nome: '' }; // Query inválida
        try {
            await secretariaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('Nome não pode ser vazio');
        }
    });

    it('deve validar a query tipo da secretaria', async () => {
        req.query = { tipo: '' }; // Query inválida
        try {
            await secretariaController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('Tipo não pode ser vazio');
        }
    });

    it('deve criar uma nova secretaria', async () => {
        const mockData = { id: '6832ad0c109564baed4cda0e', nome: 'Secretaria 1' };
        req.body = { nome: 'Secretaria 1', email: 'secretaria@gmail.com', telefone: '(99) 99999-9999', sigla: "SEC" };
        //secretariaController.service.criar = jest.fn().mockResolvedValue(mockData);

        secretariaController.service.criar = jest.fn().mockResolvedValue({
            _doc: { 
              id: '6832ad0c109564baed4cda0e', 
              nome: 'Secretaria 1' 
            },
            toObject: function() { 
              return this._doc; 
            }
          });

        await secretariaController.criar(req, res);

        expect(secretariaController.service.criar).toHaveBeenCalledTimes(1);
        expect(secretariaController.service.criar).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 201,
            message: 'Recurso criado com sucesso',
            data: mockData,
            errors: []
        });
    });

    it('deve atualizar uma secretaria', async () => {
        const mockData = { id: '6832ad0c109564baed4cda0e', nome: 'Secretaria Atualizada' };
        req.params.id = '6832ad0c109564baed4cda0e';
        req.body = { nome: 'Secretaria Atualizada', email: 'secretaria@gmail.com', telefone: '(99) 99999-9999', sigla: "SECAT" };
        secretariaController.service.atualizar = jest.fn().mockResolvedValue(mockData);

        await secretariaController.atualizar(req, res);

        expect(secretariaController.service.atualizar).toHaveBeenCalledTimes(1);
        expect(secretariaController.service.atualizar).toHaveBeenCalledWith(req.params.id, req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 200,
            message: 'Secretaria atualizada com sucesso.',
            data: mockData,
            errors: []
        });
    });
    
    it('deve deletar uma secretaria', async () => {
        const mockData = { id: '6832ad0c109564baed4cda0e' };
        req.params = { id: '6832ad0c109564baed4cda0e' }; // Apenas o ID é necessário
        secretariaController.service.deletar = jest.fn().mockResolvedValue(mockData);

        await secretariaController.deletar(req, res);

        expect(secretariaController.service.deletar).toHaveBeenCalledTimes(1);
        expect(secretariaController.service.deletar).toHaveBeenCalledWith(req.params.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            //error: false,
            //code: 200,
            message: 'Secretaria excluída com sucesso.',
            data: mockData,
            errors: []
        });
    });
});
