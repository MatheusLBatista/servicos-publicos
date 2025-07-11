import "dotenv/config";
import Secretaria from '../models/Secretaria.js';
import DbConnect from "../config/dbConnect.js";

// Conecta ao banco
await DbConnect.conectar();

async function seedSecretaria() {
  await Secretaria.deleteMany();

  const secretariasFixas = [
    {
      nome: "Secretaria Municipal de Limpeza Urbana",
      sigla: "SEMLIMP",
      email: "coleta@prefeitura.gov.br",
      telefone: "(69) 3222-1001",
      tipo: "Coleta"
    },
    {
      nome: "Secretaria Municipal de Iluminação Pública",
      sigla: "SEMILU",
      email: "iluminacao@prefeitura.gov.br",
      telefone: "(69) 3222-1002",
      tipo: "Iluminação"
    },
    {
      nome: "Secretaria Municipal de Saneamento Básico",
      sigla: "SEMSAN",
      email: "saneamento@prefeitura.gov.br",
      telefone: "(69) 3222-1003",
      tipo: "Saneamento"
    },
    {
      nome: "Secretaria Municipal de Meio Ambiente",
      sigla: "SEMMA",
      email: "arvores@prefeitura.gov.br",
      telefone: "(69) 3222-1004",
      tipo: "Árvores"
    },
    {
      nome: "Centro de Controle de Zoonoses",
      sigla: "CCZ",
      email: "animais@prefeitura.gov.br",
      telefone: "(69) 3222-1005",
      tipo: "Animais"
    },
    {
      nome: "Secretaria Municipal de Obras e Pavimentação",
      sigla: "SEMOP",
      email: "pavimentacao@prefeitura.gov.br",
      telefone: "(69) 3222-1006",
      tipo: "Pavimentação"
    }
  ];

  const result = await Secretaria.insertMany(secretariasFixas);
  console.log(`${result.length} secretarias fixas inseridas com sucesso!`);

  return result;
}

export default seedSecretaria;
