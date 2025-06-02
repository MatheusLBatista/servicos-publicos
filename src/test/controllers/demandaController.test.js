import DemandaController from "../../controllers/DemandaController";
import DemandaService from "../../service/DemandaService";
import { beforeEach, describe, expect, jest } from '@jest/globals'
import { DemandaIdSchema, DemandaQuerySchema } from "../../utils/validators/schemas/zod/querys/DemandaQuerySchema";
import { DemandaSchema, DemandaUpdateSchema } from "../../utils/validators/schemas/zod/DemandaSchema";
import { CommonResponse, CustomError, HttpStatusCodes } from "../../utils/helpers";

describe("DemandaController", ()=> {
  let controller;
  let res;
  let req;
  let serviceStub;

  beforeEach(() => {
    controller = new DemandaController();
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

    //todo: revisar esse listar
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
    it('deve analisar o corpo da requisição, criar o usuário e retornar o resultado de "created"', async() => {
      const fakeDemandaData = { tipo: 'Iluminação', status: 'Em andamento', toObject() { return { tipo: 'Iluminação', status: 'Em andamento' } } };
      serviceStub.criar.mockResolvedValue(fakeDemandaData); // CORRETO
      req.body = { tipo: 'Iluminação', status: 'Em andamento' };

      const schemaParseSpy = jest.spyOn(DemandaSchema, 'parse').mockReturnValue(req.body);
      const createdSpy = jest.spyOn(CommonResponse, 'created').mockImplementation((res, data) => {
        res.status(201).json(data)
      });
      
      await controller.criar(req, res);
      expect(schemaParseSpy).toHaveBeenCalledWith(req.body);
      expect(serviceStub.criar).toHaveBeenCalledWith(req.body);

      const returnedData = fakeDemandaData.toObject();
      expect(createdSpy).toHaveBeenCalledWith(res, returnedData);

      schemaParseSpy.mockRestore();
      createdSpy.mockRestore();
    })
  })

  describe('atualizar', () => {
    it('deve atualizar um usuário e retornar resposta de sucesso', async() => {
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
      expect(serviceStub.atualizar).toHaveBeenCalledWith('123', req.body);

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
    it('deve excluir uma demanda e retornar resposta de sucesso.', async() => {
      const fakeDeleteData = { success: true };
      serviceStub.deletar.mockResolvedValue(fakeDeleteData);
      req.params = { id: '123' }
      const idParseSpy = jest.spyOn(DemandaIdSchema, 'parse').mockImplementation(() => {})
      const successSpy = jest.spyOn(CommonResponse, 'success').mockImplementation((res, data, code, msg) => {
        res.status(code).json( { data, message: msg } )
      });

      await controller.deletar(req, res);
      
      expect(idParseSpy).toHaveBeenCalledWith('123');
      expect(serviceStub.deletar).toHaveBeenCalledWith('123');
      expect(successSpy).toHaveBeenCalledWith(
        res,
        fakeDeleteData,
        200,
        expect.stringContaining('Demanda excluída com sucesso!')
      )

      idParseSpy.mockRestore();
      successSpy.mockRestore();
    })
  })

})