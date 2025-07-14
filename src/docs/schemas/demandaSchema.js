import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Demanda from '../../models/Demanda.js';

// Importa as funções utilitárias separadas
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir dos schemas dos modelos
const demandaJsonSchema = Demanda.schema.jsonSchema();

// Remove campos que não queremos na base original
delete demandaJsonSchema.properties.__v;

// Componha os diferentes contratos da sua API utilizando cópias profundas dos schemas
const demandaSchemas = {
  DemandaFiltro: {
    type: "object",
    properties: {
      // nome: demandaJsonSchema.properties.nome,
      // email: demandaJsonSchema.properties.email,
      // ativo: demandaJsonSchema.properties.ativo,
      // secretaria: demandaJsonSchema.properties.secretaria,
      // // nivel_acesso: demandaJsonSchema.properties.nivel_acesso,
      // cargo: demandaJsonSchema.properties.cargo,
      // formacao: demandaJsonSchema.properties.formacao
    }
  },
  DemandaListagem: {
    ...deepCopy(demandaJsonSchema),
    description: "Schema para listagem dos demandas"
  },
  DemandaDetalhes: {
    ...deepCopy(demandaJsonSchema),
    description: "Schema para detalhes de um demanda"
  },
  DemandaPost: {
    ...deepCopy(demandaJsonSchema),
    required: [
        'tipo',
        'descricao',
        'endereco'
    ],
    description: "Schema para criação de um demanda",
    example: {
      tipo: "Iluminação",
      descricao: "Poste quebrado.",
      endereco: {
          logradouro: "Rua das Flores",
          bairro: "Jardim Bom",
          numero: 123,
          cidade: "São Paulo",
          estado: "SP",
          cep: "01234567"
        }
    }
  },
  DemandaPutPatch: {
    ...deepCopy(demandaJsonSchema),
    required: [],
    description: "Schema para atualização de um demanda",
    example: {
      feedback: 4,
      avaliacao_resolucao: "Poste trocado e iluminação melhorou 50% comparado com o mesmo período do ano passado."
    }
  },
  DemandaAtribuir: {
    ...deepCopy(demandaJsonSchema),
    required: [],
    description: "Schema para atribuir uma demanda",
    example: {
      usuarios: ["687493051022d36d2cfc70d4"]
    }
  },
  DemandaDevolver: {
    ...deepCopy(demandaJsonSchema),
    required: [],
    description: "Schema para devolver uma demanda",
    example: {
      motivo_devolucao: "Não possuo as ferramentas necessárias."
    }
  },
  DemandaResolver: {
    ...deepCopy(demandaJsonSchema),
    required: [],
    description: "Schema para resolver uma demanda",
    example: {
      resolucao: "Problemática ajustada."
    }
  }
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  DemandaListagem: ['__v'],
  DemandaDetalhes: ['__v'],
  DemandaPost: ['createdAt', 'updatedAt', '__v', '_id'],
  DemandaPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
  DemandaDelete: ['createdAt', 'updatedAt', '__v', '_id']
};

// Aplica a remoção de campos de forma individual a cada schema
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (demandaSchemas[schemaKey]) {
    removeFieldsRecursively(demandaSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detectar referências automaticamente
const demandaMongooseSchema = Demanda.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para detecção de referências
demandaSchemas.DemandaListagem.example = await generateExample(demandaSchemas.DemandaListagem, null, demandaMongooseSchema);
demandaSchemas.DemandaDetalhes.example = await generateExample(demandaSchemas.DemandaDetalhes, null, demandaMongooseSchema);
demandaSchemas.DemandaPost.example = await generateExample(demandaSchemas.DemandaPost, null, demandaMongooseSchema);
demandaSchemas.DemandaPutPatch.example = await generateExample(demandaSchemas.DemandaPutPatch, null, demandaMongooseSchema);

/**
 * Schemas personalizados para upload/download de foto de usuário, não há como automatizar
 */
demandaSchemas.DemandaFotoPayload = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Mensagem de sucesso da operação de upload",
      example: "Arquivo recebido e usuário atualizado com sucesso."
    },
    dados: {
      type: "object",
      description: "Dados atualizados do usuário",
      properties: {
        link_imagem: {
          type: "string",
          description: "Nome do arquivo de foto salvo",
          example: "c25069f4-d07b-4836-97a1-2c600b67f9f2.jpg"
        }
      },
      required: ["link_imagem"]
    },
    metadados: {
      type: "object",
      description: "Informações técnicas sobre o arquivo enviado",
      properties: {
        fileName: {
          type: "string",
          example: "c25069f4-d07b-4836-97a1-2c600b67f9f2.jpg"
        },
        fileExtension: {
          type: "string",
          example: "jpg"
        },
        fileSize: {
          type: "integer",
          example: 121421
        },
        md5: {
          type: "string",
          example: "1bd822a4b1ca3c6224b5be5ef330ebdf"
        }
      },
      required: ["fileName", "fileExtension", "fileSize", "md5"]
    }
  },
  required: ["message", "dados", "metadados"],
  description: "Payload de resultado de upload de foto de usuário"
};

export default demandaSchemas;