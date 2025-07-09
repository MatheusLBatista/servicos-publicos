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
      ativo: true,  // Não esqueça de ativar o grupo
      permissoes: [
        {
          rota: "demandas", // sem barra para facilitar comparação no middleware
          dominio: "localhost", // só host:porta (ou só host)
          ativo: true, 
          buscar: true,  // Ajuste permissões conforme precisa
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: false
        }
      ]
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
          substituir: false,
          modificar: true,
          excluir: false
        }
      ]
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
          excluir: true
        }
      ]
    }
  ];

  const result = await Grupo.insertMany(gruposFixos);
  console.log(`${result.length} grupos fixos inseridos com sucesso!`);

  return result;
}

export default seedGrupo;
