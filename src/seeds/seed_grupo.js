// seeds/seedGrupo.js
import "dotenv/config";
import Grupo from "../models/Grupo.js";
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

async function seedGrupo() {
  await Grupo.deleteMany();

  const gruposFixos = [
    {
      nome: "Secretário",
      descricao: "Grupo com acesso de secretário",
      ativo: true,
      permissoes: [
        {
          rota: "demandas",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: true,
          modificar: true,
          excluir: false,
        },
        {
          rota: "grupos",
          dominio: "localhost",
          ativo: false,
          buscar: false,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "usuarios",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: true,
          modificar: true,
          excluir: false,
        },
        {
          rota: "secretaria",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "tipoDemanda",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
      ],
    },
    {
      nome: "Operador",
      descricao: "Grupo com acesso de operador",
      ativo: true,
      permissoes: [
        {
          rota: "demandas",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: false,
        },
        {
          rota: "grupos",
          dominio: "localhost",
          ativo: false,
          buscar: false,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "usuarios",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: true,
          modificar: true,
          excluir: false,
        },
        {
          rota: "secretaria",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "tipoDemanda",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
      ],
    },
    {
      nome: "Administrador",
      descricao: "Grupo com acesso de administrador",
      ativo: true,
      permissoes: [
        {
          rota: "demandas",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "grupos",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "usuarios",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "secretaria",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "tipoDemanda",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
      ],
    },
    {
      nome: "Municipe",
      descricao: "Grupo com acesso de munícipe",
      ativo: true,
      permissoes: [
        {
          rota: "demandas",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "grupos",
          dominio: "localhost",
          ativo: false,
          buscar: false,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "usuarios",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true,
        },
        {
          rota: "secretaria",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
        {
          rota: "tipoDemanda",
          dominio: "localhost",
          ativo: true,
          buscar: true,
          enviar: false,
          substituir: false,
          modificar: false,
          excluir: false,
        },
      ],
    },
  ];

  const result = await Grupo.insertMany(gruposFixos);
  console.log(`${result.length} grupos fixos inseridos com sucesso!`);

  return result;
}

export default seedGrupo;
