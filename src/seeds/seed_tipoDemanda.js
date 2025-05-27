import "dotenv/config";
import { randomBytes as _randomBytes } from "crypto";
import TipoDemanda from '../models/TipoDemanda.js'
import getGlobalFakeMapping from "./globalFakeMapping.js";

// Conexão com banco
import DbConnect from "../config/dbConnect.js";

await DbConnect.conectar();

const globalFakeMapping = await getGlobalFakeMapping();

async function seedTipoDemanda() {
  await TipoDemanda.deleteMany();

  const tipoDemanda = [];

  for (let i = 0; i <= 10; i++) {
    tipoDemanda.push({
      titulo: globalFakeMapping.titulo(),
      icone: globalFakeMapping.icone(),
      descricao: globalFakeMapping.descricao(),
      subdescricao: globalFakeMapping.subdescricao(),
      link_imagem: globalFakeMapping.link_imagem(),
      tipo: globalFakeMapping.tipo()
    });
  }

  const result = await TipoDemanda.collection.insertMany(tipoDemanda);
  console.log(`${tipoDemanda.length} Tipos das Demandas inseridas com sucesso!`);

  return await TipoDemanda.find();
}

export default seedTipoDemanda;
