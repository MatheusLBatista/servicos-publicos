import mongoose from 'mongoose';
import Secretaria from "../../src/models/Secretaria.js";
import { it, expect, describe, beforeAll, afterAll } from "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';


let mongoServer;
// Configuração do banco de dados em memória
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 20000
);
// Limpeza do banco de dados após os testes
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
    }
);

// Testes para o modelo Secretaria
describe("Modelo Secretaria", () => {

  it("Deve criar uma secretaria com os dados corretos- cadastro válido ", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      sigla: "SEMED",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });

    const secretariaSalva = await secretaria.save();

    expect(secretariaSalva._id).toBeDefined();
    expect(secretariaSalva.nome).toBe("Secretaria do Ministerio da Educação");
    expect(secretariaSalva.sigla).toBe("SEMED");
    expect(secretariaSalva.email).toBe("semed@gmail.com");
    expect(secretariaSalva.telefone).toBe("6999999999");
  });

});