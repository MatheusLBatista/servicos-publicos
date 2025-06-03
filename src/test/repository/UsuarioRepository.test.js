import UsuarioRepository from '../../repository/UsuarioRepository.js';
import UsuarioModel from '../../models/Usuario.js'
import { CustomError } from '../../utils/helpers/index.js';

describe('UsuarioRepository', () => {
  const findOneMock = jest.fn();
  const findByIdMock = jest.fn();
  const findByIdAndUpdateMock = jest.fn();
  const findByIdAndDeleteMock = jest.fn();
  const paginateMock = jest.fn();
  const selectMock = jest.fn();

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
    it('deve encontrar um usuário por ID', async () => {
      const user = { nome: 'Teste' };
      findByIdMock.mockReturnValue(Promise.resolve(user));
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.buscarPorID('id');
      expect(result).toEqual(user);
    });

    it('deve lançar erro se não encontrar usuário', async () => {
      findByIdMock.mockReturnValue(Promise.resolve(null));
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      await expect(repo.buscarPorID('id')).rejects.toThrow(CustomError);
    });
  });

  describe('buscarPorEmail', () => {
    it('deve retornar usuário pelo email', async () => {
      const usuario = { email: 'teste@email.com' };
      selectMock.mockResolvedValue(usuario);
      findOneMock.mockReturnValue({ select: selectMock });
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.buscarPorEmail('teste@email.com');
      expect(result).toEqual(usuario);
      expect(findOneMock).toHaveBeenCalledWith({ email: 'teste@email.com' });
    });
  });

  describe('listar', () => {
    it('deve retornar usuário se ID for informado', async () => {
      const data = { nome: 'Usuário', toObject: () => ({ nome: 'Usuário' }) };
      findByIdMock.mockResolvedValue(data);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const req = { params: { id: '123' }, query: {} };
      const result = await repo.listar(req);
      expect(result).toEqual(data);
    });

    it('deve lançar erro se não encontrar usuário por ID', async () => {
      findByIdMock.mockResolvedValue(null);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const req = { params: { id: '123' }, query: {} };
      await expect(repo.listar(req)).rejects.toThrow(CustomError);
    });

    it('deve retornar usuários paginados', async () => {
      const resultado = {
        docs: [{ nome: 'Usuário', toObject: () => ({ nome: 'Usuário' }) }],
        page: 1,
        totalDocs: 1,
        totalPages: 1,
      };
      paginateMock.mockResolvedValue(resultado);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const req = { params: {}, query: { page: '1', limite: '10' } };
      const result = await repo.listar(req);
      expect(paginateMock).toHaveBeenCalled();
      expect(result.docs[0]).toEqual({ nome: 'Usuário' });
    });
  });

  describe('criar', () => {
    it('deve criar usuário', async () => {
      const saveMock = jest.fn().mockResolvedValue({ nome: 'Novo Usuário' });
      const mockModelConstructor = jest.fn(() => ({ save: saveMock }));
      const repo = new UsuarioRepository({ usuarioModel: mockModelConstructor });

      const result = await repo.criar({ nome: 'Novo Usuário' });
      expect(mockModelConstructor).toHaveBeenCalledWith({ nome: 'Novo Usuário' });
      expect(saveMock).toHaveBeenCalled();
      expect(result).toEqual({ nome: 'Novo Usuário' });
    });
  });

  describe('atualizar', () => {
    it('deve atualizar usuário', async () => {
      const usuario = { nome: 'Atualizado' };
      findByIdAndUpdateMock.mockResolvedValue(usuario);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.atualizar('id', { nome: 'Atualizado' });
      expect(result).toEqual(usuario);
    });

    it('deve lançar erro se usuário não encontrado ao atualizar', async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      await expect(repo.atualizar('id', {})).rejects.toThrow(CustomError);
    });
  });

  describe('deletar', () => {
    it('deve deletar usuário', async () => {
      const usuario = { nome: 'Deletado' };
      findByIdAndDeleteMock.mockResolvedValue(usuario);
      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.deletar('id');
      expect(result).toEqual(usuario);
    });
  });
});