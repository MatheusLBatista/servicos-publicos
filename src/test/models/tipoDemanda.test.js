import mongoose from 'mongoose';
import TipoDemanda from '../../models/TipoDemanda.js';
import { it, expect, describe, beforeAll, afterAll, afterEach } from "@jest/globals";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 20000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  await TipoDemanda.deleteMany({});
});

describe("Modelo TipoDemanda", () => {

  it("Deve criar um tipo de demanda válido", async () => {
    const demanda = new TipoDemanda({
      titulo: "Buraco na rua",
      descricao: "Solicitação para conserto de buraco",
      link_imagem: "https://exemplo.com/imagem.png",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "Consertar buracos no asfalto",
      tipo: "infraestrutura"
    });

    const demandaSalva = await demanda.save();

    expect(demandaSalva._id).toBeDefined();
    expect(demandaSalva.titulo).toBe("Buraco na rua");
    expect(demandaSalva.link_imagem).toBe("https://exemplo.com/imagem.png");
  });

  it("Deve retornar erro ao criar demanda sem título", async () => {
    const demanda = new TipoDemanda({
      descricao: "Falta título",
      icone: ".png",
      subdescricao: "Subdesc",
      tipo: "geral"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.titulo.message).toBe("O título da demanda é obrigatório!");
  });

  it("Deve retornar erro ao criar demanda sem descrição", async () => {
    const demanda = new TipoDemanda({
      titulo: "Demanda",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "Subdesc",
      tipo: "geral"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error.errors.descricao.message).toBe("A descrição da demanda é obrigatória!");
  });

  it("Deve retornar erro se o link da imagem for inválido", async () => {
    const demanda = new TipoDemanda({
      titulo: "Demanda",
      descricao: "desc",
      link_imagem: "arquivo.txt",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error.errors.link_imagem.message).toBe("arquivo.txt não é um nome de imagem válido!");
  });

  it("Deve aceitar demanda com link_imagem vazio", async () => {
    const demanda = new TipoDemanda({
      titulo: "Imagem vazia",
      descricao: "desc",
      link_imagem: "",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    const salva = await demanda.save();

    expect(salva.link_imagem).toBe("");
  });

  it("Deve aceitar demanda sem link_imagem", async () => {
    const demanda = new TipoDemanda({
      titulo: "Sem imagem",
      descricao: "desc",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    const salva = await demanda.save();

    expect(salva.link_imagem).toBe("");
  });

  it("Deve retornar erro ao criar demanda com ícone inválido", async () => {
    const demanda = new TipoDemanda({
      titulo: "Demanda",
      descricao: "desc",
      subdescricao: "subdesc",
      icone: "imagem",
      tipo: "geral"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error.errors.icone.message).toBe("imagem não é um nome de imagem válido!");
  });

  it("Deve aceitar demanda com ícone vazio", async () => {
    const demanda = new TipoDemanda({
      titulo: "Ícone vazio",
      descricao: "desc",
      icone: "",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    const salva = await demanda.save();

    expect(salva.icone).toBe("");
  });

  it("Deve aceitar demanda sem ícone", async () => {
    const demanda = new TipoDemanda({
      titulo: "Sem ícone",
      descricao: "desc",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    const salva = await demanda.save();

    expect(salva.icone).toBe("");
  });

  it("Deve retornar erro ao criar demanda sem subdescrição", async () => {
    const demanda = new TipoDemanda({
      titulo: "Demanda",
      descricao: "desc",
      icone: "https://exemplo.com/imagem.png",
      tipo: "geral"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error.errors.subdescricao.message).toBe("A subdescrição da demanda é obrigatória!");
  });

  it("Deve retornar erro ao criar demanda sem tipo", async () => {
    const demanda = new TipoDemanda({
      titulo: "Demanda",
      descricao: "desc",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc"
    });

    let error;
    try {
      await demanda.save();
    } catch (err) {
      error = err;
    }

    expect(error.errors.tipo.message).toBe("O tipo da demanda é obrigatório!");
  });

  it("Deve listar todos os tipos de demanda", async () => {
    await TipoDemanda.create([
      {
        titulo: "Iluminação pública",
        descricao: "Solicitação para troca de lâmpadas",
        icone: "https://exemplo.com/imagem.png",
        subdescricao: "Trocar lâmpadas queimadas",
        tipo: "serviço"
      },
      {
        titulo: "Água e esgoto",
        descricao: "Problemas com encanamento",
        icone: "https://exemplo.com/imagem.png",
        subdescricao: "Vazamentos, entupimentos",
        tipo: "infraestrutura"
      }
    ]);

    const resultados = await TipoDemanda.find();

    expect(resultados).toHaveLength(2);
    expect(resultados.map(r => r.titulo)).toEqual(
      expect.arrayContaining(["Iluminação pública", "Água e esgoto"])
    );
  });

  it("Deve atualizar uma demanda existente", async () => {
    const demanda = await TipoDemanda.create({
      titulo: "Antigo título",
      descricao: "desc",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    const atualizada = await TipoDemanda.findByIdAndUpdate(
      demanda._id,
      { titulo: "Novo título" },
      { new: true }
    );

    expect(atualizada.titulo).toBe("Novo título");
  });

  it("Deve remover uma demanda existente", async () => {
    const demanda = await TipoDemanda.create({
      titulo: "Para remover",
      descricao: "desc",
      icone: "https://exemplo.com/imagem.png",
      subdescricao: "subdesc",
      tipo: "geral"
    });

    await TipoDemanda.findByIdAndDelete(demanda._id);

    const deletada = await TipoDemanda.findById(demanda._id);

    expect(deletada).toBeNull();
  });

  it("Deve retornar null ao tentar atualizar uma demanda inexistente", async () => {
    const idInexistente = new mongoose.Types.ObjectId();

    const resultado = await TipoDemanda.findByIdAndUpdate(idInexistente, { titulo: "Teste" }, { new: true });

    expect(resultado).toBeNull();
  });

  it("Deve retornar null ao tentar deletar uma demanda inexistente", async () => {
    const idInexistente = new mongoose.Types.ObjectId();

    const resultado = await TipoDemanda.findByIdAndDelete(idInexistente);

    expect(resultado).toBeNull();
  });

  it("Deve lançar erro ao tentar deletar com ID malformado", async () => {
    await expect(TipoDemanda.findByIdAndDelete("123456")).rejects.toThrow();
  });

});