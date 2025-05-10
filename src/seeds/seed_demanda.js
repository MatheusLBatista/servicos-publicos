import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import Demanda from "../models/demandas.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import Usuario from "../models/usuarios.js";

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

  const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length )]

  for (let i = 0; i <= 10; i++) {
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
        logradouro: globalFakeMapping.logradouro(),
        cep: globalFakeMapping.cep(),
        bairro: globalFakeMapping.bairro(),
        numero: globalFakeMapping.numero(),
        complemento: globalFakeMapping.complemento()
      },
      usuario: [usuarioAleatorio._id]
    });
  }

  const result = await Demanda.insertMany(demandas);
  console.log(`${demandas.length} demandas inseridas com sucesso!`);

  return await Demanda.find();
}

export default seedDemanda;
