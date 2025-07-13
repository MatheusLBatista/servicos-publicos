import express from "express";
import tipoDemandaRoutes from '../../routes/tipoDemandaRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';
import errorHandler from '../../utils/helpers/errorHandler.js';
import authRoutes from '../../routes/authRoutes.js'

let app;

describe('Rotas de tipoDemanda', () => {

  let token;
  let tipoDemandaId;

  const generateUniqueTitle = (base = 'Iluminação') => {
    return `${base} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  beforeAll(async () => {
  app = express();
  await DbConnect.conectar();
  app.use(express.json());
  app.use(authRoutes);
  app.use(tipoDemandaRoutes);
  app.use(errorHandler);

  const loginRes = await request(app)
    .post('/login')
    .send({ email: "admin@exemplo.com", senha: "Senha@123" });

  token = loginRes.body.data.user.accessToken;

  const tipoDemandares = await request(app).get('/tipoDemanda').set('Authorization', `Bearer ${token}`)
    tipoDemandaId = tipoDemandares.body?.data?.docs[0]?._id;
    expect(tipoDemandaId).toBeTruthy();

});

  it('GET - Deve retornar uma lista dos tiposDemandas cadastradas', async () => {
    const res = await request(app).get("/tipoDemanda").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  it('GET - Deve retornar um tipoDemanda pelo ID', async () => {
    const res = await request(app).get(`/tipoDemanda/${tipoDemandaId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe(tipoDemandaId);
  });

  it('GET - Deve retornar erro de recurso não encontrado em tipoDemanda pelo ID não existente', async () => {
    const res = await request(app).get("/tipoDemanda/6832ad0c109564baed4cda11").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em TipoDemanda.");
  });

  it('POST - Deve cadastrar um novo tipoDemanda com sucesso', async () => {
    const novoTipoDemanda = {
      titulo: generateUniqueTitle(),
      descricao: "exemplo",
      subdescricao: "exemplo",
      icone: "http://marson.org/fd432daf-ad5e-46fc-86ff-45e2ab126497.jpg",
      link_imagem: "http://marson.org/fd432daf-ad5e-46fc-86ff-45e2ab126497.jpg",
      tipo: "Iluminação",
    };
    const res = await request(app).post("/tipoDemanda").send(novoTipoDemanda).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("titulo", novoTipoDemanda.titulo);
  });

  it('POST - Deve retornar erro ao cadastrar um novo tipoDemanda com titulo vazio.', async () => {
    const novoTipoDemanda = {
      titulo: "",
      descricao: "exemplo",
      subdescricao: "exemplo",
      icone: "http://marson.org/fd432daf-ad5e-46fc-86ff-45e2ab126497.jpg",
      link_imagem: "http://marson.org/fd432daf-ad5e-46fc-86ff-45e2ab126497.jpg",
      tipo: "Iluminação",
    };
    const res = await request(app).post("/tipoDemanda").send(novoTipoDemanda).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Erro de validação. 1 campo(s) inválido(s).");
  });

  it('PATCH - Deve atualizar parcialmente um tipoDemanda', async () => {
    const atualizacao = {
      titulo: generateUniqueTitle(),
    };
    const res = await request(app).patch(`/tipoDemanda/${tipoDemandaId}`).send(atualizacao).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("titulo", atualizacao.titulo);
  });

  it('PATCH - Deve retornar erro ao tentar atualizar um tipoDemanda inexistente', async () => {
    const res = await request(app).patch(`/tipoDemanda/666666666666666666666666`).send({
      titulo: "Teste inválido"
    }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em TipoDemanda.");
  });

  it('DELETE - Deve deletar um tipoDemanda com sucesso', async () => {
  const novoTipoDemanda = {
    titulo: generateUniqueTitle(),
    descricao: "exemplo para delete",
    subdescricao: "exemplo para delete",
    icone: "http://exemplo.com/icone.jpg",
    link_imagem: "http://exemplo.com/imagem.jpg",
    tipo: "Iluminação",
  };

  const createRes = await request(app)
    .post("/tipoDemanda")
    .send(novoTipoDemanda)
    .set('Authorization', `Bearer ${token}`);

  expect(createRes.status).toBe(201);
  const idCriado = createRes.body.data._id;

  const deleteRes = await request(app)
    .delete(`/tipoDemanda/${idCriado}`)
    .set('Authorization', `Bearer ${token}`);

  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body.message).toBe("TipoDemanda excluída com sucesso.");
  expect(deleteRes.body.data._id).toBe(idCriado);
});

  it('DELETE - Deve retornar erro ao tentar deletar uma secretaria com id inválido', async () => {
    const res = await request(app).delete("/tipoDemanda/68353b31ed620b3827f3f06c").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em TipoDemanda.");
  });
});