// schemas/TipoDemandasSchemas.js
import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Secretaria from '../../models/Secretaria.js';


// Importa as funções utilitárias separadas
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir dos schemas dos modelos
const secretariaJsonSchema = Secretaria.schema.jsonSchema();

// Remove campos que não queremos na base original
delete secretariaJsonSchema.properties.__v;

// Componha os diferentes contratos da sua API utilizando cópias profundas dos schemas
const secretariaSchemas = {
  SecretariaFiltro: {
    type: "object",
    properties: {
      nome: secretariaJsonSchema.properties.nome,
      sigla: secretariaJsonSchema.properties.sigla
    }
  },
  SecretariaListagem: {
    ...deepCopy(secretariaJsonSchema),
    description: "Schema para listagem dos tipo Demanda"
  },
  SecretariaDetalhes: {
    ...deepCopy(secretariaJsonSchema),
    description: "Schema para detalhes de um tipo Demanda"
  },
  SecretariaPost: {
    ...deepCopy(secretariaJsonSchema),
    required: [
        'nome',
        'sigla',
        'email',
        'telefone'
    ],
    description: "Schema para criação de um tipo Demanda"
  },
  SecretariaPutPatch: {
    ...deepCopy(secretariaJsonSchema),
    required: [],
    description: "Schema para atualização de um tipo Demanda"
  }
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  SecretariaListagem: ['__v'],
  SecretariaDetalhes: ['__v'],
  SecretariaPost: ['createdAt', 'updatedAt', '__v', '_id'],
  SecretariaPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
  SecretariaDelete: ['createdAt', 'updatedAt', '__v', '_id'],
};

// Aplica a remoção de campos de forma individual a cada schema
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (secretariaSchemas[schemaKey]) {
    removeFieldsRecursively(secretariaSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detectar referências automaticamente
const secretariaMongooseSchema = Secretaria.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para detecção de referências
secretariaSchemas.SecretariaListagem.example = await generateExample(secretariaSchemas.SecretariaListagem, null, secretariaMongooseSchema);
secretariaSchemas.SecretariaDetalhes.example = await generateExample(secretariaSchemas.SecretariaDetalhes, null, secretariaMongooseSchema);
secretariaSchemas.SecretariaPost.example = await generateExample(secretariaSchemas.SecretariaPost, null, secretariaMongooseSchema);
secretariaSchemas.SecretariaPutPatch.example = await generateExample(secretariaSchemas.SecretariaPutPatch, null, secretariaMongooseSchema);

export default secretariaSchemas;