import UsuarioService from '../../service/UsuarioService.js';
import UsuarioRepository from '../../repository/UsuarioRepository.js';
import { CustomError, HttpStatusCodes, messages } from '../../utils/helpers/index.js';

jest.mock('../../repository/UsuarioRepository.js');

describe('UsuarioService', () => {
  let service;
  let repositoryMock;

  beforeEach(() => {
    repositoryMock = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarPorID: jest.fn(),
      buscarPorNome: jest.fn(),
      buscarPorEmail: jest.fn(),
    };
    UsuarioRepository.mockImplementation(() => repositoryMock);
    service = new UsuarioService();
  });

  it('Deve listar usuários', async () => {
    repositoryMock.listar.mockResolvedValue([{ nome: 'Usuário A' }]);

    const resultado = await service.listar({});

    expect(resultado).toEqual([{ nome: 'Usuário A' }]);
    expect(repositoryMock.listar).toHaveBeenCalled();
  });

  it('Deve criar usuário se email for único', async () => {
    const dados = { nome: 'Novo Usuário', email: 'novo@email.com' };
    repositoryMock.buscarPorEmail.mockResolvedValue(null);
    repositoryMock.criar.mockResolvedValue(dados);

    const resultado = await service.criar(dados);

    expect(repositoryMock.buscarPorEmail).toHaveBeenCalledWith('novo@email.com', null);
    expect(repositoryMock.criar).toHaveBeenCalledWith(dados);
    expect(resultado).toEqual(dados);
  });

  it('Deve lançar erro ao tentar criar usuário com email já existente', async () => {
    repositoryMock.buscarPorEmail.mockResolvedValue({ email: 'existente@email.com' });

    await expect(service.criar({ email: 'existente@email.com' })).rejects.toThrow(CustomError);
  });

  it('Deve atualizar um usuário existente', async () => {
    const id = '123';
    const dados = { nome: 'Atualizado' };

    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.atualizar.mockResolvedValue({ _id: id, ...dados });

    const resultado = await service.atualizar(id, dados);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.atualizar).toHaveBeenCalledWith(id, dados);
    expect(resultado).toEqual({ _id: id, ...dados });
  });

  it('Deve lançar erro ao tentar atualizar usuário inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.atualizar('id_invalido', {})).rejects.toThrow(CustomError);
  });

  it('Deve deletar um usuário existente', async () => {
    const id = '123';
    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.deletar.mockResolvedValue({ acknowledged: true });

    const resultado = await service.deletar(id);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.deletar).toHaveBeenCalledWith(id);
    expect(resultado).toEqual({ acknowledged: true });
  });

  it('Deve lançar erro ao tentar deletar usuário inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.deletar('id_invalido')).rejects.toThrow(CustomError);
  });
});