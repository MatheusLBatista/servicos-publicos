// tests/DemandaService.spec.js
import DemandaService from "../../service/DemandaService.js";
import DemandaRepository from "../../repository/DemandaRepository.js";
import UsuarioRepository from "../../repository/UsuarioRepository.js";
import SecretariaRepository from "../../repository/SecretariaRepository.js";
import {
  CustomError,
  HttpStatusCodes,
  messages,
} from "../../utils/helpers/index.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { DemandaUpdateSchema } from "../../utils/validators/schemas/zod/DemandaSchema.js";

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

describe("DemandaService", () => {
  let service;
  let repoMock, userRepoMock, secRepoMock;
  const ctx = (id) => ({ params: { id }, user_id: "user1" });

  beforeEach(() => {
    repoMock = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      buscarPorID: jest.fn(),
      atribuir: jest.fn(),
      devolver: jest.fn(),
      resolver: jest.fn(),
    };
    userRepoMock = { buscarPorID: jest.fn(), buscarPorIDs: jest.fn() };
    secRepoMock = { buscarPorTipo: jest.fn() };
    DemandaRepository.mockImplementation(() => repoMock);
    UsuarioRepository.mockImplementation(() => userRepoMock);
    SecretariaRepository.mockImplementation(() => secRepoMock);
    service = new DemandaService();
  });

  afterEach(() => jest.resetAllMocks());

  describe("listar", () => {
    it("lista demandas sem ID, acesso irrestrito (sem perfil)", async () => {
      const demandas = {
        docs: [{ tipo: "X" }, { tipo: "Y" }],
      };
      repoMock.listar.mockResolvedValue(demandas);
      userRepoMock.buscarPorID.mockResolvedValue({ nivel_acesso: {} });
      service.filtrarDemandaPorUser = jest.fn((d) =>
        Promise.resolve({ ...d, filtrado: true })
      );

      const res = await service.listar({ params: {}, user_id: "u1" });

      expect(repoMock.listar).toHaveBeenCalled();
      expect(service.filtrarDemandaPorUser).toHaveBeenCalledTimes(2);
      expect(res.docs.every((d) => d.filtrado)).toBe(true);
    });

    it("lista demandas como secretario (filtra por secretaria)", async () => {
      const demandas = {
        docs: [
          { tipo: "A", secretarias: [{ _id: "s1" }] },
          { tipo: "B", secretarias: [{ _id: "s2" }] },
        ],
      };

      repoMock.listar.mockResolvedValue(demandas);
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "s1" }],
      });

      const res = await service.listar({ params: {}, user_id: "u1" });

      expect(res.docs).toHaveLength(1);
      expect(res.docs[0].tipo).toBe("A");
    });

    it("lista demandas como operador (filtra por secretaria e usuario)", async () => {
      const demandas = {
        docs: [
          {
            tipo: "A",
            secretarias: [{ _id: "s1" }],
            usuarios: [{ _id: "u1" }],
          },
          {
            tipo: "B",
            secretarias: [{ _id: "s2" }],
            usuarios: [{ _id: "u1" }],
          },
          {
            tipo: "C",
            secretarias: [{ _id: "s1" }],
            usuarios: [{ _id: "outro" }],
          },
        ],
      };

      repoMock.listar.mockResolvedValue(demandas);
      userRepoMock.buscarPorID.mockResolvedValue({
        _id: "u1",
        nivel_acesso: { operador: true },
        secretarias: [{ _id: "s1" }],
      });

      const res = await service.listar({ params: {}, user_id: "u1" });

      expect(res.docs).toHaveLength(1);
      expect(res.docs[0].tipo).toBe("A");
    });

    it("lista demandas como munícipe (filtra por usuário)", async () => {
      const demandas = {
        docs: [
          { tipo: "X", usuarios: [{ _id: "u1" }] },
          { tipo: "Y", usuarios: [{ _id: "u2" }] },
        ],
      };

      repoMock.listar.mockResolvedValue(demandas);
      userRepoMock.buscarPorID.mockResolvedValue({
        _id: "u1",
        nivel_acesso: { municipe: true },
      });

      const res = await service.listar({ params: {}, user_id: "u1" });

      expect(res.docs).toHaveLength(1);
      expect(res.docs[0].tipo).toBe("X");
    });

    it("retorna demanda específica por ID se passado", async () => {
      const demanda = { _id: "d1", tipo: "X" };
      repoMock.buscarPorID.mockResolvedValue(demanda);

      const res = await service.listar({ params: { id: "d1" }, user_id: "u1" });

      expect(repoMock.buscarPorID).toHaveBeenCalledWith("d1");
      expect(res).toEqual(demanda);
    });
  });

  describe("criar", () => {
    const req = { user_id: "u1" };
    it("cria demanda para municipe", async () => {
      const municipe = { nivel_acesso: { municipe: true } };
      userRepoMock.buscarPorID.mockResolvedValue(municipe);
      secRepoMock.buscarPorTipo.mockResolvedValue({ _id: "s1" });
      repoMock.criar.mockResolvedValue({ id: "d1", tipo: "Coleta" });

      const data = { tipo: "Coleta" };
      const res = await service.criar(data, req);

      expect(repoMock.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          usuarios: ["u1"],
          secretarias: ["s1"],
        })
      );
      expect(res).toEqual({ id: "d1", tipo: "Coleta" });
    });

    it("não permite operador criar demanda", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { operador: true },
      });
      await expect(service.criar({ tipo: "Coleta" }, req)).rejects.toThrow(
        CustomError
      );
    });
  });

  describe("atualizar", () => {
    const req = { user_id: "u1" };
    it("atualiza demanda removendo campos proibidos", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { municipe: true },
      });
      repoMock.buscarPorID.mockResolvedValue({ id: "d1" });
      repoMock.atualizar.mockResolvedValue({ id: "d1", status: "ok" });

      const input = { tipo: "X", data: "2025-06-01", status: "ok" };
      const res = await service.atualizar("d1", { ...input }, req);

      expect(repoMock.buscarPorID).toHaveBeenCalledWith("d1");
      expect(repoMock.atualizar).toHaveBeenCalledWith("d1", { status: "ok" });
      expect(res).toEqual({ id: "d1", status: "ok" });
    });

    it("não permite não municipe atualizar", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { operador: true },
      });
      await expect(service.atualizar("d1", {}, req)).rejects.toThrow(
        CustomError
      );
    });
  });

  describe("atribuir", () => {
    const req = { user_id: "u1" };
    it("atribui operadores se secretario", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "s1" }],
      });
      repoMock.buscarPorID.mockResolvedValue({
        secretarias: [{ _id: "s1" }],
        usuarios: [],
      });
      userRepoMock.buscarPorIDs.mockResolvedValue([
        { _id: "op1", nivel_acesso: { operador: true } },
      ]);
      userRepoMock.buscarPorIDs.mockResolvedValueOnce([
        { _id: "op1", nivel_acesso: { operador: true } },
      ]);
      repoMock.atribuir.mockResolvedValue({ id: "d1", status: "Em andamento" });

      const res = await service.atribuir("d1", { usuarios: ["op1"] }, req);
      expect(repoMock.atribuir).toHaveBeenCalledWith(
        "d1",
        expect.objectContaining({
          usuarios: expect.arrayContaining(["op1"]),
          status: "Em andamento",
        })
      );
      expect(res.status).toBe("Em andamento");
    });

    it("não permite não secretario atribuir", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { operador: true },
      });
      await expect(
        service.atribuir("d1", { usuarios: [] }, req)
      ).rejects.toThrow(CustomError);
    });

    it("deve lançar erro se algum usuário não for operador", async () => {
      const id = "d1";
      const parsedData = {
        usuarios: ["u2", "u3"],
      };
      const req = { user_id: "secretario1" };

      userRepoMock.buscarPorID.mockResolvedValue({
        _id: "secretario1",
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "s1" }],
      });

      repoMock.buscarPorID.mockResolvedValue({
        _id: id,
        secretarias: [{ _id: "s1" }],
        usuarios: [],
      });

      userRepoMock.buscarPorIDs.mockResolvedValue([
        { _id: "u2", nivel_acesso: { operador: true } },
        { _id: "u3", nivel_acesso: { municipe: true } }, // esse causa o erro
      ]);

      await expect(service.atribuir(id, parsedData, req)).rejects.toMatchObject(
        {
          customMessage: "Só é possível associar usuários do tipo operador.",
        }
      );
    });

    it("deve retornar erro se o secretário não tem permissão para a demanda (secretarias incompatíveis)", async () => {
      const id = "demanda-id";
      const parsedData = { usuarios: ["operador-id"] };
      const req = { user_id: "sec-id" };

      // Mock usuário secretário, mas sem secretarias compatíveis
      userRepoMock.buscarPorID.mockResolvedValue({
        id: "sec-id",
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "sec-001" }],
      });

      // Mock demanda com secretarias diferentes
      repoMock.buscarPorID.mockResolvedValue({
        id,
        usuarios: [],
        secretarias: [{ _id: "outra-sec" }],
      });

      await expect(service.atribuir(id, parsedData, req)).rejects.toMatchObject(
        {
          customMessage: "Você não tem permissão para atribuir essa demanda.",
        }
      );
    });

    it("deve retornar erro se nenhum usuário operador for informado", async () => {
      const id = "demanda-id";
      const parsedData = { usuarios: [] };
      const req = { user_id: "sec-id" };

      userRepoMock.buscarPorID.mockResolvedValue({
        id: "sec-id",
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "sec-001" }],
      });

      repoMock.buscarPorID.mockResolvedValue({
        id,
        usuarios: [],
        secretarias: [{ _id: "sec-001" }],
      });

      await expect(service.atribuir(id, parsedData, req)).rejects.toMatchObject(
        {
          customMessage:
            "Você deve informar pelo menos um usuário operador para atribuir.",
        }
      );
    });

    it("deve manter usuários do tipo munícipe já associados à demanda", async () => {
      const id = "demanda-id";
      const parsedData = { usuarios: ["op1"] };
      const req = { user_id: "sec-id" };

      // Secretário válido
      userRepoMock.buscarPorID.mockResolvedValue({
        id: "sec-id",
        nivel_acesso: { secretario: true },
        secretarias: [{ _id: "sec-001" }],
      });

      repoMock.buscarPorID.mockResolvedValue({
        id,
        usuarios: [{ _id: "municipe-id" }],
        secretarias: [{ _id: "sec-001" }],
      });

      userRepoMock.buscarPorIDs.mockImplementation(async (ids) => {
        return ids.map((id) => {
          if (id === "municipe-id") {
            return { _id: id, nivel_acesso: { municipe: true } };
          } else if (id === "op1") {
            return { _id: id, nivel_acesso: { operador: true } };
          }
          return { _id: id, nivel_acesso: {} };
        });
      });

      repoMock.atribuir.mockResolvedValue({ status: "Em andamento" });

      const result = await service.atribuir(id, parsedData, req);

      expect(repoMock.atribuir).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          usuarios: expect.arrayContaining(["op1", "municipe-id"]),
          status: "Em andamento",
        })
      );

      expect(result).toEqual({ status: "Em andamento" });
    });
  });

  describe("devolver", () => {
    const req = { user_id: "u1" };
    it("devolve demanda removendo operador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { operador: true },
        _id: "u1",
      });
      repoMock.buscarPorID.mockResolvedValue({ usuarios: [{ _id: "u1" }] });
      repoMock.devolver.mockResolvedValue({ id: "d1", status: "Em aberto" });

      const res = await service.devolver("d1", { motivo_devolucao: "X" }, req);
      expect(repoMock.devolver).toHaveBeenCalledWith(
        "d1",
        expect.objectContaining({
          motivo_devolucao: "X",
          status: "Em aberto",
        })
      );
      expect(res.status).toBe("Em aberto");
    });

    it("nega se não é operador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: {},
        _id: "u1",
      });
      await expect(
        service.devolver("d1", { motivo_devolucao: "X" }, req)
      ).rejects.toThrow(CustomError);
    });
  });

  describe("resolver", () => {
    const req = { user_id: "u1" };
    it("resolve demanda se operador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { operador: true },
      });
      repoMock.buscarPorID.mockResolvedValue({ usuarios: [] });
      repoMock.resolver.mockResolvedValue({ id: "d1", status: "Concluída" });

      const res = await service.resolver(
        "d1",
        { resolucao: "OK", link_imagem_resolucao: "img.png" },
        req
      );
      expect(repoMock.resolver).toHaveBeenCalledWith(
        "d1",
        expect.objectContaining({
          resolucao: "OK",
          status: "Concluída",
        })
      );
      expect(res.status).toBe("Concluída");
    });

    it("nega se não é operador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({ nivel_acesso: {} });
      await expect(service.resolver("d1", {}, req)).rejects.toThrow(
        CustomError
      );
    });
  });

  describe("deletar", () => {
    const req = { user_id: "u1" };
    it("deleta se usuário é municipe criador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { municipe: true },
        _id: "u1",
      });
      repoMock.buscarPorID.mockResolvedValue({ usuarios: [{ _id: "u1" }] });
      repoMock.deletar.mockResolvedValue({ deleted: true });

      const res = await service.deletar("d1", req);
      expect(repoMock.deletar).toHaveBeenCalledWith("d1");
      expect(res.deleted).toBe(true);
    });

    it("nega se municipe não criador", async () => {
      userRepoMock.buscarPorID.mockResolvedValue({
        nivel_acesso: { municipe: true },
        _id: "u2",
      });
      repoMock.buscarPorID.mockResolvedValue({ usuarios: [{ _id: "u1" }] });
      await expect(service.deletar("d1", req)).rejects.toThrow(CustomError);
    });
  });

  describe("processarFoto", () => {
    it("deve lançar erro se a extensão do arquivo for inválida", async () => {
      const demandaId = "demanda123";
      const req = { user_id: "usuario1" };
      const file = {
        name: "arquivo.exe",
        size: 1024,
        data: Buffer.from([]),
        md5: "mocked-md5",
      };

      await expect(
        service.processarFoto(demandaId, file, "inicio", req)
      ).rejects.toMatchObject({
        customMessage: "Extensão inválida. Permitido: jpg, jpeg, png, svg.",
      });
    });

    it("deve lançar erro se o arquivo exceder 50MB", async () => {
      const demandaId = "demanda123";
      const req = { user_id: "usuario1" };
      const file = {
        name: "imagem.png",
        size: 51 * 1024 * 1024, // 51MB
        data: Buffer.from([]),
        md5: "mocked-md5",
      };

      await expect(
        service.processarFoto(demandaId, file, "inicio", req)
      ).rejects.toMatchObject({
        customMessage: "Arquivo excede 50MB.",
      });
    });
  });

  describe("nivelAcesso", () => {
    it("deve retornar campos corretos para administrador", async () => {
      const nivelAcesso = { administrador: true };
      const result = await service.nivelAcesso(nivelAcesso);

      expect(result).toEqual(
        expect.arrayContaining([
          "_id",
          "tipo",
          "status",
          "data",
          "resolucao",
          "feedback",
          "descricao",
          "avaliacao_resolucao",
          "link_imagem",
          "motivo_devolucao",
          "link_imagem_resolucao",
          "usuarios",
          "secretarias",
          "createdAt",
          "updatedAt",
          "estatisticas",
          "endereco",
        ])
      );
    });

    it("deve retornar campos corretos para secretario", async () => {
      const nivelAcesso = { secretario: true };
      const result = await service.nivelAcesso(nivelAcesso);

      expect(result).toEqual(
        expect.arrayContaining([
          "_id",
          "tipo",
          "status",
          "data",
          "resolucao",
          "feedback",
          "descricao",
          "avaliacao_resolucao",
          "link_imagem",
          "motivo_devolucao",
          "link_imagem_resolucao",
          "usuarios",
          "createdAt",
          "updatedAt",
          "estatisticas",
          "endereco",
        ])
      );
    });

    it("deve retornar campos corretos para operador", async () => {
      const nivelAcesso = { operador: true };
      const result = await service.nivelAcesso(nivelAcesso);

      expect(result).toEqual(
        expect.arrayContaining([
          "_id",
          "tipo",
          "status",
          "data",
          "resolucao",
          "feedback",
          "descricao",
          "avaliacao_resolucao",
          "link_imagem",
          "motivo_devolucao",
          "link_imagem_resolucao",
          "createdAt",
          "updatedAt",
          "estatisticas",
          "endereco",
        ])
      );
    });

    it("deve retornar campos corretos para municipe", async () => {
      const nivelAcesso = { municipe: true };
      const result = await service.nivelAcesso(nivelAcesso);

      expect(result).toEqual(
        expect.arrayContaining([
          "tipo",
          "_id",
          "status",
          "resolucao",
          "feedback",
          "descricao",
          "avaliacao_resolucao",
          "link_imagem_resolucao",
          "link_imagem",
          "endereco",
          "createdAt",
          "updatedAt",
          "estatisticas",
        ])
      );
    });

    it("deve retornar array vazio se nenhum nível válido for passado", async () => {
      const nivelAcesso = { outro: true };
      const result = await service.nivelAcesso(nivelAcesso);

      expect(result).toEqual([]);
    });
  });

  describe("filtrarDemandaPorUser", () => {
    it("deve manter apenas os campos permitidos para um secretario", async () => {
      const demanda = {
        _id: "1",
        tipo: "A",
        descricao: "desc",
        campoNaoPermitido: "remover",
      };
      const usuario = { nivel_acesso: { secretario: true } };

      const resultado = await service.filtrarDemandaPorUser(
        { ...demanda },
        usuario
      );

      expect(resultado).not.toHaveProperty("campoNaoPermitido");
      expect(resultado).toHaveProperty("tipo");
      expect(resultado).toHaveProperty("descricao");
    });

    it("deve remover todos os campos se nenhum for permitido", async () => {
      const demanda = { x: 1, y: 2 };
      const usuario = { nivel_acesso: { outro: true } };

      const resultado = await service.filtrarDemandaPorUser(
        { ...demanda },
        usuario
      );

      expect(Object.keys(resultado)).toHaveLength(0);
    });
  });

  describe("removerCampos", () => {
    it("deve remover os campos especificados do objeto", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const campos = ["a", "c"];

      service.removerCampos(obj, campos);

      expect(obj).toEqual({ b: 2 });
    });
  });

  describe("manterCampos", () => {
    it("deve manter apenas os campos especificados no objeto", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const camposPermitidos = ["b"];

      service.manterCampos(obj, camposPermitidos);

      expect(obj).toEqual({ b: 2 });
    });
  });

  describe("DemandaService - atualizarFoto", () => {
    let demandaService;
    let mockUserRepository;
    let mockRepository;

    beforeEach(() => {
      mockUserRepository = {
        buscarPorID: jest.fn(),
      };

      mockRepository = {
        buscarPorID: jest.fn(),
        atualizar: jest.fn(),
      };

      demandaService = new DemandaService();
      demandaService.userRepository = mockUserRepository;
      demandaService.repository = mockRepository;
      demandaService.ensureDemandaExists = jest.fn(); // necessário mockar
    });

    const parsedData = { link_imagem: "http://imagem.com/foto.jpg" };

    it("deve permitir que administrador atualize a foto", async () => {
      mockUserRepository.buscarPorID.mockResolvedValue({
        _id: "123",
        nivel_acesso: { administrador: true },
      });

      mockRepository.buscarPorID.mockResolvedValue({
        usuarios: [],
      });

      mockRepository.atualizar.mockResolvedValue({ updated: true });

      const req = { user_id: "123" };
      const result = await demandaService.atualizarFoto(
        "demandaId",
        parsedData,
        req
      );

      expect(result).toEqual({ updated: true });
      expect(mockRepository.atualizar).toHaveBeenCalledWith(
        "demandaId",
        parsedData
      );
    });

    it("deve permitir que municipe relacionado atualize a foto", async () => {
      mockUserRepository.buscarPorID.mockResolvedValue({
        _id: "456",
        nivel_acesso: { municipe: true },
      });

      mockRepository.buscarPorID.mockResolvedValue({
        usuarios: [{ _id: "456" }],
      });

      mockRepository.atualizar.mockResolvedValue({ updated: true });

      const req = { user_id: "456" };
      const result = await demandaService.atualizarFoto(
        "demandaId",
        parsedData,
        req
      );

      expect(result).toEqual({ updated: true });
      expect(mockRepository.atualizar).toHaveBeenCalled();
    });

    it("deve lançar erro se municipe não estiver associado à demanda", async () => {
      mockUserRepository.buscarPorID.mockResolvedValue({
        _id: "789",
        nivel_acesso: { municipe: true },
      });

      mockRepository.buscarPorID.mockResolvedValue({
        usuarios: [{ _id: "outraPessoa" }],
      });

      const req = { user_id: "789" };

      await expect(
        demandaService.atualizarFoto("demandaId", parsedData, req)
      ).rejects.toThrow(CustomError);

      await expect(
        demandaService.atualizarFoto("demandaId", parsedData, req)
      ).rejects.toMatchObject({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        errorType: "permissionError",
      });

      expect(mockRepository.atualizar).not.toHaveBeenCalled();
    });

    it("deve lançar erro se o usuário não tiver nível de acesso válido", async () => {
      mockUserRepository.buscarPorID.mockResolvedValue({
        _id: "123",
        nivel_acesso: {},
      });

      mockRepository.buscarPorID.mockResolvedValue({
        usuarios: [{ _id: "123" }],
      });

      const req = { user_id: "123" };

      await expect(
        demandaService.atualizarFoto("demandaId", parsedData, req)
      ).rejects.toThrow(CustomError);

      expect(mockRepository.atualizar).not.toHaveBeenCalled();
    });
  });

  // describe("DemandaService - upload de imagem", () => {
  //   beforeEach(() => {
  //     uuidv4.mockReturnValue("uuid-fixo");

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
  //     jest.spyOn(DemandaUpdateSchema, "parse").mockImplementation(() => true);
  //   });

  //   it("deve processar e salvar a imagem corretamente", async () => {
  //     const fileBuffer = Buffer.from("fake-image");
  //     const file = {
  //       name: "imagem.jpg",
  //       data: fileBuffer,
  //     };
  //     const req = { user_id: "teste" };
  //     const tipo = "resolucao";
  //     const demandaId = "demanda-001";

  //     fs.existsSync.mockReturnValue(false);
  //     const transformerMock = {
  //       resize: jest.fn().mockReturnThis(),
  //       jpeg: jest.fn().mockReturnThis(),
  //       toBuffer: jest.fn().mockResolvedValue(Buffer.from("imagem-processada")),
  //     };
  //     sharp.mockReturnValue(transformerMock);

  //     await service.processarFoto(demandaId, file, tipo, req);

  //     const expectedFilename = "uuid-fixo.jpg";
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
  //     // expect(fs.promises.writeFile).toHaveBeenCalledWith(expectedPath, expect.any(Buffer));
  //     const writeCall = fs.promises.writeFile.mock.calls[0];

  //     expect(writeCall[0]).toMatch(/uuid-fixo\.jpg$/);
  //     expect(writeCall[1]).toBeInstanceOf(Buffer);

  //     expect(DemandaUpdateSchema.parse).toHaveBeenCalledWith({
  //       link_imagem_resolucao: expectedFilename,
  //     });

  //     expect(service.atualizarFoto).toHaveBeenCalledWith(
  //       demandaId,
  //       {
  //         link_imagem_resolucao: expectedFilename,
  //       },
  //       req
  //     );
  //   });
  // });
});
