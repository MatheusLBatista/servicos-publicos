import GrupoRepository from '../../repository/GrupoRepository.js';
import CustomError from '../../utils/helpers/CustomError.js';
import GrupoFilterBuilder from '../../repository/filters/GrupoFilterBuild.js';

jest.mock('../../repository/filters/GrupoFilterBuild.js');

describe('GrupoRepository', () => {
  let grupoRepository;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      paginate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn()
    };

    function Grupo(data) {
      return {
        ...data,
        save: mockModel.save
      };
    }

    grupoRepository = new GrupoRepository({ GrupoModel: mockModel });
  });

  describe('buscarPorID', () => {
    it('deve retornar grupo quando encontrado', async () => {
      const fakeGrupo = { nome: 'Grupo A' };
      mockModel.findById.mockReturnValueOnce(Promise.resolve(fakeGrupo));

      const result = await grupoRepository.buscarPorID('123');
      expect(result).toEqual(fakeGrupo);
    });

    it('deve lançar erro se grupo não encontrado', async () => {
      mockModel.findById.mockReturnValueOnce(Promise.resolve(null));

      await expect(grupoRepository.buscarPorID('123'))
        .rejects.toThrow(CustomError);
    });

    it('deve selecionar tokens quando includeTokens = true', async () => {
      const fakeGrupo = { nome: 'Grupo com Token' };
      const selectMock = jest.fn().mockResolvedValue(fakeGrupo);
      mockModel.findById.mockReturnValue({ select: selectMock });

      const result = await grupoRepository.buscarPorID('123', true);
      expect(selectMock).toHaveBeenCalledWith('+refreshtoken +accesstoken');
      expect(result).toEqual(fakeGrupo);
    });
  });

  describe('buscarPorNome', () => {
    it('deve retornar documento com nome', async () => {
      const doc = { nome: 'NomeGrupo' };
      mockModel.findOne.mockResolvedValue(doc);

      const result = await grupoRepository.buscarPorNome('NomeGrupo');
      expect(result).toEqual(doc);
      expect(mockModel.findOne).toHaveBeenCalledWith({ nome: 'NomeGrupo' });
    });

    it('deve ignorar um ID se fornecido', async () => {
      const doc = { nome: 'NomeGrupo' };
      mockModel.findOne.mockResolvedValue(doc);

      await grupoRepository.buscarPorNome('NomeGrupo', '123');
      expect(mockModel.findOne).toHaveBeenCalledWith({
        nome: 'NomeGrupo',
        _id: { $ne: '123' }
      });
    });
  });

  describe('listar', () => {
    it('deve retornar grupo por ID se passado em req.params', async () => {
      const grupo = { nome: 'GrupoUnico' };
      mockModel.findById.mockResolvedValue(grupo);

      const result = await grupoRepository.listar({ params: { id: 'abc' }, query: {} });
      expect(result).toEqual(grupo);
    });

    it('deve lançar erro se grupo não encontrado por ID', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(grupoRepository.listar({ params: { id: 'abc' }, query: {} }))
        .rejects.toThrow(CustomError);
    });

    it('deve paginar com filtros construídos', async () => {
      const filtroMock = { nome: /teste/i };
      const builderMock = {
        comNome: jest.fn().mockReturnThis(),
        comAtivo: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(filtroMock),
      };
      GrupoFilterBuilder.mockImplementation(() => builderMock);

      const fakeDocs = [{ toObject: () => ({ nome: 'Grupo1' }) }];
      mockModel.paginate.mockResolvedValue({ docs: fakeDocs, total: 1 });

      const req = {
        params: {},
        query: { nome: 'teste', ativo: true, page: 1, limite: 5 }
      };

      const result = await grupoRepository.listar(req);
      expect(result.docs).toEqual([{ nome: 'Grupo1' }]);
      expect(mockModel.paginate).toHaveBeenCalled();
    });

    it('deve lançar erro se builder não tem build', async () => {
      GrupoFilterBuilder.mockImplementation(() => ({
        comNome: jest.fn().mockReturnThis(),
        comAtivo: jest.fn().mockReturnThis(),
      }));

      await expect(grupoRepository.listar({ params: {}, query: {} }))
        .rejects.toThrow(CustomError);
    });
  });

  describe('criar', () => {
    it('deve salvar um novo grupo', async () => {
      const grupoData = { nome: 'NovoGrupo' };
      const grupo = { ...grupoData, save: jest.fn().mockResolvedValue(grupoData) };
      grupoRepository = new GrupoRepository({ GrupoModel: jest.fn(() => grupo) });

      const result = await grupoRepository.criar(grupoData);
      expect(result).toEqual(grupoData);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar e retornar grupo', async () => {
      const updatedGrupo = { nome: 'Atualizado' };
      mockModel.findByIdAndUpdate.mockResolvedValue(updatedGrupo);

      const result = await grupoRepository.atualizar('id123', { nome: 'Atualizado' });
      expect(result).toEqual(updatedGrupo);
    });

    it('deve lançar erro se grupo não encontrado', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(grupoRepository.atualizar('id123', {})).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar grupo', async () => {
      const grupo = { nome: 'ParaExcluir' };
      mockModel.findByIdAndDelete.mockResolvedValue(grupo);

      const result = await grupoRepository.deletar('idDel');
      expect(result).toEqual(grupo);
    });

    it('deve lançar erro se grupo não existe', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(grupoRepository.deletar('idDel')).rejects.toThrow(CustomError);
    });
  });
});
