import express from "express";
import secretariaRoutes from '../../routes/secretariaRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';
import errorHandler from '../../utils/helpers/errorHandler.js';

let app; 

beforeAll(async () => {
  app = express(); 
  await DbConnect.conectar(); 
  app.use(express.json());
  app.use(secretariaRoutes);
  app.use(errorHandler)
});

describe('Rotas de secretaria', () => {
  it('GET - Deve retornar uma lista das secretarias cadastradas', async () => {
    const res = await request(app).get("/secretaria");
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });
  /*
  it('GET - Deve retornar erro ao não encontrar rota', async () => {
    const res = await request(app).get("/secretari");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em null.");
    expect(res.body.errors[1].message).toBe("Rota não encontrada.");
  });*/

  it('GET - Deve retornar uma secretaria pelo ID', async () => {
    const res = await request(app).get("/secretaria/6848e1d65608a74a1f050104");
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe("6848e1d65608a74a1f050104");
  });

  it('GET - Deve retornar erro de recurso não encontrado em secretaria pelo ID não existente', async () => {
    const res = await request(app).get("/secretaria/683bc26562191c4b92f76f88");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

  /*
   it('POST - Deve cadastrar uma nova secretaria com sucesso', async () => {
    const novaSecretaria = {
      nome: "secretaria teste 9",
      sigla: "sespsp",
      email: "meioambiente@prefeitura.com",
      telefone: "(69) 99999-9999",
    };
    const res = await request(app).post("/secretaria").send(novaSecretaria);
    //console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("nome", novaSecretaria.nome);
  });
*/
  it('POST - Deve retornar erro ao cadastrar uma nova secretaria com nome repetido', async () => {
    const novaSecretaria = {
      nome: "secretaria teste 5",
      sigla: "sespsp",
      email: "meioambiente@prefeitura.com",
      telefone: "(69) 99999-9999",
    };
    const res = await request(app).post("/secretaria").send(novaSecretaria);
    //console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Nome já cadastrado.");
  });

  it('PATCH - Deve atualizar parcialmente uma secretaria', async () => {
    const atualizacao = {
      sigla: "sigla atualizada",
    };
    const res = await request(app).patch(`/secretaria/6848e18d04ef11946571b3d9`).send(atualizacao);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("sigla", atualizacao.sigla);
  });

  it('PATCH - Deve retornar erro ao tentar atualizar uma secretaria inexistente', async () => {
    const res = await request(app).patch(`/secretaria/666666666666666666666666`).send({
      sigla: "Teste inválido"
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

  /*
  it('DELETE - Deve deletar uma secretaria com sucesso', async () => {
    const res = await request(app).delete("/secretaria/6848e1afb766c95e555171aa");
    //console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Secretaria excluída com sucesso.");
    expect(res.body.data._id).toBe("6848e1afb766c95e555171aa");
  });
*/
   it('DELETE - Deve retornar erro ao tentar deletar uma secretaria com id inválido', async () => {
    const res = await request(app).delete("/secretaria/6848e1afb766c95e555171aa");
    //console.log(res.body);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Secretaria.");
  });

});