import UsuarioService from '../../service/UsuarioService.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../../../src/utils/helpers/index.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../../utils/validators/schemas/zod/UsuarioSchema.js';
import UsuarioController from '../../controllers/UsuarioController.js';

jest.mock('../../service/UsuarioService.js');

describe('controller', () => {
  let controller;
  let req;
  let res;
  let next;
  let serviceStub;

  beforeEach(() => {
    // Create a new controller instance and override its service with a stub.
    controller = new UsuarioController();
    serviceStub = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      processarFoto: jest.fn()
    };
    controller.service = serviceStub;

    req = { params: {}, query: {}, body: {}, files: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      sendFile: jest.fn()
    };
    next = jest.fn();
  });

    // Testes para o método listar
    describe('listar', () => {
        it('deve listar usuários com sucesso', async () => {
            const mockData = [{ id: '507f1f77bcf86cd799439011', nome: 'Usuário Teste' }];
            controller.service.listar.mockResolvedValue(mockData);

            await controller.listar(req, res);

            expect(controller.service.listar).toHaveBeenCalledTimes(1);
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
                await controller.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('ID inválido');
            }
        });

        it('deve validar a query nome do usuario', async () => {
            req.query = { nome: '' }; 
            try {
                await controller.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Nome não pode ser vazio');
            }
        });

        it('deve validar a query email do usuario', async () => {
            req.query = { email: '' }; 
            try {
                await controller.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Formato de email inválido.');
            }
        });
        it('deve validar a query nivel_acesso do usuario', async () => {
            req.query = { nivel_acesso: '' }; 
            try {
                await controller.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Nível de acesso inválido.');
            }
        });
        it('deve validar a query cargo do usuario', async () => {
            req.query = { cargo: '' }; 
            try {
                await controller.listar(req, res);
            } catch (error) {
                expect(error.errors[0].message).toBe('Cargo não pode ser vazio.');
            }
        });
        it('deve validar a query formacao do usuario', async () => {
            req.query = { formacao: '' }; 
            try {
                await controller.listar(req, res);
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
            controller.service.criar.mockResolvedValue(mockData);

            await controller.criar(req, res);

            expect(controller.service.criar).toHaveBeenCalledWith(validUserData);
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
            controller.service.atualizar.mockResolvedValue(mockData);

            await controller.atualizar(req, res);

            expect(controller.service.atualizar).toHaveBeenCalledWith(
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
            
            controller.service.deletar.mockResolvedValue(mockData);

            await controller.deletar(req, res);

            expect(controller.service.deletar).toHaveBeenCalledWith(req.params.id);
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
                await controller.deletar(req, res);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect(error.statusCode).toBe(HttpStatusCodes.BAD_REQUEST.code);
                expect(error.customMessage).toMatch("ID do usuário é obrigatório para deletar.");
            }
            
            expect(controller.service.deletar).not.toHaveBeenCalled();
            jest.restoreAllMocks();
        });
    });

    ///*
    describe('fotoUpload', () => {
    it('deve processar o upload da foto e retornar resposta de sucesso', async () => {
      req.params = { id: '123' };
      req.files = { file: { name: 'photo.jpg' } };

      const fakeProcessResult = {
        fileName: 'unique_photo.jpg',
        metadata: { width: 100, height: 100 }
      };
      serviceStub.processarFoto.mockResolvedValue(fakeProcessResult);

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      await controller.fotoUpload(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.processarFoto).toHaveBeenCalledWith('123', req.files.file);
      expect(successSpy).toHaveBeenCalledWith(res, {
        message: 'Arquivo recebido e usuário atualizado com sucesso.',
        dados: { link_foto: fakeProcessResult.fileName },
        metadados: fakeProcessResult.metadata
      });

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    });

    it('deve chamar next com erro se nenhum arquivo for enviado', async () => {
      req.params = { id: '123' };
      req.files = {};

      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});
      await controller.fotoUpload(req, res, next);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(CustomError);
      expect(error.customMessage).toBe('Nenhum arquivo foi enviado.');

      idParseSpy.mockRestore();
    });
  });

  describe('getFoto', () => {
    it('deve enviar o arquivo se a foto existir', async () => {
      req.params = { id: '123' };
      const fakeUsuario = { link_foto: 'photo.jpg' };
      serviceStub.listar.mockResolvedValue(fakeUsuario);
      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});

      await controller.getFoto(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(res.setHeader).toHaveBeenCalled();
      expect(res.sendFile).toHaveBeenCalled();

      idParseSpy.mockRestore();
    });

    it('deve chamar next com erro se a foto não for encontrada', async () => {
      req.params = { id: '123' };
      const fakeUsuario = {}; // no link_foto
      serviceStub.listar.mockResolvedValue(fakeUsuario);
      const idParseSpy = jest.spyOn(UsuarioIdSchema, 'parse').mockImplementation(() => {});

      await controller.getFoto(req, res, next);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(CustomError);
      expect(error.customMessage).toBe('Foto do usuário não encontrada.');

      idParseSpy.mockRestore();
    });
  });
});