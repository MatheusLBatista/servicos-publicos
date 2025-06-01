import mongoose from 'mongoose';
import Secretaria from "../../models/Secretaria.js";
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

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Secretaria.deleteMany({});
});


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

  it("Deve retornar erro ao criar Secretaria sem nome - cadastro secretaria ", async () => {
    const secretaria = new Secretaria({
      sigla: "SEMED",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });
    let error;
    try {
      await secretaria.save();
    } catch (err) {
      error = err;
    }
   
    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.nome).toBeDefined();
    expect(error.errors.nome.message).toBe("O nome da secretaria é obrigatório!");
  });

  it("Deve retornar erro ao criar secretaria sem sigla - cadastro secretaria", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });
    let error;
    try {
      await secretaria.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.sigla).toBeDefined();
    expect(error.errors.sigla.message).toBe("A sigla da secretaria é obrigatório!");
  });

  it("Deve retornar erro ao criar secretaria sem email - cadastro secretaria", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      sigla: "SEMED",
      telefone: "6999999999"
    });
    let error;
    try {
      await secretaria.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toBe("O email da secretaria é obrigatório!");
  });

  it("Deve retornar erro ao criar secretaria sem telefone - cadastro secretaria", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      email: "semed@gmail.com",
      sigla: "SEMED"
    });
    let error;
    try {
      await secretaria.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.telefone).toBeDefined();
    expect(error.errors.telefone.message).toBe("O telefone da secretaria é obrigatório!");
  });

  it("Deve listar todos as secretarias cadastrados - Leitura de secretarias", async () => {
    const secretaria1 = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      sigla: "SEMED",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });

    const secretaria2 = new Secretaria({
      nome: "Serviço Autônomo de Água e Esgoto",
      sigla: "SAAE",
      email: "saae@gmail.com",
      telefone: "6999999999"
    });

    await secretaria1.save();
    await secretaria2.save();

    const secretarias = await Secretaria.find();
  
    expect(secretarias).toBeInstanceOf(Array);
    expect(secretarias.length).toBeGreaterThanOrEqual(2);
    expect(secretarias.map(l => l.nome)).toEqual(
      expect.arrayContaining(["Secretaria do Ministerio da Educação", "Serviço Autônomo de Água e Esgoto"])
    );
  });

  it("Deve atualizar uma secretaria existente - Atualização de secretaria", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      sigla: "SEMED",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });

    const secretariaSalva = await secretaria.save();

    const secretariaAtualizada = await Secretaria.findByIdAndUpdate(
      secretariaSalva._id,
      { nome: "Serviço Autônomo de Água e Esgoto" },
      { new: true }
    );

    expect(secretariaAtualizada.nome).toBe("Serviço Autônomo de Água e Esgoto");
    expect(secretariaAtualizada.updatedAt).not.toEqual(secretariaSalva.updatedAt);
  });

  it("Deve remover uma secretaria existente - Remoção de secretaria", async () => {
    const secretaria = new Secretaria({
      nome: "Secretaria do Ministerio da Educação",
      sigla: "SEMED",
      email: "semed@gmail.com",
      telefone: "6999999999"
    });

    const secretariaSalva = await secretaria.save();

    await Secretaria.findByIdAndDelete(secretariaSalva._id);

    const SecretariaDeletada = await Secretaria.findById(secretariaSalva._id);

    expect(SecretariaDeletada).toBeNull();
  });
  
  it("Deve retornar null ao tentar atualizar uma secretaria inexistente - Atualização de secretaria", async () => {
    const idInexistente = "60d5f484f1c2b8a0b8c8e4e1"; 
  
    const resultado = await Secretaria.findByIdAndUpdate(
      idInexistente,
      { nome: "Secretaria do Ministerio da Educação" },
      { new: true } 
    );
  
    expect(resultado).toBeNull(); 
  });
  
  
  it("Deve retornar erro ao tentar remover uma secretaria inexistente - Remoção de secretaria", async () => {
    const idInexistente = "60d5f484f1c2b8a0b8c8e4e1"; 

    const resultado = await Secretaria.findByIdAndDelete(idInexistente);
  
    expect(resultado).toBeNull();


  });

  it("Deve lançar erro ao tentar remover uma secretaria com ID malformado - Remoção de secretaria", async () => {
    await expect(Secretaria.findByIdAndDelete("60d5f484f1")).rejects.toThrow();
  });

});