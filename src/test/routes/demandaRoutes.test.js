import express from "express";
import demandaRoutes from '../../routes/demandaRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';

let app; 
let demandaId;

beforeAll(async () => {
  app = express(); 
  await DbConnect.conectar(); 
  app.use(express.json());
  app.use(demandaRoutes);

  const novaDemandaFake = {
      tipo: "Coleta",
      status: "Em andamento",
      data: new Date(),
      resolucao: "Teste de resolução",
      feedback: 4,
      _id: "6848d8204febcca70f394333",
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

    // Cria a demanda e guarda o _id
    const res = await request(app).post('/demandas').send(novaDemandaFake);
    demandaId = res.body._id;
});

describe("Rotas de demanda", () => {
  it("GET /demandas - deve retornar lista de demandas", async () => {
    const res = await request(app).get("/demandas");
    expect(res.statusCode).toBe(200);
  });

  it("GET /demandas - deve retornar demanda por ID", async () => {
    const res = await request(app).get("/demandas/6848d8204febcca70f394222");
    expect(res.statusCode).toBe(200);
  });

  it("GET /demandas - deve retornar erro caso o ID não exista", async () => {
    const res = await request(app).get("/demandas/6839c69706ec18da71924bbb");
    expect(res.statusCode).toBe(404);
  });

//   it("DELETE /demandas - deve deletar demanda", async () => {
//     const res = await request(app).delete("/demandas/6848d8204febcca70f394333");
//     expect(res.statusCode).toBe(200);
//   });

//   it("DELETE /demandas - deve retornar erro caso o ID não exista", async () => {
//     const res = await request(app).get("/demandas/6839c69706ec18da71924bbb");
//     expect(res.statusCode).toBe(404);
//   });

//   it("POST /demandas - deve criar uma nova demanda", async () => {
//     const novaDemanda = { tipo: 'Coleta', status: 'Em andamento' }
    
//     const res = await request(app).post('/demandas').send(novaDemanda);

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('_id');
//   })
});
