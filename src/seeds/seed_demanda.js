import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import Demanda from "../models/Demanda.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import Usuario from "../models/Usuario.js";

// Conexão com banco
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

const globalFakeMapping = await getGlobalFakeMapping();

async function seedDemanda() {
  await Demanda.deleteMany();

  const usuarios = await Usuario.find();

  if (usuarios.length === 0) {
    throw new Error("Nenhum usuário encontrado. Rode o seed de usuários primeiro.");
  }

  const demandas = [];

  for (let i = 0; i <= 10; i++) {
    const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length )];

    demandas.push({
      tipo: globalFakeMapping.tipo(),
      status: globalFakeMapping.status(),
      data: globalFakeMapping.data(),
      resolucao: globalFakeMapping.resolucao(),
      feedback: globalFakeMapping.feedback(),
      avaliacao_resolucao: globalFakeMapping.avaliacao_resolucao(),
      motivo_devolucao: globalFakeMapping.motivo_devolucao(),
      link_imagem: globalFakeMapping.link_imagem(),
      link_imagem_resolucao: globalFakeMapping.link_imagem_resolucao(),
      endereco: {
        logradouro: globalFakeMapping.endereco.logradouro(),
        cep: globalFakeMapping.endereco.cep(),
        bairro: globalFakeMapping.endereco.bairro(),
        numero: globalFakeMapping.endereco.numero(),
        complemento: globalFakeMapping.endereco.complemento()
      },
      usuarios: [usuarioAleatorio._id]
    });
  }

  const result = await Demanda.insertMany(demandas);
  console.log(`${demandas.length} demandas inseridas com sucesso!`);

  return await Demanda.find();
}

export default seedDemanda;
