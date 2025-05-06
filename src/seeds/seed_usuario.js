import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";

// Conexão com banco
import DbConect from "../config/DbConnect.js";

import Usuario from "../models/usuarios.js";
import getGlobalFakeMapping from "./globalFakeMapping";
import { gerarSenhaHash } from "./seeds.js";

await DbConect.conectar();

const globalFakeMapping = await getGlobalFakeMapping();

async function seedUsuario() {
  await Usuario.deleteMany();

  const usuarios = [];

  for (let i = 0; i <= 10; i++) {
    usuarios.push({
      cpf: globalFakeMapping.cpf(),
      email: globalFakeMapping.email(),
      celular: globalFakeMapping.celular(),
      cnh: globalFakeMapping.cnh(),
      data_nomeacao: globalFakeMapping.data_nomeacao(),
      cargo: globalFakeMapping.cargo(),
      formacao: globalFakeMapping.formacao(),
      nivel_acesso: {
        municipe: globalFakeMapping.municipe(),
        operador: globalFakeMapping.operador(),
        administrador: globalFakeMapping.administrador(),
      },
      nome: globalFakeMapping.nome(),
      nome_social: globalFakeMapping.nome_social(),
      portaria_nomeacao: globalFakeMapping.portaria_nomeacao(),
      senha: gerarSenhaHash(globalFakeMapping.senha()),
      endereco: {
        logradouro: globalFakeMapping.logradouro(),
        cep: globalFakeMapping.cep(),
        bairro: globalFakeMapping.bairro(),
        numero: globalFakeMapping.numero(),
        complemento: globalFakeMapping.complemento(),
        cidade: globalFakeMapping.cidade(),
        estado: globalFakeMapping.estado(),
      },
    });
  }

  const result = await Usuario.collection.insertMany(usuarios);
  console.log(Object.keys(result.insertedIds).length + " usuários inseridos!");

  return Usuario.find();
}
