import SecretariaRepository from '../../repository/SecretariaRepository.js';
import SecretariaModel from '../../models/Secretaria.js';
import { CustomError } from '../../utils/helpers/index.js';

describe('SecretariaRepository', () => {
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
    it('deve encontrar uma secretaria por ID', async () => {
        const mockUser = { _id: '507f1f77bcf86cd799439011', nome: 'Teste' };
        findOneMock.mockResolvedValue(mockUser);
        const repo = new SecretariaRepository({ SecretariaModel: mockModel });

        const result = await repo.buscarPorID('507f1f77bcf86cd799439011');

        expect(result).toEqual(mockUser);
        expect(findOneMock).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });

    it('deve lançar um erro se a secretaria não for encontrada', async () => {
        findOneMock.mockResolvedValue(null);
        const repo = new SecretariaRepository({ SecretariaModel: mockModel });

        await expect(repo.buscarPorID('507f1f77bcf86cd799439011')).rejects.toThrow(CustomError);
        expect(findOneMock).toHaveBeenCalledWith({ _id: expect.any(Object) });
    });
   });

  describe('buscarPorNome', () => {
    it('deve retornar secretaria se nome for encontrado', async () => {
      const secretaria = { nome: 'Secretaria da Educação' };
      findOneMock.mockResolvedValue(secretaria);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const result = await repo.buscarPorNome('Secretaria da Educação');
      expect(findOneMock).toHaveBeenCalledWith({ nome: 'Secretaria da Educação' });
      expect(result).toEqual(secretaria);
    });

    it('deve ignorar o id ao buscar', async () => {
      const secretaria = { nome: 'Secretaria da Educação' };
      findOneMock.mockResolvedValue(secretaria);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const result = await repo.buscarPorNome('Secretaria da Educação', 'idIgnorado');
      expect(findOneMock).toHaveBeenCalledWith({ nome: 'Secretaria da Educação', _id: { $ne: 'idIgnorado' } });
      expect(result).toEqual(secretaria);
    });
  });

  describe('listar', () => {
    it('deve buscar por id se req.params.id existir', async () => {
      const data = {
        toObject: () => ({ nome: 'Secretaria' }),
      };
      findByIdMock.mockResolvedValue(data);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const req = { params: { id: '507f1f77bcf86cd799439011' }, query: {} };
      const result = await repo.listar(req);

      expect(findByIdMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ nome: 'Secretaria' });
    });

    it('deve lançar erro 404 se listar por id e não encontrar', async () => {
      findByIdMock.mockResolvedValue(null);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const req = { params: { id: 'idInvalido' }, query: {} };
      await expect(repo.listar(req)).rejects.toThrow(CustomError);
      expect(findByIdMock).toHaveBeenCalledWith('idInvalido');
    });

    it('deve listar com paginação e filtros', async () => {
      const docs = [{ nome: 'Secretaria A', toObject: () => ({ nome: 'Secretaria A' }) }];
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
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const req = { params: {}, query: { nome: '', page: '1', limite: '10' } };
      const result = await repo.listar(req);

      expect(paginateMock).toHaveBeenCalled();
      expect(result.docs[0]).toEqual({ nome: 'Secretaria A' });
    });

    it('deve lançar erro 404 se não encontrar secretarias na listagem', async () => {
      const resultado = {
        docs: [],
      };
      paginateMock.mockResolvedValue(resultado);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const req = { params: {}, query: { nome: '', page: '1', limite: '10' } };
      await expect(repo.listar(req)).rejects.toThrow(CustomError);
    });
  });

  describe('criar', () => {
    it('deve criar uma nova secretaria', async () => {
      const saveMock = jest.fn().mockResolvedValue({ nome: 'SecretariaTeste' });
      const mockModelConstructor = jest.fn(() => ({ save: saveMock }));
      const repo = new SecretariaRepository({ SecretariaModel: mockModelConstructor });

      const dados = { nome: 'SecretariaTeste' };
      const result = await repo.criar(dados);

      expect(mockModelConstructor).toHaveBeenCalledWith(dados);
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ nome: 'SecretariaTeste' });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar secretaria existente', async () => {
      const updated = { nome: 'Nova Secretaria' };
      findByIdAndUpdateMock.mockResolvedValue(updated);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const result = await repo.atualizar('507f1f77bcf86cd799439011', { nome: 'Nova Secretaria' });
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { nome: 'Nova Secretaria' }, { new: true });
      expect(result).toEqual(updated);
    });

    it('deve lançar erro se secretaria não encontrada ao atualizar', async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      await expect(repo.atualizar('idInvalido', { nome: 'Teste' })).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar secretaria', async () => {
      const deleted = { nome: 'Deletada' };
      findByIdAndDeleteMock.mockResolvedValue(deleted);
      const repo = new SecretariaRepository({ SecretariaModel: mockModel });

      const result = await repo.deletar('507f1f77bcf86cd799439011');
      expect(findByIdAndDeleteMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(deleted);
    });
  });
});
