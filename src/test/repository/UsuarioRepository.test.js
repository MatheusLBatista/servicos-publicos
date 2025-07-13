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
      const usuario = { nome: 'Teste' };

      const populateMock2 = jest.fn().mockResolvedValue(usuario);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.buscarPorID('id');

      expect(findByIdMock).toHaveBeenCalledWith('id');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(result).toEqual(usuario);
    });

    it('deve lançar erro se não encontrar usuário', async () => {
      const populateMock2 = jest.fn().mockResolvedValue(null);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      await expect(repo.buscarPorID('id')).rejects.toThrow(CustomError);

      expect(findByIdMock).toHaveBeenCalledWith('id');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
    });

    it('deve incluir os tokens se includeTokens for true', async () => {
      const usuario = { nome: 'Com token' };

      // Mocks encadeados
      const selectMock = jest.fn().mockResolvedValue(usuario);
      const populateMock2 = jest.fn(() => ({ select: selectMock }));
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      const findByIdMock = jest.fn(() => ({ populate: populateMock1 }));

      const mockModel = { findById: findByIdMock };

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.buscarPorID('123', true);

      expect(findByIdMock).toHaveBeenCalledWith('123');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(selectMock).toHaveBeenCalledWith('+refreshtoken +accesstoken');
      expect(result).toEqual(usuario);
    });

  });

  describe('buscarPorEmail', () => {
    it('deve incluir _id: { $ne: idIgnorado } quando idIgnorado é passado', async () => {
      const selectMock = jest.fn().mockResolvedValue({ email: 'x@y.com' });
      const findOneMock = jest.fn(() => ({ select: selectMock }));

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const idIgnorado = 'abc123';
      await repo.buscarPorEmail('x@y.com', idIgnorado);

      expect(findOneMock).toHaveBeenCalledWith({
        email: 'x@y.com',
        _id: { $ne: idIgnorado }
      });
      expect(selectMock).toHaveBeenCalledWith('+senha');
    });

    it('não deve incluir filtro _id quando idIgnorado não é passado', async () => {
      const selectMock = jest.fn().mockResolvedValue({ email: 'x@y.com' });
      const findOneMock = jest.fn(() => ({ select: selectMock }));

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      await repo.buscarPorEmail('x@y.com');

      expect(findOneMock).toHaveBeenCalledWith({ email: 'x@y.com' });
      expect(selectMock).toHaveBeenCalledWith('+senha');
    });
  });

  describe('buscarPorNome', () => {
    it('deve retornar documento ao buscar por nome sem idIgnorado', async () => {
      const usuario = { nome: 'Matheus' };
      const findOneMock = jest.fn().mockResolvedValue(usuario);

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const result = await repo.buscarPorNome('math');
      expect(findOneMock).toHaveBeenCalledWith({
        nome: { $regex: 'math', $options: 'i' }
      });
      expect(result).toBe(usuario);
    });

    it('deve retornar documento ao buscar por nome com idIgnorado', async () => {
      const usuario = { nome: 'Lucas' };
      const findOneMock = jest.fn().mockResolvedValue(usuario);

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const idIgnorado = '123abc';

      const result = await repo.buscarPorNome('luc', idIgnorado);
      expect(findOneMock).toHaveBeenCalledWith({
        nome: { $regex: 'luc', $options: 'i' },
        _id: { $ne: idIgnorado }
      });
      expect(result).toBe(usuario);
    });

    it('deve retornar null se não encontrar usuário', async () => {
      const findOneMock = jest.fn().mockResolvedValue(null);

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const result = await repo.buscarPorNome('não existe');
      expect(findOneMock).toHaveBeenCalledWith({
        nome: { $regex: 'não existe', $options: 'i' }
      });
      expect(result).toBeNull();
    });

    it('deve incluir filtro _id: { $ne: idIgnorado } quando idIgnorado for passado', async () => {
      const idIgnorado = '123abc';
      const findOneMock = jest.fn().mockResolvedValue(null);

      const mockModel = { findOne: findOneMock };
      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      await repo.buscarPorNome('Lucas', idIgnorado);

      expect(findOneMock).toHaveBeenCalledWith({
        nome: { $regex: 'Lucas', $options: 'i' },
        _id: { $ne: idIgnorado }
      });
    });
  });

  describe('listar', () => {
    it('deve retornar usuário se ID for informado', async () => {
      const data = { nome: 'Usuário', toObject: () => ({ nome: 'Usuário' }) };

      const populateMock2 = jest.fn().mockResolvedValue(data);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const req = { params: { id: '123' }, query: {} };
      const result = await repo.listar(req);

      expect(findByIdMock).toHaveBeenCalledWith('123');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(result).toEqual(data);
    });

    it('deve lançar erro se não encontrar usuário por ID', async () => {
      const populateMock2 = jest.fn().mockResolvedValue(null);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const req = { params: { id: '123' }, query: {} };

      await expect(repo.listar(req)).rejects.toThrow(CustomError);
      expect(findByIdMock).toHaveBeenCalledWith('123');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
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

      const populateMock2 = jest.fn().mockResolvedValue(usuario);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdAndUpdateMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });
      const result = await repo.atualizar('id', { nome: 'Atualizado' });

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith('id', { nome: 'Atualizado' }, { new: true });
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(result).toEqual(usuario);
    });

    it('deve lançar erro se usuário não encontrado ao atualizar', async () => {
      // Mock de .populate encadeado retornando `null` no final
      const populateMock2 = jest.fn().mockResolvedValue(null);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdAndUpdateMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      await expect(repo.atualizar('id', {})).rejects.toThrow(CustomError);
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
    });

  });

  describe('deletar', () => {
    it('deve deletar usuário', async () => {
      const usuario = { nome: 'Deletado' };

      const populateMock2 = jest.fn().mockResolvedValue(usuario);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      findByIdAndDeleteMock.mockReturnValue({ populate: populateMock1 });

      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const result = await repo.deletar('id');

      expect(findByIdAndDeleteMock).toHaveBeenCalledWith('id');
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(result).toEqual(usuario);
    });
  });

  describe('armazenarTokens', () => {
    it('deve armazenar tokens para o usuário existente', async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const usuarioMock = { save: saveMock };
      const findById = jest.fn().mockResolvedValue(usuarioMock);

      const repo = new UsuarioRepository({ usuarioModel: { findById } });
      const result = await repo.armazenarTokens('user-id', 'access', 'refresh');

      expect(findById).toHaveBeenCalledWith('user-id');
      expect(usuarioMock.accesstoken).toBe('access');
      expect(usuarioMock.refreshtoken).toBe('refresh');
      expect(saveMock).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      const findById = jest.fn().mockResolvedValue(null);
      const repo = new UsuarioRepository({ usuarioModel: { findById } });

      await expect(repo.armazenarTokens('user-id', 'a', 'r')).rejects.toThrow(CustomError);
    });
  });

  describe('removerTokens', () => {
    it('deve remover tokens com sucesso', async () => {
      const usuario = { nome: 'Removido' };

      const execMock = jest.fn().mockResolvedValue(usuario);
      const findByIdAndUpdate = jest.fn(() => ({ exec: execMock }));

      const repo = new UsuarioRepository({ usuarioModel: { findByIdAndUpdate } });

      const result = await repo.removerTokens('id');

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        'id',
        { refreshtoken: null, accesstoken: null },
        { new: true }
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toBe(usuario);
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      const findByIdAndUpdate = jest.fn(() => ({ exec: execMock }));

      const repo = new UsuarioRepository({ usuarioModel: { findByIdAndUpdate } });

      await expect(repo.removerTokens('id')).rejects.toThrow(CustomError);

      expect(findByIdAndUpdate).toHaveBeenCalledWith(
        'id',
        { refreshtoken: null, accesstoken: null },
        { new: true }
      );
      expect(execMock).toHaveBeenCalled();
    });

  });

  describe('buscarPorIDs', () => {
    it('deve retornar múltiplos usuários por array de IDs com populate', async () => {
      const expected = [{ _id: '1' }, { _id: '2' }];

      const populateMock2 = jest.fn().mockResolvedValue(expected);
      const populateMock1 = jest.fn(() => ({ populate: populateMock2 }));
      const findMock = jest.fn(() => ({ populate: populateMock1 }));

      const mockModel = {
        find: findMock,
      };

      const repo = new UsuarioRepository({ usuarioModel: mockModel });

      const result = await repo.buscarPorIDs(['1', '2']);

      expect(findMock).toHaveBeenCalledWith({ _id: { $in: ['1', '2'] } });
      expect(populateMock1).toHaveBeenCalledWith('secretarias');
      expect(populateMock2).toHaveBeenCalledWith('grupo');
      expect(result).toBe(expected);
    });
  });

  describe('buscarPorPorCodigoRecuperacao', () => {
    it('deve retornar usuário pelo código de recuperação', async () => {
      const expected = { _id: '1', email: 'x@y.com' };
      const findOne = jest.fn().mockResolvedValue(expected);

      const repo = new UsuarioRepository({ usuarioModel: { findOne } });
      const result = await repo.buscarPorPorCodigoRecuperacao('abc123');

      expect(findOne).toHaveBeenCalledWith(
        { codigo_recupera_senha: 'abc123' },
        ['+senha', '+codigo_recupera_senha', '+exp_codigo_recupera_senha']
      );
      expect(result).toBe(expected);
    });
  });

});