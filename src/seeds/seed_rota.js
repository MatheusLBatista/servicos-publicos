import "dotenv/config";
import Rota from "../models/Rota.js";
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

async function seedRotas() {
  await Rota.deleteMany();

  const rotasFixas = [
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
      rota: "tipoDemanda",
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
      rota: "rotas",
      dominio: "localhost",
      ativo: true,
      buscar: true,
      enviar: true,
      substituir: true,
      modificar: true,
      excluir: true,
    },
    // Adicione outras rotas do sistema aqui
  ];

  const result = await Rota.insertMany(rotasFixas);
  console.log(`${result.length} rotas fixas inseridas com sucesso!`);

  return result;
}

export default seedRotas;
