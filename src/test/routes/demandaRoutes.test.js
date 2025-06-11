import express from "express";
import demandaRoutes from '../../routes/demandaRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';
import errorHandler from "../../utils/helpers/errorHandler.js";

let app; 
let demandaId;

beforeAll(async () => {
  app = express(); 
  await DbConnect.conectar(); 
  app.use(express.json());
  app.use(demandaRoutes);
  app.use(errorHandler);
  jest.setTimeout(30000);

  const novaDemandaFake = {
      tipo: "Coleta",
      status: "Em andamento",
      data: new Date(),
      resolucao: "Teste de resolução",
      feedback: 4,
      avaliacao_resolucao: "Bom atendimento",
      link_imagem_resolucao: "https://via.placeholder.com/150.png",
      endereco: {
        logradouro: "Rua Teste",
        cep: "12345-678",
        bairro: "Centro",
        numero: 100,
        complemento: "Apto 101"
      },
      usuarios: []
    };

    const res = await request(app).post('/demandas').send(novaDemandaFake);
    demandaId = res.body._id;
});

//todo: organize afterall
afterAll(async () => {
  await DbConnect.desconectar();
});

describe("Rotas de demanda", () => {
  it("GET /demandas - deve retornar lista de demandas", async () => {
    const res = await request(app).get("/demandas");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  it("GET /demandas - deve retornar demanda por ID", async () => {
    const res = await request(app).get("/demandas/6848d8204febcca70f394222");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe("6848d8204febcca70f394222");
  });

  it("GET /demandas - deve retornar erro caso o ID não exista", async () => {
    const res = await request(app).get("/demandas/8948d8204febcca80f394222");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
    expect(res.body.data).toBe(null);
  });

  //todo: check why its working but only w real and already created deman
//   it("DELETE /demandas - deve deletar demanda", async () => {
//     const res = await request(app).delete("/demandas/6848d8204febcca70f394333");
//     expect(res.statusCode).toBe(200);
//   });

  it("DELETE /demandas - deve retornar erro caso o ID não exista", async () => {
    const res = await request(app).delete("/demandas/6839c69706ec18da71924bbb");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
    expect(res.body.data).toBe(null);
  });

//   it("POST /demandas - deve criar uma nova demanda", async () => {
//     const novaDemanda = {
//       tipo: "Coleta",
//       status: "Pendente",
//       data: new Date(),
//       resolucao: "Teste de criação",
//       feedback: 5,
//       avaliacao_resolucao: "Excelente atendimento",
//       link_imagem_resolucao: "https://via.placeholder.com/200.png",
//       endereco: {
//         logradouro: "Rua Nova",
//         cep: "98765-432",
//         bairro: "Jardim",
//         numero: 200,
//         complemento: "Casa",
//       },
//       usuarios: [],
//     };

//     const res = await request(app).post("/demandas").send(novaDemanda);
//     expect(res.statusCode).toBe(201); 
//     // expect(res.body.message).toBe("Demanda criada com sucesso"); // Adjust based on actual response
//     // expect(res.body.data.tipo).toBe("Manutenção");
//     // expect(res.body.data._id).toBeDefined();
//   });
});
