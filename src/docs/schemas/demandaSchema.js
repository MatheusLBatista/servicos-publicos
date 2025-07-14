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
    description: "Schema para criação de um demanda"
  },
  DemandaPutPatch: {
    ...deepCopy(demandaJsonSchema),
    required: [],
    description: "Schema para atualização de um demanda"
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

export default demandaSchemas;