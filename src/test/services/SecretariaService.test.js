import SecretariaService from '../../service/SecretariaService.js';
import SecretariaRepository from '../../repository/SecretariaRepository.js';
import { CustomError, HttpStatusCodes, messages } from '../../utils/helpers/index.js';

jest.mock('../../repository/SecretariaRepository.js');

describe('SecretariaService', () => {
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
    };
    SecretariaRepository.mockImplementation(() => repositoryMock);
    service = new SecretariaService();
  });

  it('Deve listar secretarias', async () => {
    repositoryMock.listar.mockResolvedValue([{ nome: 'Secretaria A' }]);

    const resultado = await service.listar({});

    expect(resultado).toEqual([{ nome: 'Secretaria A' }]);
    expect(repositoryMock.listar).toHaveBeenCalled();
  });

  it('Deve criar uma secretaria se o nome for único', async () => {
    const dados = { nome: 'Nova Secretaria' };
    repositoryMock.buscarPorNome.mockResolvedValue(null);
    repositoryMock.criar.mockResolvedValue(dados);

    const resultado = await service.criar(dados);

    expect(repositoryMock.buscarPorNome).toHaveBeenCalledWith('Nova Secretaria', null);
    expect(repositoryMock.criar).toHaveBeenCalledWith(dados);
    expect(resultado).toEqual(dados);
  });

  it('Deve lançar erro ao tentar criar secretaria com nome já existente', async () => {
    repositoryMock.buscarPorNome.mockResolvedValue({ nome: 'Existente' });

    await expect(service.criar({ nome: 'Existente' })).rejects.toThrow(CustomError);
  });

  it('Deve atualizar uma secretaria existente', async () => {
    const id = '123';
    const dados = { nome: 'Atualizado' };

    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.atualizar.mockResolvedValue({ _id: id, ...dados });

    const resultado = await service.atualizar(id, dados);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.atualizar).toHaveBeenCalledWith(id, dados);
    expect(resultado).toEqual({ _id: id, ...dados });
  });

  it('Deve lançar erro ao tentar atualizar secretaria inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.atualizar('id_invalido', {})).rejects.toThrow(CustomError);
  });

  it('Deve deletar uma secretaria existente', async () => {
    const id = '123';
    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.deletar.mockResolvedValue({ acknowledged: true });

    const resultado = await service.deletar(id);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.deletar).toHaveBeenCalledWith(id);
    expect(resultado).toEqual({ acknowledged: true });
  });

  it('Deve lançar erro ao tentar deletar secretaria inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.deletar('id_invalido')).rejects.toThrow(CustomError);
  });
});
