import { faker } from "@faker-js/faker/locale/pt_BR";
import fakebr from "faker-br";
import mongoose, { model } from "mongoose";
import { v4 as uuid } from "uuid";
import loadModels from "./loadModels.js";
import { estadosBrasil } from "../models/Usuario.js";

const fakeMappings = {
  common: {
    nome: () => fakebr.name.firstName() + " " + fakebr.name.lastName(),
    descricao: () => fakebr.lorem.sentence(),
    link_imagem: () => fakebr.internet.url() + "/" + uuid() + ".jpg",
    tipo: () => {
      const values = [
        "Coleta",
        "Iluminação",
        "Animais",
        "Pavimentação",
        "Árvores",
        "Saneamento",
      ];
      return values[Math.floor(Math.random() * values.length)];
    },
    secretarias: () => [{ _id: new mongoose.Types.ObjectId().toString() }],
    descricao: () => fakebr.lorem.sentence(),
  },

  Usuario: {
    ativo: () => Math.random() < 0.8,
    cpf: () => fakebr.br.cpf(),
    email: () => fakebr.internet.email(),
    celular: () => faker.phone.number("(##) 9####-####"),
    cnh: () => fakebr.helpers.replaceSymbols("###########"),
    data_nomeacao: () => fakebr.date.past(),
    cargo: () => fakebr.name.jobType(),
    formacao: () => fakebr.name.jobArea(),
    nivel_acesso: () => {
      const values = ["municipe", "operador", "administrador", "secretario"];
      const selected = values[Math.floor(Math.random() * values.length)];
      return {
        municipe: selected === "municipe",
        operador: selected === "operador",
        secretario: selected === "secretario",
        administrador: selected === "administrador",
      };
    },
    nome_social: () => fakebr.name.firstName() + " " + fakebr.name.lastName(),
    portaria_nomeacao: () =>
      `PORTARIA/${faker.number.int({ min: 1000, max: 9999 })}`,
    senha: () => fakebr.internet.password(),
    endereco: {
      logradouro: () => fakebr.address.streetName(),
      cep: () => fakebr.address.zipCode(),
      bairro: () => fakebr.address.county(),
      numero: () => Math.floor(Math.random() * 9000) + 1000,
      complemento: () => fakebr.address.secondaryAddress(),
      cidade: () => fakebr.address.city(),
      estado: () => {
        return estadosBrasil[Math.floor(Math.random() * estadosBrasil.length)];
      }
    },
    tokenUnico: () => "",
    accesstoken: () => "",
    refreshtoken: () => "",
    codigo_recupera_senha: () => "",
    exp_codigo_recupera_senha: () => undefined,
    grupo: () => {
      return new mongoose.Types.ObjectId().toString();
    },
  },

  Secretaria: {
    nome_secretaria: () => {
      const values = [
        "Secretaria Municipal de Transporte e Trânsito",
        " Serviço Autônomo de Águas e Esgotos",
        "Secretaria Municipal de Obras e Serviços Públicos",
      ];
      return values[Math.floor(Math.random() * values.length)];
    },
    sigla: () => fakebr.lorem.word(),
    email: () => fakebr.internet.email(),
    telefone: () => faker.phone.number('(##) 9####-####')
  },

  TipoDemanda: {
    titulo: () => fakebr.lorem.word(),
    icone: () => fakebr.internet.url() + "/" + uuid() + ".jpg",
    subdescricao: () => fakebr.lorem.sentence(),
    tipo: () => {
      const values = [
        "Coleta",
        "Iluminação",
        "Saneamento",
        "Árvores",
        "Animais",
        "Pavimentação",
      ];
      return values[Math.floor(Math.random() * values.length)];
    },
  },

  Demanda: {
    status: () => {
      const values = ["Em aberto", "Em andamento", "Concluída"];
      return values[Math.floor(Math.random() * values.length)];
    },
    data: () => fakebr.date.past(),
    resolucao: () => fakebr.random.words(),
    feedback: () => parseFloat(Math.floor(Math.random() * 5)) + 1,
    avaliacao_resolucao: () => fakebr.lorem.sentence(),
    motivo_devolucao: () => fakebr.lorem.sentence(),
    link_imagem_resolucao: () => fakebr.internet.url() + "/" + uuid() + ".jpg",
    usuarios: () => [{ _id: new mongoose.Types.ObjectId().toString() }],
    endereco: {
        logradouro: fakebr.address.streetName(),
        cep: fakebr.address.zipCode(),
        bairro: fakebr.address.county(),
        numero: (Math.floor(Math.random() * 9999) + 1000),
        complemento: fakebr.address.secondaryAddress()
      }
  },

  Grupo: {
    ativo: () => Math.random() < 0.9, // true na maioria das vezes
    permissoes: () => {
      // Um array fake com 1 ou 2 permissões
      return [
        {
          rota: 'demandas',
          dominio: 'localhost',
          ativo: true,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: false,
        },
      ];
    },
  },

  Rota: {
    rota: () => {
      const rotas = ['demandas', 'usuarios', 'secretarias', 'grupos'];
      return rotas[Math.floor(Math.random() * rotas.length)];
    },
    dominio: () => 'localhost',
    ativo: () => true,
    buscar: () => true,
    enviar: () => true,
    substituir: () => false,
    modificar: () => false,
    excluir: () => false,
  },

  Grupo: {
    ativo: () => Math.random() < 0.9, // true na maioria das vezes
    permissoes: () => {
      // Um array fake com 1 ou 2 permissões
      return [
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
      ];
    },
  },

  Rota: {
    rota: () => {
      const rotas = [
        "demandas",
        "usuarios",
        "secretaria",
        "grupos",
        "tipoDemanda",
      ];
      return rotas[Math.floor(Math.random() * rotas.length)];
    },
    dominio: () => "localhost",
    ativo: () => true,
    buscar: () => true,
    enviar: () => true,
    substituir: () => false,
    modificar: () => false,
    excluir: () => false,
  },
};

/**
 * Retorna o mapping global, consolidando os mappings comuns e específicos.
 * Nesta versão automatizada, carregamos os models e combinamos o mapping comum com o mapping específico de cada model.
 */
export async function getGlobalFakeMapping() {
  const models = await loadModels();
  let globalMapping = { ...fakeMappings.common };

  models.forEach(({ name }) => {
    if (fakeMappings[name]) {
      globalMapping = {
        ...globalMapping,
        ...fakeMappings[name],
      };
    }
  });

  return globalMapping;
}

/**
 * Função auxiliar para extrair os nomes dos campos de um schema,
 * considerando apenas os níveis superiores (campos aninhados são verificados pela parte antes do ponto).
 */
function getSchemaFieldNames(schema) {
  const fieldNames = new Set();
  Object.keys(schema.paths).forEach((key) => {
    if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return;
    const topLevel = key.split(".")[0];
    fieldNames.add(topLevel);
  });
  return Array.from(fieldNames);
}

/**
 * Valida se o mapping fornecido cobre todos os campos do model.
 * Retorna um array com os nomes dos campos que estiverem faltando.
 */
function validateModelMapping(model, modelName, mapping) {
  if (!model || !model.schema || !model.schema.paths) {
    console.warn(`⚠️  Model ${modelName} é inválido ou sem schema.paths.`);
    return [];
  }

  const fields = getSchemaFieldNames(model.schema);
  const missing = fields.filter((field) => !(field in mapping));
  if (missing.length > 0) {
    console.error(
      `Model ${modelName} está faltando mapeamento para os campos: ${missing.join(
        ", "
      )}`
    );
  } else {
    console.log(`Model ${modelName} possui mapeamento para todos os campos.`);
  }
  return missing;
}

/**
 * Executa a validação para os models fornecidos, utilizando o mapping específico de cada um.
 */
async function validateAllMappings() {
  const models = await loadModels();
  let totalMissing = {};

  models.forEach(({ model, name }) => {
    // Combina os campos comuns com os específicos de cada model
    const mapping = {
      ...fakeMappings.common,
      ...(fakeMappings[name] || {}),
    };
    const missing = validateModelMapping(model, name, mapping);
    if (missing.length > 0) {
      totalMissing[name] = missing;
    }
  });

  if (Object.keys(totalMissing).length === 0) {
    console.log("globalFakeMapping cobre todos os campos de todos os models.");
    return true;
  } else {
    console.warn("Faltam mapeamentos para os seguintes models:", totalMissing);
    return false;
  }
}

// Executa a validação antes de prosseguir com o seeding ou outras operações
validateAllMappings()
  .then((valid) => {
    if (valid) {
      console.log("Podemos acessar globalFakeMapping com segurança.");
      // Prossegue com o seeding ou outras operações
    } else {
      throw new Error(
        "globalFakeMapping não possui todos os mapeamentos necessários."
      );
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export default getGlobalFakeMapping;
