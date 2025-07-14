import GrupoController from '../../controllers/GrupoController.js';
import GrupoService from '../../service/GrupoService.js';
import { GrupoIDSchema, GrupoQuerySchema } from '../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';
import { GrupoSchema, GrupoUpdateSchema } from '../../utils/validators/schemas/zod/GrupoSchema.js';
import CommonResponse from '../../utils/helpers/CommonResponse.js';

jest.mock('../../service/GrupoService.js');

jest.mock('../../utils/helpers/CommonResponse.js', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    created: jest.fn(),
  }
}));

jest.mock('../../utils/validators/schemas/zod/querys/GrupoQuerySchema.js', () => ({
  GrupoIDSchema: { parse: jest.fn() },
  GrupoQuerySchema: { parseAsync: jest.fn() }
}));

jest.mock('../../utils/validators/schemas/zod/GrupoSchema.js', () => ({
  GrupoSchema: { parse: jest.fn() },
  GrupoUpdateSchema: { parse: jest.fn() }
}));

describe('GrupoController', () => {
  let controller;
  let serviceMock;

  beforeEach(() => {
    serviceMock = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn()
    };

    GrupoService.mockImplementation(() => serviceMock);
    controller = new GrupoController();
  });

  describe('listar', () => {
    it('deve chamar service.listar e retornar resposta com sucesso', async () => {
      const req = { params: {}, query: {} };
      const res = {};
      const data = [{ nome: 'Grupo 1' }];

      serviceMock.listar.mockResolvedValue(data);

      await controller.listar(req, res);

      expect(serviceMock.listar).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, data);
    });

    it('deve validar id se presente', async () => {
      const req = { params: { id: 'abc' }, query: {} };
      const res = {};

      await controller.listar(req, res);

      expect(GrupoIDSchema.parse).toHaveBeenCalledWith('abc');
    });

    it('deve validar query se presente', async () => {
      const req = { params: {}, query: { nome: 'grupo' } };
      const res = {};

      await controller.listar(req, res);

      expect(GrupoQuerySchema.parseAsync).toHaveBeenCalledWith({ nome: 'grupo' });
    });
  });

  describe('criar', () => {
    it('deve criar grupo e retornar resposta com created', async () => {
      const req = { body: { nome: 'NovoGrupo' } };
      const res = {};

      const grupoCriado = {
        nome: 'NovoGrupo',
        toObject: jest.fn().mockReturnValue({ nome: 'NovoGrupo' })
      };

      GrupoSchema.parse.mockReturnValue(req.body);
      serviceMock.criar.mockResolvedValue(grupoCriado);

      await controller.criar(req, res);

      expect(GrupoSchema.parse).toHaveBeenCalledWith(req.body);
      expect(serviceMock.criar).toHaveBeenCalledWith(req.body);
      expect(CommonResponse.created).toHaveBeenCalledWith(res, { nome: 'NovoGrupo' });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar grupo e retornar resposta com sucesso', async () => {
      const req = { params: { id: 'id123' }, body: { nome: 'Atualizado' } };
      const res = {};
      const grupoAtualizado = { nome: 'Atualizado' };

      GrupoIDSchema.parse.mockReturnValue();
      GrupoUpdateSchema.parse.mockReturnValue(req.body);
      serviceMock.atualizar.mockResolvedValue(grupoAtualizado);

      await controller.atualizar(req, res);

      expect(GrupoIDSchema.parse).toHaveBeenCalledWith('id123');
      expect(GrupoUpdateSchema.parse).toHaveBeenCalledWith(req.body);
      expect(serviceMock.atualizar).toHaveBeenCalledWith('id123', req.body);
      expect(CommonResponse.success).toHaveBeenCalledWith(res, grupoAtualizado, 200, 'Grupo atualizado com sucesso.');
    });
  });

  describe('deletar', () => {
    it('deve deletar grupo e retornar resposta com sucesso', async () => {
      const req = { params: { id: 'id123' } };
      const res = {};
      const grupoDeletado = { nome: 'GrupoDeletado' };

      GrupoIDSchema.parse.mockReturnValue();
      serviceMock.deletar.mockResolvedValue(grupoDeletado);

      await controller.deletar(req, res);

      expect(GrupoIDSchema.parse).toHaveBeenCalledWith('id123');
      expect(serviceMock.deletar).toHaveBeenCalledWith('id123');
      expect(CommonResponse.success).toHaveBeenCalledWith(res, grupoDeletado, 200, 'Grupo excluído com sucesso.');
    });
  });
});
