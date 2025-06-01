import TipoDemandaRepository from '../../repository/TipoDemandaRepository.js';
import { CustomError } from '../../utils/helpers/index.js';

describe('TipoDemandaRepository', () => {
  const findOneMock = jest.fn();
  const findByIdMock = jest.fn();
  const findByIdAndUpdateMock = jest.fn();
  const findByIdAndDeleteMock = jest.fn();
  const paginateMock = jest.fn();

  const mockModel = {
    findOne: findOneMock,
    findById: findByIdMock,
    findByIdAndUpdate: findByIdAndUpdateMock,
    findByIdAndDelete: findByIdAndDeleteMock,
    paginate: paginateMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorID', () => {
    it('deve encontrar um tipo de demanda por ID', async () => {
      const mockData = { _id: '507f1f77bcf86cd799439011', titulo: 'Iluminação Pública' };
      findOneMock.mockResolvedValue(mockData);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: { findOne: findOneMock } });

      const result = await repo.buscarPorID('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockData);
      expect(findOneMock).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });

    it('deve lançar erro se tipo de demanda não for encontrado', async () => {
      findOneMock.mockResolvedValue(null);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: { findOne: findOneMock } });

      await expect(repo.buscarPorID('507f1f77bcf86cd799439011')).rejects.toThrow(CustomError);
      expect(findOneMock).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });
  });

  describe('buscarPorTitulo', () => {
    it('deve retornar tipo de demanda se título for encontrado', async () => {
      const tipo = { titulo: 'Coleta de Lixo' };
      findOneMock.mockResolvedValue(tipo);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.buscarPorTitulo('Coleta de Lixo');
      expect(findOneMock).toHaveBeenCalledWith({ titulo: 'Coleta de Lixo' });
      expect(result).toEqual(tipo);
    });

    it('deve ignorar o id ao buscar por título', async () => {
      const tipo = { titulo: 'Coleta de Lixo' };
      findOneMock.mockResolvedValue(tipo);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.buscarPorTitulo('Coleta de Lixo', 'idIgnorado');
      expect(findOneMock).toHaveBeenCalledWith({ titulo: 'Coleta de Lixo', _id: { $ne: 'idIgnorado' } });
      expect(result).toEqual(tipo);
    });
  });

  describe('buscarPorTipo', () => {
    it('deve retornar tipo de demanda se tipo for encontrado', async () => {
      const tipo = { tipo: 'Infraestrutura' };
      findOneMock.mockResolvedValue(tipo);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.buscarPorTipo('Infraestrutura');
      expect(findOneMock).toHaveBeenCalledWith({ tipo: 'Infraestrutura' });
      expect(result).toEqual(tipo);
    });

    it('deve ignorar o id ao buscar por tipo', async () => {
      const tipo = { tipo: 'Infraestrutura' };
      findOneMock.mockResolvedValue(tipo);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.buscarPorTipo('Infraestrutura', 'idIgnorado');
      expect(findOneMock).toHaveBeenCalledWith({ tipo: 'Infraestrutura', _id: { $ne: 'idIgnorado' } });
      expect(result).toEqual(tipo);
    });
  });

  describe('listar', () => {
    it('deve buscar por id se req.params.id existir', async () => {
      const data = { toObject: () => ({ titulo: 'Limpeza Urbana' }) };
      findByIdMock.mockResolvedValue(data);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const req = { params: { id: '507f1f77bcf86cd799439011' }, query: {} };
      const result = await repo.listar(req);

      expect(findByIdMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ titulo: 'Limpeza Urbana' });
    });

    it('deve lançar erro 404 se listar por id e não encontrar', async () => {
      findByIdMock.mockResolvedValue(null);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const req = { params: { id: 'idInvalido' }, query: {} };
      await expect(repo.listar(req)).rejects.toThrow(CustomError);
      expect(findByIdMock).toHaveBeenCalledWith('idInvalido');
    });

    it('deve listar com paginação e filtros', async () => {
      const docs = [{ titulo: 'Demanda A', toObject: () => ({ titulo: 'Demanda A' }) }];
      const resultado = {
        docs,
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
      paginateMock.mockResolvedValue(resultado);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const req = { params: {}, query: { titulo: '', tipo: '', page: '1', limite: '10' } };
      const result = await repo.listar(req);

      expect(paginateMock).toHaveBeenCalled();
      expect(result.docs[0]).toEqual({ titulo: 'Demanda A' });
    });

    it('deve lançar erro 404 se não encontrar demandas na listagem', async () => {
      paginateMock.mockResolvedValue({ docs: [] });
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const req = { params: {}, query: { titulo: '', tipo: '', page: '1', limite: '10' } };
      await expect(repo.listar(req)).rejects.toThrow(CustomError);
    });
  });

  describe('criar', () => {
    it('deve criar um novo tipo de demanda', async () => {
      const saveMock = jest.fn().mockResolvedValue({ titulo: 'Nova Demanda' });
      const mockModelConstructor = jest.fn(() => ({ save: saveMock }));
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModelConstructor });

      const dados = { titulo: 'Nova Demanda' };
      const result = await repo.criar(dados);

      expect(mockModelConstructor).toHaveBeenCalledWith(dados);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ titulo: 'Nova Demanda' });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar tipo de demanda existente', async () => {
      const updated = { titulo: 'Atualizado' };
      findByIdAndUpdateMock.mockResolvedValue(updated);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.atualizar('507f1f77bcf86cd799439011', { titulo: 'Atualizado' });
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { titulo: 'Atualizado' }, { new: true });
      expect(result).toEqual(updated);
    });

    it('deve lançar erro se tipo de demanda não for encontrado ao atualizar', async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      await expect(repo.atualizar('507f1f77bcf86cd799439011', { titulo: 'Teste' })).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar tipo de demanda', async () => {
      const deleted = { titulo: 'Deletada' };
      findByIdAndDeleteMock.mockResolvedValue(deleted);
      const repo = new TipoDemandaRepository({ TipoDemandaModel: mockModel });

      const result = await repo.deletar('507f1f77bcf86cd799439011');
      expect(findByIdAndDeleteMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(deleted);
    });
  });
});
