import DemandaController from "../../controllers/DemandaController";
import DemandaService from "../../service/DemandaService";
import { beforeEach, describe, expect, jest } from '@jest/globals'
import { DemandaIdSchema, DemandaQuerySchema } from "../../utils/validators/schemas/zod/querys/DemandaQuerySchema.js";
import { DemandaSchema, DemandaUpdateSchema } from "../../utils/validators/schemas/zod/DemandaSchema.js";
import { CommonResponse, CustomError, HttpStatusCodes } from "../../utils/helpers";
import path from 'path';

describe("DemandaController", ()=> {
  let controller;
  let res;
  let req;
  let serviceStub;

  beforeEach(() => {
    controller = new DemandaController();
    controller.service = {
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn()
    };
    serviceStub = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      processarFotos: jest.fn()
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

  describe('listar', () => {
    it('deve chamar o service.listar e retornar sucesso', async () => {
      const fakeData = { demandas: ['user1', 'user2'] };
      serviceStub.listar.mockResolvedValue(fakeData);
      req.params = {};
      req.query = {};

      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      const idSpy = jest.spyOn(DemandaIdSchema, 'parse');
      
      await controller.listar(req, res);

      expect(idSpy).not.toHaveBeenCalled();
      expect(serviceStub.listar).toHaveBeenCalledWith(req);
      expect(successSpy).toHaveBeenCalledWith(res, fakeData);

      successSpy.mockRestore();
      idSpy.mockRestore();
    })

    it('deve validar o id quando for fornecedio', async ()=> {
      const fakeData = { demanda: 'demanda1' };
      serviceStub.listar.mockResolvedValue(fakeData);

      req.params = { id: '123' };

      const idParsedSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});

      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      await controller.listar(req, res);
      expect(idParsedSpy).toHaveBeenCalledWith('123');

      idParsedSpy.mockRestore();
      successSpy.mockRestore();
    });

    it('deve validar o id no listar quando req.params.id estiver presente', async() => {
      req.params = { id: '123' };
      req.query = {};

      const idParsedSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});
      serviceStub.listar.mockResolvedValue([{ tipo: 'x' }]);

      await controller.listar(req, res);

      expect(idParsedSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.listar).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar deletar sem id', async () => {
      req.params = {};

      await expect(controller.deletar(req, res)).rejects.toThrow(CustomError);
    })

    it('deve validar a query no listar quando req.query tiver parâmetros', async() => {
      req.params = {};
      req.query = { status: 'Em andamento' };

      const queryParseSpy = jest.spyOn(DemandaQuerySchema, 'parseAsync').mockResolvedValue(req.query);
      serviceStub.listar.mockResolvedValue([{ tipo: 'x', status: 'Em andamento' }])

      await controller.listar(req, res); 
      
      expect(queryParseSpy).toHaveBeenCalledWith(req.query);
      expect(serviceStub.listar).toHaveBeenCalled();
    })

    it('deve listar uma demanda sem query', async () => {
      jest.spyOn(CommonResponse, 'success').mockImplementation(() => {});

      req.params = {};
      req.query = {};
      const fakeData = { id: '123', tipo: 'Iluminação' };
      serviceStub.listar.mockResolvedValue(fakeData);

      await controller.listar(req, res);

      expect(serviceStub.listar).toHaveBeenCalled();
      expect(CommonResponse.success).toHaveBeenCalledWith(res, fakeData);

      CommonResponse.success.mockRestore(); 
    });


    it('deve lançar erro ao tentar deletar sem id', async () => {
      req.params = {};
      expect(() => controller.deletar(req, res)).rejects.toThrow(CustomError);
    });

    it('deve lidar com ausência de req.params no listar', async () => {
      req.params = undefined;
      req.query = {};
      serviceStub.listar.mockResolvedValue([]);
      await controller.listar(req, res);
      expect(serviceStub.listar).toHaveBeenCalled();
    });
    
  })

  describe('criar', () => {
    it('deve analisar o corpo da requisição, criar a demanda e retornar o resultado de "created"', async () => {
      const fakeDemandaData = { tipo: 'Iluminação', status: 'Em andamento' };

      const mockData = {
        _id: '507f1f77bcf86cd799439011',
        ...fakeDemandaData,
        toObject: jest.fn().mockReturnValue({
          id: '507f1f77bcf86cd799439011',
          tipo: 'Iluminação'
        })
      };

      req.body = fakeDemandaData;

      controller.service = {
        criar: jest.fn().mockResolvedValue(mockData)
      };

      const schemaParseSpy = jest.spyOn(DemandaSchema, 'parse').mockReturnValue(req.body);
      const createdSpy = jest.spyOn(CommonResponse, 'created').mockImplementation((res, data) => {
        res.status(201).json({
          message: 'Recurso criado com sucesso',
          data,
          errors: []
        });
      });

      await controller.criar(req, res);

      expect(schemaParseSpy).toHaveBeenCalledWith(fakeDemandaData);
      expect(controller.service.criar).toHaveBeenCalledWith(fakeDemandaData, req);  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Recurso criado com sucesso',
        data: { id: '507f1f77bcf86cd799439011', tipo: 'Iluminação' },
        errors: []
      });

      schemaParseSpy.mockRestore();
      createdSpy.mockRestore();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar uma demanda e retornar resposta de sucesso', async() => {
      const fakeUpdatedData = { tipo: 'Iluminação', status: 'Concluída', toObject() { return { tipo: 'Iluminação', status: 'Concluída' } } };
      serviceStub.atualizar.mockResolvedValue(fakeUpdatedData);
      req.params = { id: '123' };
      req.body = { tipo: 'Iluminação' };

      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});
      const updateSchemaSpy = jest.spyOn(DemandaUpdateSchema, 'parse').mockReturnValue(req.body);
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      await controller.atualizar(req, res);
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(updateSchemaSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.atualizar).toHaveBeenCalledWith('123', req.body, req);

      const returnedData = fakeUpdatedData.toObject();
      delete returnedData.tipo;
      delete returnedData.data;
      expect(successSpy).toHaveBeenCalledWith(
        res,
        returnedData,
        200,
        expect.stringContaining('Demanda atualizada com sucesso!')
      );

      idParseSpy.mockRestore();
      updateSchemaSpy.mockRestore();
      successSpy.mockRestore();
    })
  })

  describe('deletar', () => {
    it('deve excluir uma demanda e retornar resposta de sucesso.', async () => {
      const fakeDeleteData = { success: true };

      req.params = { id: '123' };

      controller.service = {
        deletar: jest.fn().mockResolvedValue(fakeDeleteData)
      };

      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockReturnValue('123');
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg, errors: [] });
      });

      await controller.deletar(req, res);

      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(controller.service.deletar).toHaveBeenCalledWith('123', req);
      expect(successSpy).toHaveBeenCalledWith(
        res,
        fakeDeleteData,
        200,
        expect.stringContaining('Demanda excluída com sucesso')
      );

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('atribuir', () => {
    it('deve atribuir uma demanda com sucesso', async () => {
      const fakeDemanda = { toObject: () => ({ id: '123', status: 'Atribuída' }) };
      req.params = { id: '123' };
      req.body = { status: 'Atribuída' };

      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});
      const updateSchemaSpy = jest.spyOn(DemandaUpdateSchema, 'parse').mockReturnValue(req.body);
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      serviceStub.atribuir = jest.fn().mockResolvedValue(fakeDemanda);
      controller.service = serviceStub;

      await controller.atribuir(req, res);

      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(updateSchemaSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.atribuir).toHaveBeenCalledWith('123', req.body, req);
      expect(successSpy).toHaveBeenCalledWith(res, { id: '123', status: 'Atribuída' }, 200, "Demanda atribuída com sucesso!");

      idParseSpy.mockRestore();
      updateSchemaSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('devolver', () => {
    it('deve devolver uma demanda com sucesso', async () => {
      const fakeDemanda = { toObject: () => ({ id: '123', status: 'Devolvida' }) };
      req.params = { id: '123' };
      req.body = { status: 'Devolvida' };

      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});
      const updateSchemaSpy = jest.spyOn(DemandaUpdateSchema, 'parse').mockReturnValue(req.body);
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      serviceStub.devolver = jest.fn().mockResolvedValue(fakeDemanda);
      controller.service = serviceStub;

      await controller.devolver(req, res);

      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(updateSchemaSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.devolver).toHaveBeenCalledWith('123', req.body, req);
      expect(successSpy).toHaveBeenCalledWith(res, { id: '123', status: 'Devolvida' }, 200, "Demanda devolvida com sucesso!");

      idParseSpy.mockRestore();
      updateSchemaSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('resolver', () => {
    it('deve resolver uma demanda com sucesso', async () => {
      const fakeDemanda = { toObject: () => ({ id: '123', status: 'Resolvida' }) };
      req.params = { id: '123' };
      req.body = { status: 'Resolvida' };

      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {});
      const updateSchemaSpy = jest.spyOn(DemandaUpdateSchema, 'parse').mockReturnValue(req.body);
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json({ data, message: msg });
      });

      serviceStub.resolver = jest.fn().mockResolvedValue(fakeDemanda);
      controller.service = serviceStub;

      await controller.resolver(req, res);

      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(updateSchemaSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.resolver).toHaveBeenCalledWith('123', req.body, req);
      expect(successSpy).toHaveBeenCalledWith(res, { id: '123', status: 'Resolvida' }, 200, "Demanda resolvida com sucesso!");

      idParseSpy.mockRestore();
      updateSchemaSpy.mockRestore();
      successSpy.mockRestore();
    });
  });

  describe('fotoUpload', () => {
    it('deve fazer upload de uma foto com sucesso', async () => {
      const req = {
        params: { id: '123', tipo: 'denuncia' },
        files: { file: { name: 'imagem.png', buffer: Buffer.from('file') } },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const mockFileName = 'imagem_123.png';
      const mockMetadata = { tamanho: 1024 };

      jest.spyOn(DemandaIdSchema, 'parse').mockReturnValue('123');
      controller.service.processarFoto = jest.fn().mockResolvedValue({
        fileName: mockFileName,
        metadata: mockMetadata
      });
      jest.spyOn(CommonResponse, 'success').mockImplementation((res, payload) => {
        res.status(200).json(payload);
      });

      await controller.fotoUpload(req, res, next);

      expect(DemandaIdSchema.parse).toHaveBeenCalledWith('123');
      expect(controller.service.processarFoto).toHaveBeenCalledWith('123', req.files.file, 'denuncia', req);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Arquivo enviado e salvo com sucesso.',
        dados: { link_imagem: mockFileName },
        metadados: mockMetadata
      });
    });

    it('deve retornar erro se nenhum arquivo for enviado', async () => {
      const req = { params: { id: '123', tipo: 'denuncia' }, files: {} };
      const res = {};
      const next = jest.fn();

      jest.spyOn(DemandaIdSchema, 'parse').mockReturnValue('123');

      await controller.fotoUpload(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        field: 'file',
        customMessage: 'Nenhum arquivo foi enviado.'
      }));
    });
  });

  describe('getFoto', () => {
    it('deve fazer download da imagem da denúncia', async () => {
      const req = {
        params: { id: '123', tipo: 'denuncia' },
        user_id: 'user_1'
      };
      const res = { setHeader: jest.fn(), sendFile: jest.fn() };
      const next = jest.fn();

      const fileName = 'imagem_123.png';
      const fullPath = path.join(__dirname, '..', '..', 'uploads', fileName);

      jest.spyOn(DemandaIdSchema, 'parse').mockReturnValue('123');
      controller.service.listar = jest.fn().mockResolvedValue({
        link_imagem: fileName
      });

      await controller.getFoto(req, res, next);

      expect(DemandaIdSchema.parse).toHaveBeenCalledWith('123');
      expect(controller.service.listar).toHaveBeenCalledWith({
        params: { id: '123' },
        user_id: 'user_1'
      });
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(res.sendFile).toHaveBeenCalledWith(expect.stringContaining('uploads/imagem_123.png'));
    });

    it('deve retornar erro se imagem não for encontrada', async () => {
      const req = { params: { id: '123', tipo: 'resolucao' }, user_id: 'user_1' };
      const res = {};
      const next = jest.fn();

      jest.spyOn(DemandaIdSchema, 'parse').mockReturnValue('123');
      controller.service.listar = jest.fn().mockResolvedValue({
        link_imagem_resolucao: null
      });

      await controller.getFoto(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        field: 'link_imagem_resolucao',
        customMessage: expect.stringContaining('Imagem de resolucao não encontrada.')
      }));
    });
  });
})