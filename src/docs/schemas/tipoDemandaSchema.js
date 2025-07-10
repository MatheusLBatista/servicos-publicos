// schemas/TipoDemandasSchemas.js
import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import TipoDemanda from '../../models/TipoDemanda.js';


// Importa as funções utilitárias separadas
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir dos schemas dos modelos
const tipoDemandaJsonSchema = TipoDemanda.schema.jsonSchema();

// Remove campos que não queremos na base original
delete tipoDemandaJsonSchema.properties.__v;

// Componha os diferentes contratos da sua API utilizando cópias profundas dos schemas
const tipoDemandaSchemas = {
  TipoDemandaFiltro: {
    type: "object",
    properties: {
      titulo: tipoDemandaJsonSchema.properties.titulo,
      tipo: tipoDemandaJsonSchema.properties.tipo
    }
  },
  TipoDemandaListagem: {
    ...deepCopy(tipoDemandaJsonSchema),
    description: "Schema para listagem dos tipo Demanda"
  },
  TipoDemandaDetalhes: {
    ...deepCopy(tipoDemandaJsonSchema),
    description: "Schema para detalhes de um tipo Demanda"
  },
  TipoDemandaPost: {
    ...deepCopy(tipoDemandaJsonSchema),
    required: [
        'titulo',
        'descricao',
        'subdescricao',
        'icone',
        'link_imagem',
        'tipo'
    ],
    description: "Schema para criação de um tipo Demanda"
  },
  TipoDemandaPutPatch: {
    ...deepCopy(tipoDemandaJsonSchema),
    required: [],
    description: "Schema para atualização de um tipo Demanda"
  }
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  TipoDemandaListagem: ['__v'],
  TipoDemandaDetalhes: ['__v'],
  TipoDemandaPost: ['createdAt', 'updatedAt', '__v', '_id'],
  TipoDemandaPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
  TipoDemandaDelete: ['createdAt', 'updatedAt', '__v', '_id'],
};

// Aplica a remoção de campos de forma individual a cada schema
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (tipoDemandaSchemas[schemaKey]) {
    removeFieldsRecursively(tipoDemandaSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detectar referências automaticamente
const TipoDemandaMongooseSchema = TipoDemanda.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para detecção de referências
tipoDemandaSchemas.TipoDemandaListagem.example = await generateExample(tipoDemandaSchemas.TipoDemandaListagem, null, TipoDemandaMongooseSchema);
tipoDemandaSchemas.TipoDemandaDetalhes.example = await generateExample(tipoDemandaSchemas.TipoDemandaDetalhes, null, TipoDemandaMongooseSchema);
tipoDemandaSchemas.TipoDemandaPost.example = await generateExample(tipoDemandaSchemas.TipoDemandaPost, null, TipoDemandaMongooseSchema);
tipoDemandaSchemas.TipoDemandaPutPatch.example = await generateExample(tipoDemandaSchemas.TipoDemandaPutPatch, null, TipoDemandaMongooseSchema);

export default tipoDemandaSchemas;