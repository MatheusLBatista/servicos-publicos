// import mongoose from 'mongoose';
// import Usuario from '../../models/Usuario.js'
// import { it, expect, describe, beforeAll, afterAll } from "@jest/globals";
// import { MongoMemoryServer } from 'mongodb-memory-server';


// let mongoServer;
// // Configuração do banco de dados em memória
// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri);
//   }, 20000
// );
// // Limpeza do banco de dados após os testes
// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
//     }
// );

// // Testes para o modelo Secretaria
// describe("Modelo Usuário", () => {

//     it("Deve criar um usuário com os dados corretos - cadastro válido", async () => {
//     const usuario = new Usuario({
//         cpf: "12345678900",
//         email: "usuario@email.com",
//         celular: "6999999999",
//         nome: "João da Silva",
//         senha: "senha123",
//         nivel_acesso: {
//             municipe: true,
//             operador: false,
//             administrador: false
//         },
//         endereco: {
//             logradouro: "Rua das Flores",
//             cep: "76980000",
//             bairro: "Centro",
//             numero: "123",
//             complemento: "Apto 202",
//             cidade: "Vilhena",
//             estado: "RO"
//         }
//     });

//     const usuarioSalvo = await usuario.save();

//     expect(usuarioSalvo._id).toBeDefined();
//     expect(usuarioSalvo.nome).toBe("João da Silva");
//     expect(usuarioSalvo.endereco.estado).toBe("RO");
//     });
// });

// src/tests/unit/models/Usuario.test.js
import mongoose from 'mongoose';
import Usuario from '../../models/Usuario.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

// src/tests/unit/models/Usuario.test.js

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await mongoose.connection.db.dropDatabase();
  await mongoose.model('usuarios').syncIndexes(); // força criação dos índices
});

// Limpeza após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Usuario.deleteMany({});
});

describe('Modelo de Usuário', () => {
  it("Deve criar um usuário com os dados corretos - cadastro válido", async () => {
    const usuario = new Usuario({
      cpf: "12345678900",
      email: "usuario@email.com",
      celular: "6999999999",
      nome: "João da Silva",
      senha: "senha123",
      nivel_acesso: {
        municipe: true,
        operador: false,
        administrador: false
      },
      endereco: {
        logradouro: "Rua das Flores",
        cep: "76980000",
        bairro: "Centro",
        numero: "123",
        complemento: "Apto 202",
        cidade: "Vilhena",
        estado: "RO"
      }
    });

    const salvo = await usuario.save();
    expect(salvo._id).toBeDefined();
    expect(salvo.nome).toBe("João da Silva");
  });

  it('Não deve criar um usuário com email duplicado', async () => {
    const userData = {
      nome: 'Test User',
      email: 'duplicate@example.com',
      senha: 'password123',
      cpf: '12345678901',
      celular: '69988887777',
      endereco: {
        logradouro: "Rua X",
        cep: "76900000",
        bairro: "Centro",
        numero: "10",
        cidade: "Cidade Y",
        estado: "RO"
      }
    };

    const user1 = new Usuario(userData);
    await user1.save();

    const user2 = new Usuario({ ...userData, cpf: '12345678902' }); 
    await expect(user2.save()).rejects.toThrow();
  });

  it('Não deve criar um usuário com CPF duplicado', async () => {
    const userData = {
      cpf: '12345678900',
      email: 'usuario@email.com',
      celular: '69988887777',
      cnh: '9988776655',
      data_nomeacao: new Date('2020-01-01'),
      cargo: 'Analista de Sistemas',
      formacao: 'Análise e Desenvolvimento de Sistemas',
      nivel_acesso: {
        municipe: true,
        operador: true,
        administrador: false
      },
      nome: 'João da Silva',
      ativo: true,
      nome_social: 'Joana Silva',
      portaria_nomeacao: 'PORTARIA 123/2020',
      senha: 'senhaSegura123',
      endereco: {
        logradouro: 'Rua das Flores',
        cep: '76980000',
        bairro: 'Centro',
        numero: '123',
        complemento: 'Apto 202',
        cidade: 'Vilhena',
        estado: 'RO'
      }
    };

    const user1 = new Usuario(userData);
    await user1.save();

    const user2 = new Usuario({ ...userData, email: 'joaosilva@gmail.com' }); 
    await expect(user2.save()).rejects.toThrow();
  });

  it('Não deve criar um usuário com CNH duplicada', async () => {
    const userData = {
      nome: 'Test User',
      email: 'joao@example.com',
      senha: 'password123',
      cpf: '12345678901',
      celular: '69988887777',
      cnh: '12345678900',
      endereco: {
        logradouro: "Rua X",
        cep: "76900000",
        bairro: "Centro",
        numero: "10",
        cidade: "Cidade Y",
        estado: "RO"
      }
    };

    const user1 = new Usuario(userData);
    await user1.save();

    const user2 = new Usuario({ ...userData, cpf: '12345678902', email: 'maria@example.com' }); 
    await expect(user2.save()).rejects.toThrow();
  });
});