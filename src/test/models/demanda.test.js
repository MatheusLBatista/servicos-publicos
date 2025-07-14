import mongoose from 'mongoose';
import Demanda from '../../models/Demanda.js';
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

describe('Modelo demanda', () => {

    it("Deve criar uma demanda com os dados corretos - cadastro válido", async () => {
    const demanda = new Demanda({
        tipo: "Animais",
        status: "Em aberto",
        data: "2025-05-19T14:30:00.000Z",
        resolucao: "Em avaliação pela equipe técnica.",
        feedback: 4,
        avaliacao_resolucao: "Rápido e eficiente.",
        link_imagem: "https://exemplo.com/imagem1.jpg",
        motivo_devolucao: "Endereço incompleto.",
        link_imagem_resolucao: "https://exemplo.com/imagem_resolucao.jpg",
        endereco: {
            logradouro: "Rua das Flores",
            cep: "12345-678",
            bairro: "Centro",
            numero: "100",
            complemento: "Apto 202"
        },
        usuarios: ["6839c69706ec18da71924834"]
    });

    const demandaSalva = await demanda.save();

    expect(demandaSalva._id).toBeDefined();
    expect(demandaSalva.tipo).toBe("Animais");
    expect(demandaSalva.status).toBe("Em aberto");
    expect(new Date(demandaSalva.data).toISOString()).toBe("2025-05-19T14:30:00.000Z");
    expect(demandaSalva.resolucao).toBe("Em avaliação pela equipe técnica.");
    expect(demandaSalva.feedback).toBe(4);
    expect(demandaSalva.avaliacao_resolucao).toBe("Rápido e eficiente.");
    expect(demandaSalva.link_imagem).toBe("https://exemplo.com/imagem1.jpg");
    expect(demandaSalva.motivo_devolucao).toBe("Endereço incompleto.");
    expect(demandaSalva.link_imagem_resolucao).toBe("https://exemplo.com/imagem_resolucao.jpg");
    expect(demandaSalva.endereco.bairro).toBe("Centro");
    });
})