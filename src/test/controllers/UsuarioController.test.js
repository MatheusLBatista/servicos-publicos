import UsuarioService from '../../service/UsuarioService.js';
import UsuarioController from '../../controllers/UsuarioController.js';
import { 
    CustomError, 
    HttpStatusCodes 
} from '../../../src/utils/helpers/index.js';
import { 
    UsuarioQuerySchema, 
    UsuarioIdSchema 
} from '../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { 
    UsuarioSchema, 
    UsuarioUpdateSchema 
} from '../../utils/validators/schemas/zod/UsuarioSchema.js';
import { ZodError } from 'zod';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../../src/utils/logger.js', () => ({
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
}));

jest.mock('sharp', () => {
  const sharpMock = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({}),
  }));
  return sharpMock;
});

jest.mock('winston-daily-rotate-file', () => jest.fn(() => ({
  on: jest.fn()
})));

jest.mock('fs');
jest.mock('uuid', () => ({ v4: () => 'mocked-uuid' }));
jest.mock('sharp');
jest.mock('../../service/UsuarioService.js');

describe('UsuarioController', () => {
  let req, res, usuarioController, next;

  beforeEach(() => {
    req = { 
      params: {}, 
      body: {},
      query: {},
      files: {} 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      sendFile: jest.fn()
    };
    next = jest.fn();
    UsuarioService.mockClear();
    usuarioController = new UsuarioController();
  });

    // Testes para o método listar
    describe('listar', () => {
        it('deve listar usuários com sucesso', async () => {
            const mockData = [{ id: '507f1f77bcf86cd799439011', nome: 'Usuário Teste' }];
            usuarioController.service.listar.mockResolvedValue(mockData);

            await usuarioController.listar(req, res);

            expect(usuarioController.service.listar).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Requisição bem-sucedida',
                data: mockData,
                errors: []
            });
        });

        it('deve validar o ID de usuario', async () => {
            req.params.id = 'invalid-id';
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('ID inválido');
            }
        });

        it('deve validar a query nome do usuario', async () => {
            req.query = { nome: '' }; 
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Nome não pode ser vazio');
            }
        });

        it('deve validar a query email do usuario', async () => {
            req.query = { email: '' }; 
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Formato de email inválido.');
            }
        });
        it('deve validar a query nivel_acesso do usuario', async () => {
            req.query = { nivel_acesso: '' }; 
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Nível de acesso inválido.');
            }
        });
        it('deve validar a query cargo do usuario', async () => {
            req.query = { cargo: '' }; 
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Cargo não pode ser vazio.');
            }
        });
        it('deve validar a query formacao do usuario', async () => {
            req.query = { formacao: '' }; 
            try {
                await usuarioController.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Formação não pode ser vazio.');
            }
        });
    });

    describe('criar', () => {
        const validUserData = {
            nome: 'Novo Usuário',
            email: 'novo@email.com',
            senha: 'Senha@123',
            cpf: '12345678909',
            celular: '11999999999',
            endereco: {
                logradouro: 'Rua Teste',
                cep: '12345678',
                bairro: 'Centro',
                numero: 123,
                cidade: 'São Paulo',
                estado: 'SP'
            },
            cnh: "12345678910"
        };

        it('deve criar novo usuário com sucesso', async () => {
            const mockData = {
                _id: '507f1f77bcf86cd799439011',
                ...validUserData,
                toObject: jest.fn().mockReturnValue({
                    id: '507f1f77bcf86cd799439011',
                    nome: 'Novo Usuário'
                })
            };
            
            req.body = validUserData;
            usuarioController.service.criar.mockResolvedValue(mockData);

            await usuarioController.criar(req, res);

            expect(usuarioController.service.criar).toHaveBeenCalledWith(validUserData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Recurso criado com sucesso',
                data: { id: '507f1f77bcf86cd799439011', nome: 'Novo Usuário' },
                errors: []
            });
        });
    });

    describe('atualizar', () => {
        const updateData = {
            nome: 'Usuário Atualizado'
        };

        it('deve atualizar usuário com sucesso', async () => {
            const mockData = {
                _id: '507f1f77bcf86cd799439011',
                ...updateData,
                toObject: jest.fn().mockReturnValue({
                    id: '507f1f77bcf86cd799439011',
                    nome: 'Usuário Atualizado'
                })
            };
            
            req.params.id = '507f1f77bcf86cd799439011';
            req.body = updateData;
            usuarioController.service.atualizar.mockResolvedValue(mockData);

            await usuarioController.atualizar(req, res);

            expect(usuarioController.service.atualizar).toHaveBeenCalledWith(
                req.params.id, 
                updateData
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário atualizado com sucesso.',
                data: { id: '507f1f77bcf86cd799439011', nome: 'Usuário Atualizado' },
                errors: []
            });
        });
    });

    describe('deletar', () => {
        it('deve deletar usuário com sucesso', async () => {
            const mockData = { id: '507f1f77bcf86cd799439011' };
            req.params.id = '507f1f77bcf86cd799439011';
            
            usuarioController.service.deletar.mockResolvedValue(mockData);

            await usuarioController.deletar(req, res);

            expect(usuarioController.service.deletar).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário excluído com sucesso.',
                data: mockData,
                errors: []
            });
        });
        it('deve lançar CustomError quando ID não for fornecido no deletar', async () => {
            jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => true);
            
            req.params = {};
            
            try {
                await usuarioController.deletar(req, res);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.BAD_REQUEST.code);
                expect(error.customMessage).toMatch("ID do usuário é obrigatório para deletar.");
            }
            
            expect(usuarioController.service.deletar).not.toHaveBeenCalled();
            jest.restoreAllMocks();
        });
    });

    /*
    describe('fotoUpload', () => {

        it('deve chamar next com erro quando a extensão do arquivo for inválida', async () => { 
            const mockFile = {
                name: 'foto.pdf', // extensão inválida
                data: fs.readFileSync(path.resolve(__dirname, 'mocks', 'foto.png')),
                size: 12345,
                md5: 'fake-md5-hash',
            };

            const req = {
                params: { id: '6839c69706ec18da71924834' },
                files: { file: mockFile },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const next = jest.fn();

            const usuarioController = new UsuarioController();

            await usuarioController.fotoUpload(req, res, next);

            expect(next).toHaveBeenCalled();
            
            const error = next.mock.calls[0][0];

            expect(error).toBeInstanceOf(CustomError);
            expect(error.customMessage).toBe('Extensão de arquivo inválida. Permitido: jpg, jpeg, png, svg.');

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            });

        
        it('deve chamar next com erro se nenhum arquivo for enviado', async () => {
        req.params = { id: '123' };
        req.files = {};

        const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});

        await usuarioController.fotoUpload(req, res, next);

        expect(next).toHaveBeenCalled();
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(CustomError);
        expect(error.customMessage).toBe('Nenhum arquivo foi enviado.');

        idParseSpy.mockRestore();
        });
    });

    
    // Testes para o método getFoto
    describe('getFoto', () => {
        it('deve retornar foto com sucesso', async () => {
            const mockUser = {
                link_foto: 'foto.jpg'
            };
            
            req.params.id = '507f1f77bcf86cd799439011';
            usuarioController.service.listar.mockResolvedValue(mockUser);

            await usuarioController.getFoto(req, res, next);

            expect(res.sendFile).toHaveBeenCalled();
        });

        it('deve lidar com foto não encontrada', async () => {
            const mockUser = {
                link_foto: null
            };
            
            req.params.id = '507f1f77bcf86cd799439011';
            usuarioController.service.listar.mockResolvedValue(mockUser);

            await usuarioController.getFoto(req, res, next);
            
            expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        });
    });
    */
});