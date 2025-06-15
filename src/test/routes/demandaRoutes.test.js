import express from "express";
import demandaRoutes from "../../routes/demandaRoutes.js";
import DbConnect from "../../config/dbConnect.js";
import request from "supertest";
import errorHandler from "../../utils/helpers/errorHandler.js";

let app;

beforeAll(async () => {
  app = express();
  await DbConnect.conectar();
  app.use(express.json());
  app.use(demandaRoutes);
  app.use(errorHandler);
});

describe("Rotas de demanda", () => {
  it("GET - Deve retornar uma lista das demandas cadastradas", async () => {
    const res = await request(app).get("/demandas");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  /*
  it("GET - Deve retornar erro ao não encontrar rota", async () => {
    const res = await request(app).get("/demanda");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em null.");
    expect(res.body.errors[1].message).toBe("Rota não encontrada.");
  });
  */

  it("GET - Deve retornar uma demanda pelo ID", async () => {
    const res = await request(app).get("/demandas/6848d8204febcca70f394222");
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe("6848d8204febcca70f394222");
  });

  it("GET - Deve retornar erro de recurso não encontrado em demanda pelo ID não existente", async () => {
    const res = await request(app).get("/demandas/8948d8204febcca80f394222");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  });

  /*
  it("POST - Deve cadastrar uma nova demanda com sucesso", async () => {
    const novaDemanda = {
      tipo: "Coleta",
      status: "Pendente",
      data: new Date(),
      resolucao: "Teste de criação",
      feedback: 5,
      avaliacao_resolucao: "Excelente atendimento",
      link_imagem_resolucao: "https://via.placeholder.com/200.png",
      endereco: {
        logradouro: "Rua Nova",
        cep: "98765-432",
        bairro: "Jardim",
        numero: 200,
        complemento: "Casa",
      },
      usuarios: [],
    };
    const res = await request(app).post("/demandas").send(novaDemanda);
    //console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("tipo", novaDemanda.tipo);
  });
  */

  /*
  it("POST - Deve retornar erro ao cadastrar uma nova demanda com dados inválidos", async () => {
    const novaDemanda = {
      tipo: "", // Invalid tipo to trigger error
      status: "Pendente",
      data: new Date(),
      resolucao: "Teste de criação",
      feedback: 5,
      avaliacao_resolucao: "Excelente atendimento",
      link_imagem_resolucao: "https://via.placeholder.com/200.png",
      endereco: {
        logradouro: "Rua Nova",
        cep: "98765-432",
        bairro: "Jardim",
        numero: 200,
        complemento: "Casa",
      },
      usuarios: [],
    };
    const res = await request(app).post("/demandas").send(novaDemanda);
    //console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Dados inválidos fornecidos.");
  });
  */

  // it("PATCH - Deve atualizar parcialmente uma demanda", async () => {
  //   const atualizacao = {
  //     status: "Concluída",
  //   };
  //   const res = await request(app).patch(`/demandas/6848d8204febcca70f394222`).send(atualizacao);
  //   expect(res.status).toBe(200);
  //   expect(res.body.data).toHaveProperty("status", atualizacao.status);
  // });

  /*
  it("PATCH - Deve retornar erro ao tentar atualizar uma demanda inexistente", async () => {
    const res = await request(app).patch(`/demandas/666666666666666666666666`).send({
      status: "Teste inválido",
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  });
  */

  /*
  it("DELETE - Deve deletar uma demanda com sucesso", async () => {
    const res = await request(app).delete("/demandas/6848d8204febcca70f394333");
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Demanda excluída com sucesso.");
    expect(res.body.data._id).toBe("6848d8204febcca70f394333");
  });
  */

  it("DELETE - Deve retornar erro ao tentar deletar uma demanda com id inválido", async () => {
    const res = await request(app).delete("/demandas/6839c69706ec18da71924bbb");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  });
});