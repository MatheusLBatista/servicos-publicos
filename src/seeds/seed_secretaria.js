import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import Secretararia from '../models/Secretaria.js'
import getGlobalFakeMapping from "./globalFakeMapping.js";

// Conexão com banco
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

const globalFakeMapping = await getGlobalFakeMapping();

async function seedSecretaria() {
  await Secretararia.deleteMany();

  const secretararia = [];

  for (let i = 0; i <= 10; i++) {
    secretararia.push({
      nome: globalFakeMapping.nome_secretaria(),
    });
  }
  const result = await Secretararia.collection.insertMany(secretararia);
  console.log(`${secretararia.length} secretarias inseridas com sucesso!`);

  return await Secretararia.find();
}

export default seedSecretaria;
