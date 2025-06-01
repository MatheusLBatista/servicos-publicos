import TipoDemandaService from '../../service/TipoDemandaService.js';
import TipoDemandaRepository from '../../repository/TipoDemandaRepository.js';
import { CustomError, HttpStatusCodes } from '../../utils/helpers/index.js';

jest.mock('../../repository/TipoDemandaRepository.js');

describe('TipoDemandaService', () => {
  let service;
  let repositoryMock;

  beforeEach(() => {
    repositoryMock = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarPorID: jest.fn(),
      buscarPorTitulo: jest.fn(),
    };
    TipoDemandaRepository.mockImplementation(() => repositoryMock);
    service = new TipoDemandaService();
  });

  it('Deve listar tipos de demanda', async () => {
    repositoryMock.listar.mockResolvedValue([{ titulo: 'Coleta de lixo' }]);

    const resultado = await service.listar({});

    expect(resultado).toEqual([{ titulo: 'Coleta de lixo' }]);
    expect(repositoryMock.listar).toHaveBeenCalled();
  });

  it('Deve criar um tipo de demanda com título único e tipo válido', async () => {
    const dados = { titulo: 'Nova Demanda', tipo: 'Coleta' };

    repositoryMock.buscarPorTitulo.mockResolvedValue(null);
    repositoryMock.criar.mockResolvedValue(dados);

    const resultado = await service.criar(dados);

    expect(repositoryMock.buscarPorTitulo).toHaveBeenCalledWith('Nova Demanda', null);
    expect(repositoryMock.criar).toHaveBeenCalledWith(dados);
    expect(resultado).toEqual(dados);
  });

  it('Deve lançar erro ao tentar criar tipo de demanda com título já existente', async () => {
    repositoryMock.buscarPorTitulo.mockResolvedValue({ titulo: 'Existente' });

    await expect(service.criar({ titulo: 'Existente', tipo: 'Coleta' })).rejects.toThrow(CustomError);
  });

  it('Deve lançar erro ao tentar criar tipo de demanda com tipo inválido', async () => {
    repositoryMock.buscarPorTitulo.mockResolvedValue(null);

    const dados = { titulo: 'Nova Demanda', tipo: 'Transporte' };

    await expect(service.criar(dados)).rejects.toThrow(CustomError);
  });

  it('Deve atualizar um tipo de demanda existente com dados válidos', async () => {
    const id = '123';
    const dados = { titulo: 'Atualizado', tipo: 'Saneamento' };

    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.buscarPorTitulo.mockResolvedValue(null);
    repositoryMock.atualizar.mockResolvedValue({ _id: id, ...dados });

    const resultado = await service.atualizar(id, dados);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.buscarPorTitulo).toHaveBeenCalledWith('Atualizado', id);
    expect(repositoryMock.atualizar).toHaveBeenCalledWith(id, dados);
    expect(resultado).toEqual({ _id: id, ...dados });
  });

  it('Deve lançar erro ao tentar atualizar tipo de demanda inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.atualizar('id_invalido', { titulo: 'Teste', tipo: 'Coleta' })).rejects.toThrow(CustomError);
  });

  it('Deve deletar um tipo de demanda existente', async () => {
    const id = '123';
    repositoryMock.buscarPorID.mockResolvedValue({ _id: id });
    repositoryMock.deletar.mockResolvedValue({ acknowledged: true });

    const resultado = await service.deletar(id);

    expect(repositoryMock.buscarPorID).toHaveBeenCalledWith(id);
    expect(repositoryMock.deletar).toHaveBeenCalledWith(id);
    expect(resultado).toEqual({ acknowledged: true });
  });

  it('Deve lançar erro ao tentar deletar tipo de demanda inexistente', async () => {
    repositoryMock.buscarPorID.mockResolvedValue(null);

    await expect(service.deletar('id_invalido')).rejects.toThrow(CustomError);
  });
});
