import SecretariaService from '../../service/SecretariaService.js';
import SecretariaController from '../../controllers/SecretariaController.js';
import { jest } from '@jest/globals';
import { SecretariaIDSchema, SecretariaQuerySchema } from '../../utils/validators/schemas/zod/querys/SecretariaQuerySchema.js';

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
        const mockData = [{ id: '67959501ea0999e0a0fa9f58', nome: 'Secretaria 1' }];
        secretariaController.service.listar.mockResolvedValue(mockData);

        await secretariaController.listar(req, res);

        expect(secretariaController.service.listar).toHaveBeenCalledTimes(1);
        expect(secretariaController.service.listar).toHaveBeenCalledWith(req);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            error: false,
            code: 200,
            message: 'Requisição bem-sucedida',
            data: mockData,
            errors: []
        });
    });

    it('deve validar o ID do cliente', async () => {
        req.params.id = 'invalid-id';
        try {
            await clienteController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('ID inválido');
        }
    });

    it('deve validar a query do cliente', async () => {
        req.query = { nome: '' }; // Query inválida
        try {
            await clienteController.listar(req, res);
        } catch (error) {
            expect(error.errors[0].message).toBe('Nome não pode ser vazio');
        }
    });

    it('deve criar um novo cliente', async () => {
        const mockData = { id: '67959501ea0999e0a0fa9f58', nome: 'Cliente 1' };
        req.body = { nome: 'Cliente 1', email: 'cliente1@gmail.com', telefone: '(99) 99999-9999', cpf: '269.697.080-71', endereco: 'Rua Exemplo, 123', ativo: true };
        clienteController.service.criar = jest.fn().mockResolvedValue(mockData);

        await clienteController.criar(req, res);

        expect(clienteController.service.criar).toHaveBeenCalledTimes(1);
        expect(clienteController.service.criar).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            error: false,
            code: 201,
            message: 'Recurso criado com sucesso',
            data: mockData,
            errors: []
        });
    });

    it('deve atualizar um cliente', async () => {
        const mockData = { id: '67959501ea0999e0a0fa9f58', nome: 'Cliente Atualizado' };
        req.params.id = '67959501ea0999e0a0fa9f58';
        req.body = { nome: 'Cliente Atualizado', email: 'cliente1@gmail.com', telefone: '(99) 99999-9999', cpf: '269.697.080-71', endereco: 'Rua Exemplo, 123', ativo: true };
        clienteController.service.atualizar = jest.fn().mockResolvedValue(mockData);

        await clienteController.atualizar(req, res);

        expect(clienteController.service.atualizar).toHaveBeenCalledTimes(1);
        expect(clienteController.service.atualizar).toHaveBeenCalledWith(req.body, req.params.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            error: false,
            code: 200,
            message: 'Requisição bem-sucedida',
            data: mockData,
            errors: []
        });
    });

    it('deve deletar um cliente', async () => {
        const mockData = { id: '67959501ea0999e0a0fa9f58' };
        req.params = { id: '67959501ea0999e0a0fa9f58' }; // Apenas o ID é necessário
        clienteController.service.deletar = jest.fn().mockResolvedValue(mockData);

        await clienteController.deletar(req, res);

        expect(clienteController.service.deletar).toHaveBeenCalledTimes(1);
        expect(clienteController.service.deletar).toHaveBeenCalledWith(req.params.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            error: false,
            code: 200,
            message: 'Cliente excluído com sucesso.',
            data: mockData,
            errors: []
        });
    });

    // Adicione mais testes para cobrir outros ramos do código
});
