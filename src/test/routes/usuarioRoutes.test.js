import express from "express";
import usuarioRoutes from '../../routes/usuarioRoutes.js';
import DbConnect from '../../config/dbConnect.js';
import request from 'supertest';
import errorHandler from '../../utils/helpers/errorHandler.js';
import authRoutes from '../../routes/authRoutes.js';

describe('Rotas de usuário', () => {
  let app; 
  let token;
  let UsuarioId;

  beforeAll(async () => {
    app = express(); 
    await DbConnect.conectar(); 
    app.use(express.json());
    app.use(authRoutes);
    app.use(usuarioRoutes);
    app.use(errorHandler);

    const loginRes = await request(app)
      .post('/login')
      .send({ email: "admin@exemplo.com", senha: "Senha@123" });

    token = loginRes.body.data.user.accessToken;

    const usuarioRes = await request(app)
      .get('/usuarios')
      .set('Authorization', `Bearer ${token}`);
    
    UsuarioId = usuarioRes.body?.data?.docs[0]?._id;
    expect(UsuarioId).toBeTruthy();
  });

  const generateRandomEmail = (base = 'usuario') => {
    return `${base}${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
  };

  const generateRandomCPF = () => {
    let cpf = "";
    for (let i = 0; i < 11; i++) {
        cpf += Math.floor(Math.random() * 10).toString();
    }
    return cpf;
  };

  const generateRandomCNH = () => {
    let cnh = "";
    for (let i = 0; i < 11; i++) {
        cnh += Math.floor(Math.random() * 10).toString();
    }
    return cnh;
  };


  it('GET - Deve retornar uma lista de usuários cadastrados', async () => {
    const res = await request(app).get("/usuarios").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
  });

  it('GET - Deve retornar um usuário pelo ID', async () => {
    const res = await request(app).get(`/usuarios/${UsuarioId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Requisição bem-sucedida");
    expect(res.body.data._id).toBe(UsuarioId);
  });

  it('GET - Deve retornar erro ao buscar usuário por ID inexistente', async () => {
    const res = await request(app).get("/usuarios/683bc26562191c4b92f76f88").set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Usuário.");
  });

  it('POST - Deve cadastrar um novo usuário com sucesso', async () => {
    const novoUsuario = {
      nome: "Usuário Teste " + Date.now(),
      email: generateRandomEmail(),
      cpf: generateRandomCPF(),
      senha: "Senha@123",
      celular: "11999999999",
      cnh: generateRandomCNH(),
      endereco: {
        logradouro: "Rua Teste",
        cep: "12345-678",
        bairro: "Centro",
        numero: 123,
        cidade: "São Paulo",
        estado: "SP"
      },
      nivel_acesso: { municipe: true },
      link_imagem: "http://exemplo.com/imagem.png",
    };

    const res = await request(app)
      .post("/usuarios")
      .send(novoUsuario)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("nome", novoUsuario.nome);
  });

  it('PATCH - Deve atualizar parcialmente um usuário', async () => {
    const atualizacao = {
      celular: "11988887777"
    };

    const res = await request(app)
      .patch(`/usuarios/${UsuarioId}`)
      .send(atualizacao)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("celular", atualizacao.celular);
  });

  it('PATCH - Deve retornar erro ao atualizar usuário inexistente', async () => {
    const res = await request(app)
      .patch(`/usuarios/666666666666666666666666`)
      .send({ celular: "11900000000" })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Usuário.");
  });

  it('DELETE - Deve deletar um usuário com sucesso', async () => {
    const novoUsuario = {
      nome: "Usuário Para Deletar " + Date.now(),
      email: generateRandomEmail(),
      cpf: generateRandomCPF(),
      senha: "Senha@123",
      celular: "11999999999",
      cnh: generateRandomCNH(),
      endereco: {
        logradouro: "Rua Teste",
        cep: "12345-678",
        bairro: "Centro",
        numero: 123,
        cidade: "São Paulo",
        estado: "SP"
      },
      nivel_acesso: { municipe: true }
    };

    const createRes = await request(app)
      .post("/usuarios")
      .send(novoUsuario)
      .set('Authorization', `Bearer ${token}`);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty("data._id");

    const idCriado = createRes.body.data._id;

    console.log(createRes.body)

    const deleteRes = await request(app)
      .delete(`/usuarios/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe("Usuário excluído com sucesso.");
    expect(deleteRes.body.data._id).toBe(idCriado);
  });

  it('DELETE - Deve retornar erro ao deletar usuário com id inválido', async () => {
    const res = await request(app)
      .delete("/usuarios/6848e1afb766c95e555171aa")
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Recurso não encontrado em Usuário.");
  });

});
