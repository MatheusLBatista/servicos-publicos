import express from "express";
import secretariaRoutes from '../../routes/secretariaRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';
import errorHandler from '../../utils/helpers/errorHandler.js';
import authRoutes from '../../routes/authRoutes.js'


describe('Rotas de secretaria', () => {

  let app; 
  let token;
  let SecretariaId;

  beforeAll(async () => {
  app = express(); 
  await DbConnect.conectar(); 
  app.use(express.json());
  app.use(authRoutes);
  app.use(secretariaRoutes);
  app.use(errorHandler)

  const loginRes = await request(app)
      .post('/login')
      .send({ email: "admin@exemplo.com", senha: "Senha@123" });
  
    token = loginRes.body.data.user.accessToken;

    const Secretariares = await request(app).get('/secretaria').set('Authorization', `Bearer ${token}`)
      SecretariaId = Secretariares.body?.data?.docs[0]?._id;
      expect(SecretariaId).toBeTruthy();
});

const generateUniqueTitle = (base = 'Secretaria da educação') => {
  return `${base} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

  it('GET - Deve retornar uma lista das secretarias cadastradas', async () => {
    const res = await request(app).get("/secretaria").set('Authorization', `Bearer ${token}`);
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  it('GET - Deve retornar uma secretaria pelo ID', async () => {
    const res = await request(app).get(`/secretaria/${SecretariaId}`).set('Authorization', `Bearer ${token}`);
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe(SecretariaId);
  });

  it('GET - Deve retornar erro de recurso não encontrado em secretaria pelo ID não existente', async () => {
    const res = await request(app).get("/secretaria/683bc26562191c4b92f76f88").set('Authorization', `Bearer ${token}`);
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

  
   it('POST - Deve cadastrar uma nova secretaria com sucesso', async () => {
    const novaSecretaria = {
      nome: generateUniqueTitle(),
      sigla: "sespsp",
      email: "meioambiente@prefeitura.com",
      telefone: "(69) 99999-9999",
      tipo: "Iluminação"
    };
    const res = await request(app).post("/secretaria").send(novaSecretaria).set('Authorization', `Bearer ${token}`);
    //console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("nome", novaSecretaria.nome);
  });

  it('POST - Deve retornar erro ao cadastrar uma nova secretaria com nome repetido', async () => {
    const secretaria = {
      nome: "secretaria teste 5",
      sigla: "sespsp",
      email: "meioambiente@prefeitura.com",
      telefone: "(69) 99999-9999",
      tipo:"Iluminação"
    };
    const novaSecretaria = {
      nome: "secretaria teste 5",
      sigla: "sespsp",
      email: "meioambiente@prefeitura.com",
      telefone: "(69) 99999-9999",
      tipo:"Iluminação"
    };
    const res = await request(app).post("/secretaria").send(secretaria).set('Authorization', `Bearer ${token}`);
    const res2 = await request(app).post("/secretaria").send(novaSecretaria).set('Authorization', `Bearer ${token}`);
    //console.log(res.body);
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty("message", "Nome já cadastrado.");
  });

  it('PATCH - Deve atualizar parcialmente uma secretaria', async () => {
    const atualizacao = {
      sigla: "sigla atualizada",
    };
    const res = await request(app).patch(`/secretaria/${SecretariaId}`).send(atualizacao).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("sigla", atualizacao.sigla);
  });

  it('PATCH - Deve retornar erro ao tentar atualizar uma secretaria inexistente', async () => {
    const res = await request(app).patch(`/secretaria/666666666666666666666666`).send({
      sigla: "Teste inválido"
    }).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

  it('DELETE - Deve deletar uma secretaria com sucesso', async () => {
  const novaSecretaria = {
    nome: generateUniqueTitle(),
    sigla: "sespsp",
    email: "meioambiente@prefeitura.com",
    telefone: "(69) 99999-9999",
    tipo: "Iluminação"
  };

  const createRes = await request(app)
    .post("/secretaria")
    .send(novaSecretaria)
    .set('Authorization', `Bearer ${token}`);

  expect(createRes.status).toBe(201);
  expect(createRes.body).toHaveProperty("data._id");
  const idCriado = createRes.body.data._id;
  const deleteRes = await request(app)
    .delete(`/secretaria/${idCriado}`)
    .set('Authorization', `Bearer ${token}`);

  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body.message).toBe("Secretaria excluída com sucesso.");
  expect(deleteRes.body.data._id).toBe(idCriado);
});

   it('DELETE - Deve retornar erro ao tentar deletar uma secretaria com id inválido', async () => {
    const res = await request(app).delete("/secretaria/6848e1afb766c95e555171aa").set('Authorization', `Bearer ${token}`); 
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

});