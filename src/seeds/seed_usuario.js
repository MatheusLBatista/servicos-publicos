// ... seus imports existentes
import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import bcrypt from "bcryptjs";

import Usuario from "../models/Usuario.js";
import Secretaria from "../models/Secretaria.js";
import Grupo from "../models/Grupo.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";

import DbConnect from "../config/dbConnect.js";
await DbConnect.conectar();

// Utilitário para senha
export function gerarSenhaHash(senhaPura) {
  return bcrypt.hashSync(senhaPura, 8);
}

const senhaPura = "Senha@123";
const senhaHash = gerarSenhaHash(senhaPura);
const globalFakeMapping = await getGlobalFakeMapping();

async function seedUsuario() {
  await Usuario.deleteMany();

  const secretarias = await Secretaria.find();
  const grupoOperador = await Grupo.findOne({ nome: "Operador" });
  const grupoSecretario = await Grupo.findOne({ nome: "Secretário" });
  const grupoAdministrador = await Grupo.findOne({ nome: "Administrador" });
  const grupoMunicipe = await Grupo.findOne({ nome: "Municipe" });

  if (secretarias.length === 0) {
    throw new Error(
      "Nenhuma secretaria encontrada. Rode o seed de secretarias primeiro."
    );
  }

  if (
    !grupoOperador ||
    !grupoSecretario ||
    !grupoAdministrador ||
    !grupoMunicipe
  ) {
    throw new Error("Grupos não encontrados. Rode o seed de grupo primeiro.");
  }

  function randomCollection(collection) {
    return [collection[Math.floor(Math.random() * collection.length)]._id];
  }

  function determinarGrupoPorNivel(nivel_acesso) {
    if (nivel_acesso.administrador) return grupoAdministrador._id;
    if (nivel_acesso.secretario) return grupoSecretario._id;
    if (nivel_acesso.operador) return grupoOperador._id;
    if (nivel_acesso.municipe) return grupoMunicipe._id;
  }

  const usuarios = [];

  // Usuários aleatórios
  for (let i = 0; i <= 10; i++) {
    const nivel_acesso = globalFakeMapping.nivel_acesso();
    const grupoId = determinarGrupoPorNivel(nivel_acesso);

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
      nivel_acesso,
      nome: globalFakeMapping.nome(),
      nome_social: "",
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
      },
      secretarias: randomCollection(secretarias),
      grupo: grupoId,
    });
  }

  // Usuário admin fixo
  const nivelAdmin = {
    administrador: true,
    secretario: false,
    operador: false,
    municipe: false,
  };
  usuarios.push({
    link_imagem: "https://example.com/admin.jpg",
    ativo: true,
    cpf: "00000000191",
    email: "admin@exemplo.com",
    celular: "(11) 99999-9999",
    cnh: "12345678900",
    data_nomeacao: new Date("2020-01-01"),
    cargo: "Administrador do Sistema",
    formacao: "Sistemas de Informação",
    nivel_acesso: nivelAdmin,
    nome: "Administrador",
    nome_social: "",
    portaria_nomeacao: "ADM-2020",
    senha: senhaHash,
    endereco: {
      logradouro: "Rua do Admin",
      cep: "01000-000",
      bairro: "Centro",
      numero: "1",
      complemento: "Prédio Central",
      cidade: "São Paulo",
      estado: "SP",
    },
    grupo: determinarGrupoPorNivel(nivelAdmin),
  });

  // Usuário secretário fixo
  const nivelSecretario = {
    administrador: false,
    secretario: true,
    operador: false,
    municipe: false,
  };
  usuarios.push({
    link_imagem: "https://example.com/secretario.jpg",
    ativo: true,
    cpf: "00000000272",
    email: "secretario@exemplo.com",
    celular: "(11) 98888-8888",
    cnh: "23456789011",
    data_nomeacao: new Date("2021-02-15"),
    cargo: "Secretário",
    formacao: "Administração Pública",
    nivel_acesso: nivelSecretario,
    nome: "Secretário",
    nome_social: "",
    portaria_nomeacao: "SEC-2021",
    senha: senhaHash,
    endereco: {
      logradouro: "Avenida do Secretário",
      cep: "02000-000",
      bairro: "Jardim",
      numero: "123",
      complemento: "Sala 101",
      cidade: "São Paulo",
      estado: "SP",
    },
    secretarias: randomCollection(secretarias),
    grupo: determinarGrupoPorNivel(nivelSecretario),
  });

  // Usuário operador fixo
  const nivelOperador = {
    administrador: false,
    secretario: false,
    operador: true,
    municipe: false,
  };
  usuarios.push({
    link_imagem: "https://example.com/operador.jpg",
    ativo: true,
    cpf: "00000000353",
    email: "operador@exemplo.com",
    celular: "(11) 97777-7777",
    cnh: "34567890122",
    data_nomeacao: new Date("2022-03-20"),
    cargo: "Operador de Sistema",
    formacao: "Tecnologia da Informação",
    nivel_acesso: nivelOperador,
    nome: "Operador",
    nome_social: "",
    portaria_nomeacao: "OP-2022",
    senha: senhaHash,
    endereco: {
      logradouro: "Rua do Operador",
      cep: "03000-000",
      bairro: "Vila Nova",
      numero: "456",
      complemento: "Andar 2",
      cidade: "São Paulo",
      estado: "SP",
    },
    secretarias: randomCollection(secretarias),
    grupo: determinarGrupoPorNivel(nivelOperador),
  });

  // Usuário munícipe fixo
  const nivelMunicipe = {
    administrador: false,
    secretario: false,
    operador: false,
    municipe: true,
  };
  usuarios.push({
    link_imagem: "https://example.com/municipe.jpg",
    ativo: true,
    cpf: "00000000434",
    email: "municipe@exemplo.com",
    celular: "(11) 96666-6666",
    cnh: "45678901233",
    data_nomeacao: new Date("2023-04-25"),
    cargo: "Munícipe",
    formacao: "Ensino Médio Completo",
    nivel_acesso: nivelMunicipe,
    nome: "Munícipe",
    nome_social: "",
    portaria_nomeacao: "",
    senha: senhaHash,
    endereco: {
      logradouro: "Praça do Munícipe",
      cep: "04000-000",
      bairro: "Centro",
      numero: "789",
      complemento: "Apartamento 10",
      cidade: "São Paulo",
      estado: "SP",
    },
    grupo: determinarGrupoPorNivel(nivelMunicipe),
  });

  //mesma secretaria
  const secretariaFixa = [secretarias[0]._id]; 

  // Secretário fixo - mesma secretaria
  usuarios.push({
    link_imagem: "https://example.com/secretario-fixo.jpg",
    ativo: true,
    cpf: "00000000900",
    email: "secretariofixo@exemplo.com",
    celular: "(11) 91111-1111",
    cnh: "11111111111",
    data_nomeacao: new Date("2021-01-01"),
    cargo: "Secretário",
    formacao: "Gestão Pública",
    nivel_acesso: {
      administrador: false,
      secretario: true,
      operador: false,
      municipe: false
    },
    nome: "Secretário Fixo",
    nome_social: "",
    portaria_nomeacao: "SEC-FIX-2021",
    senha: senhaHash,
    endereco: {
      logradouro: "Rua Secretaria Fixa",
      cep: "11111-111",
      bairro: "Centro",
      numero: "10",
      complemento: "Sala A",
      cidade: "São Paulo",
      estado: "SP"
    },
    secretarias: secretariaFixa,
    grupo: grupoSecretario._id
  });

  // Operador fixo - mesma secretaria
  usuarios.push({
    link_imagem: "https://example.com/operador-fixo.jpg",
    ativo: true,
    cpf: "00000000911",
    email: "operadorfixo@exemplo.com",
    celular: "(11) 92222-2222",
    cnh: "22222222222",
    data_nomeacao: new Date("2022-01-01"),
    cargo: "Operador",
    formacao: "Tecnologia da Informação",
    nivel_acesso: {
      administrador: false,
      secretario: false,
      operador: true,
      municipe: false
    },
    nome: "Operador Fixo",
    nome_social: "",
    portaria_nomeacao: "OP-FIX-2022",
    senha: senhaHash,
    endereco: {
      logradouro: "Rua Operador Fixo",
      cep: "22222-222",
      bairro: "Vila Nova",
      numero: "20",
      complemento: "Bloco B",
      cidade: "São Paulo",
      estado: "SP"
    },
    secretarias: secretariaFixa,
    grupo: grupoOperador._id
  });

  usuarios.push({
    link_imagem: "https://example.com/operador-fixo.jpg",
    ativo: true,
    cpf: "01162809213",
    email: "operadorfixo2@exemplo.com",
    celular: "(11) 92322-2222",
    cnh: "22222462222",
    data_nomeacao: new Date("2022-01-01"),
    cargo: "Operador",
    formacao: "Tecnologia da Informação",
    nivel_acesso: {
      administrador: false,
      secretario: false,
      operador: true,
      municipe: false
    },
    nome: "Operador Fixo 2",
    nome_social: "",
    portaria_nomeacao: "OP-FIX-2022",
    senha: senhaHash,
    endereco: {
      logradouro: "Rua Operador Fixo",
      cep: "22222-222",
      bairro: "Vila Nova",
      numero: "20",
      complemento: "Bloco B",
      cidade: "São Paulo",
      estado: "SP"
    },
    secretarias: secretariaFixa,
    grupo: grupoOperador._id
  });

  // Munícipe fixo - mesma secretaria
  usuarios.push({
    link_imagem: "https://example.com/municipe-fixo.jpg",
    ativo: true,
    cpf: "00000000922",
    email: "municipefixo@exemplo.com",
    celular: "(11) 93333-3333",
    cnh: "33333333333",
    data_nomeacao: new Date("2023-01-01"),
    cargo: "Munícipe",
    formacao: "Ensino Médio",
    nivel_acesso: {
      administrador: false,
      secretario: false,
      operador: false,
      municipe: true
    },
    nome: "Munícipe Fixo",
    nome_social: "",
    portaria_nomeacao: "",
    senha: senhaHash,
    endereco: {
      logradouro: "Praça Munícipe Fixo",
      cep: "33333-333",
      bairro: "Centro",
      numero: "30",
      complemento: "Apto 303",
      cidade: "São Paulo",
      estado: "SP"
    },
    secretarias: secretariaFixa,
    grupo: grupoMunicipe._id
  });


  const result = await Usuario.collection.insertMany(usuarios);
  console.log(
    `${Object.keys(result.insertedIds).length} usuários inseridos com sucesso!`
  );

  return Usuario.find();
}

export default seedUsuario;
