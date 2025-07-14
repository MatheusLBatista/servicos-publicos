import GrupoService from '../../service/GrupoService.js';
import GrupoRepository from '../../repository/GrupoRepository.js';
import { CustomError, HttpStatusCodes, messages } from '../../utils/helpers/index.js';

jest.mock('../../repository/GrupoRepository.js');

describe('GrupoService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarPorID: jest.fn(),
      buscarPorNome: jest.fn()
    };

    GrupoRepository.mockImplementation(() => mockRepository);
    service = new GrupoService();
  });

  describe('listar', () => {
    it('deve retornar dados da lista do repositório', async () => {
      const req = { query: {} };
      const expectedData = [{ nome: 'Grupo 1' }];

      mockRepository.listar.mockResolvedValue(expectedData);

      const result = await service.listar(req);

      expect(mockRepository.listar).toHaveBeenCalledWith(req);
      expect(result).toEqual(expectedData);
    });
  });

  describe('criar', () => {
    it('deve criar grupo após validar nome', async () => {
      const data = { nome: 'Grupo Novo' };

      mockRepository.buscarPorNome.mockResolvedValue(null);
      mockRepository.criar.mockResolvedValue(data);

      const result = await service.criar(data);

      expect(mockRepository.buscarPorNome).toHaveBeenCalledWith('Grupo Novo', null);
      expect(mockRepository.criar).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });

    it('deve lançar erro se nome já existir', async () => {
      const data = { nome: 'Duplicado' };

      mockRepository.buscarPorNome.mockResolvedValue({ nome: 'Duplicado' });

      await expect(service.criar(data)).rejects.toThrow(CustomError);
      expect(mockRepository.criar).not.toHaveBeenCalled();
    });
  });

  describe('atualizar', () => {
    it('deve atualizar grupo existente', async () => {
      const id = '123';
      const parsedData = { nome: 'Atualizado', email: 'remover@teste.com' };

      mockRepository.buscarPorID.mockResolvedValue({ _id: id });
      mockRepository.atualizar.mockResolvedValue({ nome: 'Atualizado' });

      const result = await service.atualizar(id, { ...parsedData });

      expect(mockRepository.buscarPorID).toHaveBeenCalledWith(id);
      expect(mockRepository.atualizar).toHaveBeenCalledWith(id, { nome: 'Atualizado' }); // sem email
      expect(result).toEqual({ nome: 'Atualizado' });
    });
  });

  describe('deletar', () => {
    it('deve deletar grupo existente', async () => {
      const id = '456';

      mockRepository.buscarPorID.mockResolvedValue({ _id: id });
      mockRepository.deletar.mockResolvedValue({ nome: 'Deletado' });

      const result = await service.deletar(id);

      expect(mockRepository.buscarPorID).toHaveBeenCalledWith(id);
      expect(mockRepository.deletar).toHaveBeenCalledWith(id);
      expect(result).toEqual({ nome: 'Deletado' });
    });
  });

  describe('ensureGrupoExists', () => {
    it('deve retornar grupo se existir', async () => {
      const grupo = { _id: '999', nome: 'Grupo Existente' };
      mockRepository.buscarPorID.mockResolvedValue(grupo);

      const result = await service.ensureGrupoExists('999');
      expect(result).toEqual(grupo);
    });

    it('deve lançar erro se grupo não existir', async () => {
      mockRepository.buscarPorID.mockResolvedValue(null);

      await expect(service.ensureGrupoExists('404')).rejects.toThrow(CustomError);
    });
  });

  describe('validarNome', () => {
    it('deve lançar erro se nome já existir (duplicado)', async () => {
      mockRepository.buscarPorNome.mockResolvedValue({ nome: 'Já existe' });

      await expect(service.validarNome('Já existe')).rejects.toThrow(CustomError);
    });

    it('não deve lançar erro se nome for único', async () => {
      mockRepository.buscarPorNome.mockResolvedValue(null);

      await expect(service.validarNome('Novo Nome')).resolves.toBeUndefined();
    });
  });
});
