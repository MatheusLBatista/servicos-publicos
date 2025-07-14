import UsuarioService from "../../service/UsuarioService.js";
import UsuarioRepository from "../../repository/UsuarioRepository.js";
import {
  CustomError,
  HttpStatusCodes,
  messages,
} from "../../utils/helpers/index.js";
import AuthHelper from "../../utils/AuthHelper.js";
import GrupoRepository from "../../repository/GrupoRepository.js";

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { UsuarioUpdateSchema } from "../../utils/validators/schemas/zod/UsuarioSchema.js";

jest.mock("../../repository/UsuarioRepository.js");
jest.mock("../../utils/AuthHelper.js");
jest.mock("../../repository/GrupoRepository.js");
jest.mock("../../repository/DemandaRepository.js");
jest.mock("../../repository/UsuarioRepository.js");
jest.mock("../../repository/SecretariaRepository.js");
jest.unstable_mockModule('uuid', () => ({
  v4: jest.fn(),
}));

jest.unstable_mockModule('sharp', () => ({
  default: {
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(),
  },
}));

describe("UsuarioService", () => {
  let service;
  let repositoryMock;
  let grupoRepositoryMock;

  const usuarioBase = {
    _id: "6871d7b722e1cf0b2d0f3aab",
    nivel_acesso: {
      administrador: false,
      secretario: false,
      operador: false,
      municipe: false,
    },
    secretarias: ["sec-1"],
  };

  beforeEach(() => {
    repositoryMock = {
      buscarPorID: jest.fn(),
      listar: jest.fn(),
      buscarPorEmail: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
    };

    grupoRepositoryMock = {
      buscarPorNome: jest.fn(),
    };

    UsuarioRepository.mockImplementation(() => repositoryMock);
    GrupoRepository.mockImplementation(() => grupoRepositoryMock);

    service = new UsuarioService();
    service.ensureUserExists = jest.fn().mockResolvedValue(true);
  });

  describe("UsuarioService - listar", () => {
    it("Administrador deve conseguir listar todos os usuários", async () => {
      repositoryMock.buscarPorID.mockResolvedValue({
        ...usuarioBase,
        nivel_acesso: { administrador: true },
      });
      repositoryMock.listar.mockResolvedValue([{ nome: "Usuário A" }]);

      const req = { user_id: "6871d7b722e1cf0b2d0f3aab", query: {} };
      const result = await service.listar(req);

      expect(repositoryMock.listar).toHaveBeenCalled();
      expect(result).toEqual([{ nome: "Usuário A" }]);
    });

    it("Munícipe deve acessar somente seus próprios dados", async () => {
      const usuarioLogado = {
        _id: "6871d7b722e1cf0b2d0f3aab",
        nome: "Munícipe",
        nivel_acesso: { municipe: true },
      };

      // 1ª chamada: buscarPorID(req.user_id)
      // 2ª chamada: buscarPorID(req.params.id)
      repositoryMock.buscarPorID
        .mockResolvedValueOnce(usuarioLogado) // logado
        .mockResolvedValueOnce(usuarioLogado); // para o próprio ID

      const req = {
        user_id: "6871d7b722e1cf0b2d0f3aab",
        params: { id: "6871d7b722e1cf0b2d0f3aab" },
      };

      const result = await service.listar(req);

      expect(result).toEqual(usuarioLogado);
    });

    it("Munícipe deve receber erro ao acessar outro usuário", async () => {
      repositoryMock.buscarPorID.mockResolvedValue({
        ...usuarioBase,
        nivel_acesso: { municipe: true },
      });

      const req = {
        user_id: "6871d7b722e1cf0b2d0f3aab",
        params: { id: "outro-id" },
      };

      await expect(service.listar(req)).rejects.toThrow(CustomError);
    });

    it("Secretário deve listar apenas usuários da mesma secretaria", async () => {
      const secretario = {
        ...usuarioBase,
        _id: "sec-id",
        nivel_acesso: { secretario: true },
        secretarias: ["sec-1"],
      };
      const usuarioDaMesmaSecretaria = {
        _id: "outro-id",
        secretarias: ["sec-1"],
      };

      repositoryMock.buscarPorID.mockResolvedValueOnce(secretario); // usuário logado
      repositoryMock.buscarPorID.mockResolvedValueOnce(
        usuarioDaMesmaSecretaria
      ); // usuário pesquisado

      const req = {
        user_id: "sec-id",
        params: { id: "outro-id" },
      };

      const result = await service.listar(req);

      expect(result).toEqual(usuarioDaMesmaSecretaria);
    });

    it("Secretário deve receber erro ao acessar usuário de outra secretaria", async () => {
      const secretario = {
        ...usuarioBase,
        _id: "sec-id",
        nivel_acesso: { secretario: true },
        secretarias: ["sec-1"],
      };
      const outroUsuario = {
        _id: "outro-id",
        secretarias: ["sec-2"],
      };

      repositoryMock.buscarPorID.mockResolvedValueOnce(secretario);
      repositoryMock.buscarPorID.mockResolvedValueOnce(outroUsuario);

      const req = {
        user_id: "sec-id",
        params: { id: "outro-id" },
      };

      await expect(service.listar(req)).rejects.toThrow(CustomError);
    });

    it("Operador deve acessar somente seus próprios dados", async () => {
      const operador = {
        _id: "op-id",
        nome: "Operador",
        nivel_acesso: { operador: true },
      };

      repositoryMock.buscarPorID
        .mockResolvedValueOnce(operador) // para req.user_id
        .mockResolvedValueOnce(operador); // para req.params.id

      const req = { user_id: "op-id", params: { id: "op-id" } };

      const result = await service.listar(req);

      expect(result).toEqual(operador);
    });

    it("Operador não pode acessar outro usuário", async () => {
      repositoryMock.buscarPorID.mockResolvedValue({
        ...usuarioBase,
        nivel_acesso: { operador: true },
      });

      const req = { user_id: "op-id", params: { id: "outro-id" } };

      await expect(service.listar(req)).rejects.toThrow(CustomError);
    });

//     it("Secretário deve listar usuários apenas das suas secretarias quando não há ID nos params", async () => {
//   const req = {
//     user_id: "user-1",
//     params: {},
//     query: {}
//   };

//   const repositoryMock = {
//     buscarPorID: jest.fn().mockResolvedValue({
//       _id: "user-1",
//       nivel_acesso: { secretario: true },
//       secretarias: [
//         { _id: "sec-1" },
//         { _id: "sec-2" }
//       ]
//     }),
//     listar: jest.fn().mockResolvedValue([{ _id: "user-2" }, { _id: "user-3" }])
//   };

//   const service = new UsuarioService(repositoryMock);
//   const resultado = await service.listar(req);

//   expect(req.query.secretaria).toContain("sec-1");
//   expect(req.query.secretaria).toContain("sec-2");
//   expect(repositoryMock.listar).toHaveBeenCalledWith(req);
//   expect(resultado).toEqual([{ _id: "user-2" }, { _id: "user-3" }]);
// });


  });

  describe("UsuarioService - criar", () => {
    it("Deve lançar erro se o usuário logado for munícipe", async () => {
      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "id-municipe",
        nivel_acesso: { municipe: true },
      });

      const req = { user_id: "id-municipe" };

      await expect(
        service.criar({ email: "teste@email.com" }, req)
      ).rejects.toThrow(CustomError);

      expect(repositoryMock.buscarPorID).toHaveBeenCalledWith("id-municipe");
    });

    it("Deve validar o email e criar usuário com senha hasheada", async () => {
      const dados = {
        nome: "Novo Usuário",
        email: "novo@email.com",
        senha: "Senha@123",
      };

      const req = { user_id: "id-admin" };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "id-admin",
        nivel_acesso: { administrador: true },
      });

      repositoryMock.buscarPorEmail.mockResolvedValue(null);

      // Hash da senha
      AuthHelper.hashPassword.mockResolvedValue({ senha: "senha-hash" });

      const usuarioCriado = { ...dados, senha: "senha-hash" };
      repositoryMock.criar.mockResolvedValue(usuarioCriado);

      const resultado = await service.criar({ ...dados }, req);

      expect(repositoryMock.buscarPorEmail).toHaveBeenCalledWith(
        "novo@email.com",
        null
      );
      expect(AuthHelper.hashPassword).toHaveBeenCalledWith("Senha@123");
      expect(repositoryMock.criar).toHaveBeenCalledWith({
        ...dados,
        senha: "senha-hash",
      });
      expect(resultado).toEqual(usuarioCriado);
    });
  });

  describe("UsuarioService - criarComSenha", () => {
    it("Deve criar munícipe com senha hasheada e grupo correto", async () => {
      const input = {
        nome: "João",
        email: "joao@teste.com",
        senha: "Senha@123",
        grupo: "não deve usar",
        nivel_acesso: { administrador: true },
      };

      repositoryMock.buscarPorEmail.mockResolvedValue(null);

      AuthHelper.hashPassword.mockResolvedValue({ senha: "senha-hash" });

      grupoRepositoryMock.buscarPorNome.mockResolvedValue({ _id: "grupo-id" });

      const mockUsuarioCriado = {
        _id: "user-id",
        nome: "João",
        email: "joao@teste.com",
        senha: "senha-hash",
        grupo: "grupo-id",
        nivel_acesso: {
          municipe: true,
          operador: false,
          secretario: false,
          administrador: false,
        },
      };

      repositoryMock.criar.mockResolvedValue({ ...mockUsuarioCriado });

      const resultado = await service.criarComSenha({ ...input });

      // senha deve ser removida do retorno
      const esperado = { ...mockUsuarioCriado };
      delete esperado.senha;

      expect(repositoryMock.buscarPorEmail).toHaveBeenCalledWith(
        "joao@teste.com",
        null
      );
      expect(AuthHelper.hashPassword).toHaveBeenCalledWith("Senha@123");
      expect(grupoRepositoryMock.buscarPorNome).toHaveBeenCalledWith(
        "Municipe"
      );
      expect(repositoryMock.criar).toHaveBeenCalledWith({
        nome: "João",
        email: "joao@teste.com",
        senha: "senha-hash",
        grupo: "grupo-id",
        nivel_acesso: {
          municipe: true,
          operador: false,
          secretario: false,
          administrador: false,
        },
      });
      expect(resultado).toEqual(esperado);
    });

    it('Deve criar munícipe mesmo que grupo "municipe" não seja encontrado', async () => {
      const input = {
        nome: "Ana",
        email: "ana@teste.com",
        senha: "Senha@123",
      };

      repositoryMock.buscarPorEmail.mockResolvedValue(null);
      AuthHelper.hashPassword.mockResolvedValue({ senha: "senha-hash" });
      grupoRepositoryMock.buscarPorNome.mockResolvedValue(null); // grupo não encontrado

      repositoryMock.criar.mockResolvedValue({
        ...input,
        senha: "senha-hash",
        nivel_acesso: {
          municipe: true,
          operador: false,
          secretario: false,
          administrador: false,
        },
      });

      const resultado = await service.criarComSenha({ ...input });

      expect(grupoRepositoryMock.buscarPorNome).toHaveBeenCalledWith(
        "Municipe"
      );
      expect(resultado).not.toHaveProperty("senha");
    });

    it("Deve lançar erro se email já estiver cadastrado", async () => {
      repositoryMock.buscarPorEmail.mockResolvedValue({
        email: "existe@teste.com",
      });

      await expect(
        service.criarComSenha({
          nome: "Repetido",
          email: "existe@teste.com",
          senha: "123",
        })
      ).rejects.toThrow(CustomError);
    });
  });

  describe("UsuarioService - atualizar", () => {
    let service;
    let repositoryMock;

    beforeEach(() => {
      repositoryMock = {
        buscarPorID: jest.fn(),
        atualizar: jest.fn(),
      };

      UsuarioRepository.mockImplementation(() => repositoryMock);
      service = new UsuarioService();

      // Mock de ensureUserExists (interno)
      service.ensureUserExists = jest.fn().mockResolvedValue(true);
    });

    it("Admin deve atualizar qualquer usuário com sucesso", async () => {
      const req = { user_id: "admin-id" };
      const id = "outro-id";
      const parsedData = {
        nome: "Atualizado",
        email: "x@x.com",
        senha: "123",
        nivel_acesso: {},
        grupo: "x",
      };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "admin-id",
        nivel_acesso: { administrador: true },
      });

      const esperado = { _id: id, nome: "Atualizado" };
      repositoryMock.atualizar.mockResolvedValue(esperado);

      const resultado = await service.atualizar(id, { ...parsedData }, req);

      expect(service.ensureUserExists).toHaveBeenCalledWith(id);
      expect(repositoryMock.atualizar).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ nome: "Atualizado" })
      );
      expect(resultado).toEqual(esperado);
    });

    it("Usuário comum não pode atualizar outro usuário", async () => {
      const req = { user_id: "user-id" };
      const id = "outro-id";

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "user-id",
        nivel_acesso: { administrador: false },
      });

      await expect(service.atualizar(id, {}, req)).rejects.toThrow(CustomError);
    });

    it("Usuário comum pode atualizar a si mesmo (sem campos sensíveis)", async () => {
      const req = { user_id: "user-id" };
      const id = "user-id";
      const dadosOriginais = {
        nome: "Atualizado",
        grupo: "grupo-id",
        nivel_acesso: { operador: true },
        secretarias: ["x"],
        senha: "abc",
        email: "test@test.com",
      };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "user-id",
        nivel_acesso: { administrador: false },
      });

      repositoryMock.atualizar.mockResolvedValue({
        _id: id,
        nome: "Atualizado",
      });

      const resultado = await service.atualizar(id, { ...dadosOriginais }, req);

      // campos sensíveis devem ser removidos
      expect(repositoryMock.atualizar).toHaveBeenCalledWith(
        id,
        expect.not.objectContaining({
          grupo: expect.anything(),
          nivel_acesso: expect.anything(),
          secretarias: expect.anything(),
          senha: expect.anything(),
          email: expect.anything(),
        })
      );

      expect(resultado).toEqual({ _id: id, nome: "Atualizado" });
    });

    it("Deve lançar erro se usuário a ser atualizado não existir", async () => {
      const req = { user_id: "admin-id" };
      const id = "nao-existe";

      service.ensureUserExists = jest.fn().mockImplementation(() => {
        throw new CustomError({ customMessage: "Usuário não encontrado." });
      });

      await expect(service.atualizar(id, {}, req)).rejects.toThrow(
        "Usuário não encontrado."
      );
    });
  });

  describe("UsuarioService - deletar", () => {
    it("Administrador deve deletar qualquer usuário com sucesso", async () => {
      const req = { user_id: "admin-id" };
      const id = "alvo-id";

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "admin-id",
        nivel_acesso: { administrador: true },
      });

      const retornoEsperado = { acknowledged: true };
      repositoryMock.deletar.mockResolvedValue(retornoEsperado);

      const resultado = await service.deletar(id, req);

      expect(service.ensureUserExists).toHaveBeenCalledWith(id);
      expect(repositoryMock.deletar).toHaveBeenCalledWith(id);
      expect(resultado).toEqual(retornoEsperado);
    });

    it("Munícipe deve deletar a si mesmo com sucesso", async () => {
      const req = { user_id: "municipe-id" };
      const id = "municipe-id";

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "municipe-id",
        nivel_acesso: { municipe: true },
      });

      repositoryMock.deletar.mockResolvedValue({ acknowledged: true });

      const resultado = await service.deletar(id, req);

      expect(repositoryMock.deletar).toHaveBeenCalledWith(id);
      expect(resultado).toEqual({ acknowledged: true });
    });

    it("Munícipe não pode deletar outro usuário", async () => {
      const req = { user_id: "municipe-id" };
      const id = "outro-id";

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "municipe-id",
        nivel_acesso: { municipe: true },
      });

      await expect(service.deletar(id, req)).rejects.toThrow(CustomError);
      expect(repositoryMock.deletar).not.toHaveBeenCalled();
    });

    // it('Deve lançar erro se usuário a ser deletado não existir', async () => {
    //   const req = { user_id: 'admin-id' };
    //   const id = 'nao-existe';

    //   // Simula o erro lançado por ensureUserExists
    //   service.ensureUserExists = jest.fn().mockImplementation(() => {
    //     throw new CustomError({ customMessage: 'Usuário não encontrado.' });
    //   });

    //   await expect(service.deletar(id, req)).rejects.toThrow('Usuário não encontrado.');
    // });
  });

  describe("UsuarioService - atualizarFoto", () => {
    it("Admin deve atualizar a própria foto com sucesso", async () => {
      const id = "admin-id";
      const req = { user_id: "admin-id" };
      const parsedData = { link_imagem: "imagem.png" };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "admin-id",
        nivel_acesso: { admin: true },
      });

      repositoryMock.atualizar.mockResolvedValue({ _id: id, ...parsedData });

      const resultado = await service.atualizarFoto(id, parsedData, req);

      expect(service.ensureUserExists).toHaveBeenCalledWith(id);
      expect(repositoryMock.atualizar).toHaveBeenCalledWith(id, parsedData);
      expect(resultado).toEqual({ _id: id, ...parsedData });
    });

    it("Usuário comum pode atualizar a própria foto", async () => {
      const id = "user-id";
      const req = { user_id: "user-id" };
      const parsedData = { link_imagem: "nova.png" };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "user-id",
        nivel_acesso: { operador: true },
      });

      repositoryMock.atualizar.mockResolvedValue({ _id: id, ...parsedData });

      const resultado = await service.atualizarFoto(id, parsedData, req);

      expect(repositoryMock.atualizar).toHaveBeenCalledWith(id, parsedData);
      expect(resultado).toEqual({ _id: id, ...parsedData });
    });

    it("Admin não pode atualizar a foto de outro usuário", async () => {
      const id = "outro-id";
      const req = { user_id: "admin-id" };
      const parsedData = { link_imagem: "x.png" };

      repositoryMock.buscarPorID.mockResolvedValue({
        _id: "admin-id",
        nivel_acesso: { admin: true },
      });

      await expect(service.atualizarFoto(id, parsedData, req)).rejects.toThrow(
        CustomError
      );
      expect(repositoryMock.atualizar).not.toHaveBeenCalled();
    });

    it("Deve lançar erro se usuário não existir", async () => {
      service.ensureUserExists = jest.fn().mockImplementation(() => {
        throw new CustomError({ customMessage: "Usuário não encontrado." });
      });

      const id = "nao-existe";
      const req = { user_id: "qualquer" };
      const parsedData = { link_imagem: "x.png" };

      await expect(service.atualizarFoto(id, parsedData, req)).rejects.toThrow(
        "Usuário não encontrado."
      );
    });
  });

  // describe("UsuarioService - upload de imagem", () => {
  //   beforeEach(() => {
  //     uuidv4.mockReturnValue("uuid-foto-usuario");

  //     fs.existsSync = jest.fn().mockReturnValue(false);
  //     fs.mkdirSync = jest.fn();
  //     fs.promises.writeFile = jest.fn();

  //     const transformerMock = {
  //       resize: jest.fn().mockReturnThis(),
  //       jpeg: jest.fn().mockReturnThis(),
  //       toBuffer: jest.fn().mockResolvedValue(Buffer.from("imagem-processada")),
  //     };
  //     sharp.mockReturnValue(transformerMock);

  //     service.atualizarFoto = jest.fn();
  //     jest.spyOn(UsuarioUpdateSchema, "parse").mockImplementation(() => true);
  //   });

  //   it("deve processar e salvar a imagem corretamente", async () => {
  //     const fileBuffer = Buffer.from("imagem-de-teste");
  //     const file = {
  //       name: "foto.jpg",
  //       data: fileBuffer,
  //     };
  //     const req = { user_id: "usuario-001" };
  //     const userId = "usuario-001";

  //     fs.existsSync.mockReturnValue(false);

  //     const transformerMock = {
  //       resize: jest.fn().mockReturnThis(),
  //       jpeg: jest.fn().mockReturnThis(),
  //       toBuffer: jest.fn().mockResolvedValue(Buffer.from("imagem-processada")),
  //     };
  //     sharp.mockReturnValue(transformerMock);

  //     await service.processarFoto(userId, file, req);

  //     const expectedFilename = "uuid-foto-usuario.jpg";
  //     const expectedPath = path.join(
  //       __dirname,
  //       "..",
  //       "..",
  //       "uploads",
  //       expectedFilename
  //     );

  //     expect(fs.existsSync).toHaveBeenCalled();
  //     expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
  //       recursive: true,
  //     });
  //     expect(sharp).toHaveBeenCalledWith(fileBuffer);
  //     expect(transformerMock.resize).toHaveBeenCalledWith(400, 400, {
  //       fit: sharp.fit.cover,
  //       position: sharp.strategy.entropy,
  //     });
  //     expect(transformerMock.jpeg).toHaveBeenCalledWith({ quality: 80 });

  //     const writeCall = fs.promises.writeFile.mock.calls[0];
  //     expect(writeCall[0]).toMatch(/uuid-foto-usuario\.jpg$/);
  //     expect(writeCall[1]).toBeInstanceOf(Buffer);

  //     expect(UsuarioUpdateSchema.parse).toHaveBeenCalledWith({
  //       link_imagem: expectedFilename,
  //     });

  //     expect(service.atualizarFoto).toHaveBeenCalledWith(
  //       userId,
  //       { link_imagem: expectedFilename },
  //       req
  //     );
  //   });
  // });

  describe("UsuarioService - ensureUserExists", () => {
    let service;
    let repositoryMock;

    beforeEach(() => {
      repositoryMock = {
        buscarPorID: jest.fn(),
      };
      UsuarioRepository.mockImplementation(() => repositoryMock);
      service = new UsuarioService();
    });

    it("Deve retornar o usuário quando existir", async () => {
      const id = "existe-id";
      const usuarioMock = { _id: id, nome: "Usuário Existente" };
      repositoryMock.buscarPorID.mockResolvedValue(usuarioMock);

      const resultado = await service.ensureUserExists(id);

      expect(resultado).toEqual(usuarioMock);
    });

    it("Deve lançar erro quando usuário não existir", async () => {
      repositoryMock.buscarPorID.mockResolvedValue(null);

      await expect(service.ensureUserExists("nao-existe-id")).rejects.toThrow(
        CustomError
      );
    });

    it("deve lançar erro se a imagem exceder o tamanho máximo permitido (50MB)", async () => {
      const file = {
        name: "imagem.jpg",
        size: 51 * 1024 * 1024, // 51MB
        data: Buffer.from("..."),
      };
      const req = { user_id: "usuario-001" };
      const userId = "usuario-001";

      await expect(service.processarFoto(userId, file, req)).rejects.toThrow(
        /Arquivo não pode exceder 50 MB/
      );
    });

    it("deve lançar erro se a extensão do arquivo for inválida", async () => {
      const file = {
        name: "arquivo.exe",
        size: 1024 * 1024, // 1MB
        data: Buffer.from("..."),
      };
      const req = { user_id: "usuario-001" };
      const userId = "usuario-001";

      await expect(service.processarFoto(userId, file, req)).rejects.toThrow(
        /Extensão de arquivo inválida/
      );
    });
  });
});
