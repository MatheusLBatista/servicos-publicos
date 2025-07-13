// schemas/gruposSchemas.js
import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Grupo from '../../models/Grupo.js';


// Importa as funções utilitárias separadas
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir dos schemas dos modelos
const grupoJsonSchema = Grupo.schema.jsonSchema();

// Remove campos que não queremos na base original
delete grupoJsonSchema.properties.__v;

// Componha os diferentes contratos da sua API utilizando cópias profundas dos schemas
const gruposSchemas = {
  GrupoFiltro: {
    type: "object",
    properties: {
      nome: grupoJsonSchema.properties.nome,
      data_inicio: grupoJsonSchema.properties.data_inicio,
      data_termino: grupoJsonSchema.properties.data_termino,
      status: grupoJsonSchema.properties.status,
      estudante: grupoJsonSchema.properties.estudantes,
    }
  },
  GrupoListagem: {
    ...deepCopy(grupoJsonSchema),
    description: "Schema para listagem de usuários"
  },
  GrupoDetalhes: {
    ...deepCopy(grupoJsonSchema),
    description: "Schema para detalhes de um usuário"
  },
  GrupoPost: {
    ...deepCopy(grupoJsonSchema),
    description: "Schema para criação de usuário"
  },
  GrupoPutPatch: {
    ...deepCopy(grupoJsonSchema),
    required: [],
    description: "Schema para atualização de usuário"
  }
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  GrupoListagem: ['__v'],
  GrupoDetalhes: ['__v'],
  GrupoPost: ['createdAt', 'updatedAt', '__v', '_id'],
  GrupoPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
};

// Aplica a remoção de campos de forma individual a cada schema
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (gruposSchemas[schemaKey]) {
    removeFieldsRecursively(gruposSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detectar referências automaticamente
const grupoMongooseSchema = Grupo.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para detecção de referências
gruposSchemas.GrupoListagem.example = await generateExample(gruposSchemas.GrupoListagem, null, grupoMongooseSchema);
gruposSchemas.GrupoDetalhes.example = await generateExample(gruposSchemas.GrupoDetalhes, null, grupoMongooseSchema);
gruposSchemas.GrupoPost.example = await generateExample(gruposSchemas.GrupoPost, null, grupoMongooseSchema);
gruposSchemas.GrupoPutPatch.example = await generateExample(gruposSchemas.GrupoPutPatch, null, grupoMongooseSchema);

export default gruposSchemas;
