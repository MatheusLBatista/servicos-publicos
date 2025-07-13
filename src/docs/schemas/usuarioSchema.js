import mongoose from 'mongoose';
import mongooseSchemaJsonSchema from 'mongoose-schema-jsonschema';
import removeFieldsRecursively from '../../utils/swagger_utils/removeFields.js';
import Usuario from '../../models/Usuario.js';

// Importa as funções utilitárias separadas
import { deepCopy, generateExample } from '../utils/schemaGenerate.js';

// Registra o plugin para que o Mongoose ganhe o método jsonSchema()
mongooseSchemaJsonSchema(mongoose);

// Gera o JSON Schema a partir dos schemas dos modelos
const usuarioJsonSchema = Usuario.schema.jsonSchema();

// Remove campos que não queremos na base original
delete usuarioJsonSchema.properties.__v;

// Componha os diferentes contratos da sua API utilizando cópias profundas dos schemas
const usuarioSchemas = {
  UsuarioFiltro: {
    type: "object",
    properties: {
      nome: usuarioJsonSchema.properties.nome,
      email: usuarioJsonSchema.properties.email,
      ativo: usuarioJsonSchema.properties.ativo,
      secretaria: usuarioJsonSchema.properties.secretaria,
      // nivel_acesso: usuarioJsonSchema.properties.nivel_acesso,
      cargo: usuarioJsonSchema.properties.cargo,
      formacao: usuarioJsonSchema.properties.formacao
    }
  },
  UsuarioListagem: {
    ...deepCopy(usuarioJsonSchema),
    description: "Schema para listagem dos usuários"
  },
  UsuarioDetalhes: {
    ...deepCopy(usuarioJsonSchema),
    description: "Schema para detalhes de um usuário"
  },
  UsuarioPost: {
    ...deepCopy(usuarioJsonSchema),
    required: [
        'cpf',
        'nome',
        'cnh',
        'email',
        'celular',
        'endereco'
    ],
    description: "Schema para criação de um usuário"
  },
  UsuarioPutPatch: {
    ...deepCopy(usuarioJsonSchema),
    required: [],
    description: "Schema para atualização de um usuário"
  },
  UsuarioLogin: {
    ...deepCopy(usuarioJsonSchema),
    required: ["email", "senha"],
    description: "Schema para login de usuário"
  },
  UsuarioRespostaLogin: {
    ...deepCopy(usuarioJsonSchema),
    description: "Schema para resposta de login de usuário"
  },
  signupPost: {
    ...deepCopy(usuarioJsonSchema),
    required: ["nome", "cpf", "email", "senha", "cnh", "endereco"],
    description: "Schema para cadastro de usuário"
  },
  signupPostDestalhes: {
    ...deepCopy(usuarioJsonSchema),
    required: ["nome", "email", "senha"],
    description: "Schema para detalhes do cadastro de usuário"
  }
};

// Mapeamento para definir, de forma individual, quais campos serão removidos de cada schema
const removalMapping = {
  UsuarioListagem: ['__v'],
  UsuarioDetalhes: ['__v'],
  UsuarioPost: ['createdAt', 'updatedAt', '__v', '_id'],
  UsuarioPutPatch: ['createdAt', 'updatedAt', '__v', '_id'],
  UsuarioDelete: ['createdAt', 'updatedAt', '__v', '_id'],
  UsuarioLogin: ['tokenUnico', 'senha', '__v', '_id', 'codigo_recupera_senha', 'exp_codigo_recupera_senha'],
  UsuarioRespostaLogin: ['tokenUnico', 'senha', 'createdAt', 'updatedAt', '__v', 'codigo_recupera_senha', 'exp_codigo_recupera_senha'],
  signupPost: ['accesstoken', 'refreshtoken', 'tokenUnico', 'createdAt', 'updatedAt', '__v', '_id', 'ativo', 'nivel_acesso', 'codigo_recupera_senha', 'secretarias', 'exp_codigo_recupera_senha', 'grupo'],
  signupPostDestalhes: ['accesstoken', 'refreshtoken', 'tokenUnico', 'createdAt', 'updatedAt', '__v', '_id', 'ativo', 'nivel_acesso', 'grupo', 'codigo_recupera_senha', 'exp_codigo_recupera_senha', 'senha', 'secretarias']
};

// Aplica a remoção de campos de forma individual a cada schema
Object.entries(removalMapping).forEach(([schemaKey, fields]) => {
  if (usuarioSchemas[schemaKey]) {
    removeFieldsRecursively(usuarioSchemas[schemaKey], fields);
  }
});

// Utiliza o schema do Mongoose para detectar referências automaticamente
const usuarioMongooseSchema = Usuario.schema;

// Gera os exemplos automaticamente para cada schema, passando o schema do Mongoose para detecção de referências
usuarioSchemas.UsuarioListagem.example = await generateExample(usuarioSchemas.UsuarioListagem, null, usuarioMongooseSchema);
usuarioSchemas.UsuarioDetalhes.example = await generateExample(usuarioSchemas.UsuarioDetalhes, null, usuarioMongooseSchema);
usuarioSchemas.UsuarioPost.example = await generateExample(usuarioSchemas.UsuarioPost, null, usuarioMongooseSchema);
usuarioSchemas.UsuarioPutPatch.example = await generateExample(usuarioSchemas.UsuarioPutPatch, null, usuarioMongooseSchema);
usuarioSchemas.UsuarioLogin.example = await generateExample(usuarioSchemas.UsuarioLogin, null, usuarioMongooseSchema);
usuarioSchemas.UsuarioRespostaLogin.example = await generateExample(usuarioSchemas.UsuarioRespostaLogin, null, usuarioMongooseSchema);
usuarioSchemas.signupPost.example = await generateExample(usuarioSchemas.signupPost, null, usuarioMongooseSchema);

export default usuarioSchemas;