import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import Demanda from "../models/Demanda.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import Usuario from "../models/Usuario.js";
import Secretaria from "../models/Secretaria.js"

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

  const secretarioFixo = await Usuario.findOne({ email: "secretariofixo@exemplo.com" });
  const operadorFixo = await Usuario.findOne({ email: "operadorfixo@exemplo.com" });
  const municipeFixo = await Usuario.findOne({ email: "municipefixo@exemplo.com" });

  const secretariaFixa = secretarioFixo.secretarias[0];

  demandas.push({
    tipo: "Iluminação",
    status: "Em aberto",
    data: new Date(),
    descricao: "Poste de luz quebrado na esquina.",
    link_imagem: globalFakeMapping.link_imagem(),
    endereco: {
      logradouro: "Rua das Flores",
      cep: "12345-678",
      bairro: "Jardim Luz",
      numero: "100",
      complemento: "Perto do ponto de ônibus"
    },
    usuarios: [municipeFixo._id],
    secretarias: [secretariaFixa]
  });

  demandas.push({
    tipo: "Pavimentação",
    status: "Em andamento",
    data: new Date(),
    descricao: "Buraco enorme na rua após a chuva.",
    link_imagem: globalFakeMapping.link_imagem(),
    endereco: {
      logradouro: "Avenida Central",
      cep: "87654-321",
      bairro: "Centro",
      numero: "250",
      complemento: "Em frente ao mercado"
    },
    usuarios: [municipeFixo._id, operadorFixo._id], 
    secretarias: [secretariaFixa]
  });

  for (let i = 0; i <= 10; i++) {
    const usuarioAleatorio = usuarios[Math.floor(Math.random() * usuarios.length )];

    const secretarias = await Secretaria.find();
    
    if (secretarias.length === 0) {
      throw new Error("Nenhum usuário encontrado. Rode o seed de usuários primeiro.");
    }

    const secretariaAleatoria = secretarias[Math.floor(Math.random() * secretarias.length)];

    demandas.push({
      tipo: globalFakeMapping.tipo(),
      status: globalFakeMapping.status(),
      data: globalFakeMapping.data(),
      resolucao: globalFakeMapping.resolucao(),
      feedback: globalFakeMapping.feedback(),
      avaliacao_resolucao: globalFakeMapping.avaliacao_resolucao(),
      motivo_devolucao: globalFakeMapping.motivo_devolucao(),
      link_imagem: globalFakeMapping.link_imagem(),
      descricao: globalFakeMapping.descricao(),
      link_imagem_resolucao: globalFakeMapping.link_imagem_resolucao(),
      endereco: {
        logradouro: globalFakeMapping.endereco.logradouro(),
        cep: globalFakeMapping.endereco.cep(),
        bairro: globalFakeMapping.endereco.bairro(),
        numero: globalFakeMapping.endereco.numero(),
        complemento: globalFakeMapping.endereco.complemento()
      },
      usuarios: [usuarioAleatorio._id],
      secretarias: [secretariaAleatoria._id]
    });
  }

  const result = await Demanda.insertMany(demandas);
  console.log(`${demandas.length} demandas inseridas com sucesso!`);

  return await Demanda.find();
}

export default seedDemanda;
