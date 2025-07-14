import express from "express";
import demandaRoutes from "../../routes/demandaRoutes.js";
import DbConnect from "../../config/dbConnect.js";
import request from "supertest";
import errorHandler from "../../utils/helpers/errorHandler.js";
import fakebr from 'faker-br';
import { v4 as uuid } from 'uuid';
import authRoutes from '../../routes/authRoutes.js'

let app;
let token;
let DemandaID

beforeAll(async () => {
  app = express();
  await DbConnect.conectar();
  app.use(express.json());
  app.use(authRoutes);
  app.use(demandaRoutes);
  app.use(errorHandler);

  const loginRes = await request(app)
      .post('/login')
      .send({ email: "admin@exemplo.com", senha: "Senha@123" });
  
    token = loginRes.body.data.user.accessToken;

    const Demandares = await request(app).get('/demandas').set('Authorization', `Bearer ${token}`)
          DemandaID = Demandares.body?.data?.docs[0]?._id;
          expect(DemandaID).toBeTruthy();
});

describe('Rotas de demanda', () => {
  it('GET - Deve retornar uma lista das demandas cadastradas', async () => {
    const res = await request(app).get("/demandas").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  it('GET - Deve retornar uma demanda pelo ID', async () => {
    const res = await request(app).get(`/demandas/${DemandaID}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe(DemandaID);
  });

  it('GET - Deve retornar erro de recurso não encontrado em demanda pelo ID não existente', async () => {
    const res = await request(app).get(`/demandas/686839b21eb194e97bf39133`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  });

  it('POST - Deve cadastrar uma nova demanda com sucesso', async () => {
    const novaDemanda = {
      tipo: 'Coleta',
      status: 'Em andamento',
      data: new Date(),
      resolucao: "Teste de criação",
      descricao: "testando",
      feedback: 5,
      avaliacao_resolucao: "Excelente atendimento",
      link_imagem_resolucao: fakebr.internet.url() + "/" + uuid() + ".jpg",
      endereco: {
        logradouro: "Rua Nova",
        cep: "98765-432",
        bairro: "Jardim",
        numero: 200,
        complemento: "Casa",
        cidade: "Vilhena",
        estado: "RO"
      },
      usuarios: [],
    };
    const res = await request(app).post("/demandas").send(novaDemanda).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("tipo", novaDemanda.tipo);
  });

  
  it('POST - Deve retornar erro ao cadastrar uma nova demanda com dados inválidos', async () => {
    const novaDemanda = {
      tipo: "",
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
    const res = await request(app).post("/demandas").send(novaDemanda).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Erro de validação. 5 campo(s) inválido(s).");
  });
  
  // it('PATCH - Deve atualizar parcialmente uma demanda', async () => {
  //   const atualizacao = {
  //     status: "Concluída",
  //     descricao: fakebr.lorem.sentence()
  //   };
  //   const res = await request(app).patch(`/demandas/${DemandaID}`).send(atualizacao).set('Authorization', `Bearer ${token}`);
  //   expect(res.status).toBe(200);
  //   expect(res.body.data).toHaveProperty("status", atualizacao.status);
  // });

  it('PATCH - Deve retornar erro ao tentar atualizar uma demanda inexistente', async () => {
    const res = await request(app).patch(`/demandas/686839b21eb191e97bf39143`).send({
      status: "Em andamento"
    }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  });

  it('DELETE - Deve deletar uma demanda com sucesso', async () => {
    const novaDemanda = {
      tipo: 'Coleta',
      status: 'Em andamento',
      data: new Date(),
      resolucao: "Teste de criação",
      feedback: 5,
      descricao: "tests",
      avaliacao_resolucao: "Excelente atendimento",
      link_imagem_resolucao: fakebr.internet.url() + "/" + uuid() + ".jpg",
      endereco: {
        logradouro: "Rua Nova",
        cep: "98765-432",
        bairro: "Jardim",
        numero: 200,
        complemento: "Casa",
        cidade: "Vilhena",
        estado: "RO"
      },
      usuarios: [],
    };

    const post = await request(app).post("/demandas").send(novaDemanda).set('Authorization', `Bearer ${token}`)
    expect(post.status).toBe(201);

    const demandaId = post.body.data._id;

    const res = await request(app).delete(`/demandas/${demandaId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Demanda excluída com sucesso!");
    expect(res.body.data._id).toBe(demandaId);
  });

  it('DELETE - Deve retornar erro ao tentar deletar uma demanda com id inválido', async () => {
    const res = await request(app).delete("/demandas/6839c69706ec18da71924bbb").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Demanda.");
  }); 
});