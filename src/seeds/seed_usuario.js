import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import Usuario from "../models/Usuario.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import bcrypt from "bcryptjs";

// Conexão com banco
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

export function gerarSenhaHash(senhaPura) {
  return bcrypt.hashSync(senhaPura, 8);
}

const senhaPura = "AaBb@123456";
const senhaHash = gerarSenhaHash(senhaPura);

const globalFakeMapping = await getGlobalFakeMapping();

async function seedUsuario() {
  await Usuario.deleteMany();

  const usuarios = [];

  for (let i = 0; i <= 10; i++) {
    usuarios.push({
      link_imagem: globalFakeMapping.link_imagem(),
      ativo: globalFakeMapping.ativo(),
      cpf: globalFakeMapping.cpf(),
      email: globalFakeMapping.email(),
      celular: globalFakeMapping.celular(),
      cnh: globalFakeMapping.cnh(),
      data_nomeacao: globalFakeMapping.data_nomeacao(),
      cargo: globalFakeMapping.cargo(),
      formacao: globalFakeMapping.formacao(),
      nivel_acesso: globalFakeMapping.nivel_acesso(),
      nome: globalFakeMapping.nome(),
      nome_social: globalFakeMapping.nome_social(),
      portaria_nomeacao: globalFakeMapping.portaria_nomeacao(),
      senha: senhaHash,
       endereco: {
          logradouro: globalFakeMapping.endereco.logradouro(),
          cep: globalFakeMapping.endereco.cep(),
          bairro: globalFakeMapping.endereco.bairro(),
          numero: globalFakeMapping.endereco.numero(),
          complemento: globalFakeMapping.endereco.complemento(),
          cidade: globalFakeMapping.endereco.cidade(),
          estado: globalFakeMapping.endereco.estado(),
  }
    });
  }

  const result = await Usuario.collection.insertMany(usuarios);
  console.log(Object.keys(result.insertedIds).length + " usuários inseridos!");

  return Usuario.find();
}

export default seedUsuario;
