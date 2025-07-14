// tests/routes/grupoRoutes.test.js
import express from "express";
import grupoRoutes from "../../routes/grupoRoutes.js";
import authRoutes from "../../routes/authRoutes.js";
import DbConnect from "../../config/dbConnect.js";
import request from "supertest";
import errorHandler from "../../utils/helpers/errorHandler.js";

let app;
let token;

beforeAll(async () => {
  app = express();
  await DbConnect.conectar();
  app.use(express.json());
  app.use(authRoutes);
  app.use(grupoRoutes);
  app.use(errorHandler);

  const loginRes = await request(app)
    .post('/login')
    .send({ email: "admin@exemplo.com", senha: "Senha@123" });

  token = loginRes.body.data.user.accessToken;
});

describe('Rotas de grupos', () => {

  it('GET - Deve retornar a lista de grupos', async () => {
    const res = await request(app)
      .get("/grupos")
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data.docs ?? res.body.data)).toBe(true);
  });

//   it('POST - Deve criar um novo grupo', async () => {
//     const nome = `Grupo Teste ${Date.now()}`;
//     const descricao = `Descrição do grupo ${Date.now()}`;

//     const res = await request(app)
//       .post("/grupos")
//       .set('Authorization', `Bearer ${token}`)
//       .send({ nome, descricao });

//     expect(res.status).toBe(201);
//     expect(res.body).toHaveProperty("message", "Recurso criado com sucesso");
//     expect(res.body).toHaveProperty("data");
//     expect(res.body.data).toHaveProperty("_id");
//     expect(res.body.data.nome).toBe(nome);
//     expect(res.body.data.descricao).toBe(descricao);
//   });

//   it('PATCH - Deve atualizar um grupo existente', async () => {
//     const nomeInicial = `Grupo Patch ${Date.now()}`;
//     const descricao = `Descrição inicial`;

//     const novoGrupo = await request(app)
//       .post("/grupos")
//       .set('Authorization', `Bearer ${token}`)
//       .send({ nome: nomeInicial, descricao });

//     expect(novoGrupo.status).toBe(201);
//     const grupoId = novoGrupo.body.data._id;
//     expect(grupoId).toBeDefined();

//     const novoNome = `Grupo Atualizado ${Date.now()}`;

//     const res = await request(app)
//       .patch(`/grupos/${grupoId}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ nome: novoNome });

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe("Grupo atualizado com sucesso.");
//     expect(res.body.data).toHaveProperty("nome", novoNome);
//   });

//   it('DELETE - Deve deletar um grupo existente', async () => {
//     const nome = `Grupo Delete ${Date.now()}`;
//     const descricao = `Descrição a ser excluída`;

//     const novoGrupo = await request(app)
//       .post("/grupos")
//       .set('Authorization', `Bearer ${token}`)
//       .send({ nome, descricao });

//     expect(novoGrupo.status).toBe(201);
//     const grupoId = novoGrupo.body.data._id;
//     expect(grupoId).toBeDefined();

//     const res = await request(app)
//       .delete(`/grupos/${grupoId}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe("Grupo excluído com sucesso.");
//   });

});
