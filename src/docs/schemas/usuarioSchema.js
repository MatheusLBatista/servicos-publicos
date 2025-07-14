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
    description: "Schema para criação de um usuário",
    example: 
      {
        cpf: "31782537856",
        email: "Adriana.Saraiva3@gmail.com",
        celular: "35935198784",
        cnh: "28525359763",
        data_nomeacao: "2024-07-14T12:30:00.000Z",
        cargo: "Planejador",
        formacao: "Segurança",
        link_imagem: "http://edivan.net/b4a264ac-c062-4a5d-afe4-62f6f8428515.jpg",
        nivel_acesso: {
          municipe: false,
          operador: false,
          secretario: true,
          administrador: false
        },
        nome: "Adriana Saraiva",
        ativo: true,
        portaria_nomeacao: "PORTARIA/8871",
        senha: "Senha@123",
        endereco: {
          logradouro: "Rua das Flores",
          bairro: "Jardim Bom",
          numero: 123,
          cidade: "São Paulo",
          estado: "SP",
          cep: "01234567"
        },
        secretarias: ["687466f04c27d5dd5911bedb"]
    }
  },
  UsuarioPutPatch: {
    ...deepCopy(usuarioJsonSchema),
    required: [],
    description: "Schema para atualização de um usuário",
    example: 
      {
        celular: "35935198884",
        cargo: "Planejador de Softwares",
        formacao: "Segurança de dados",
        nome: "Adriana Saraiva Pereira",
        endereco: {
          logradouro: "Rua das Ramas",
          bairro: "Jardim Feris",
          numero: 333,
          cidade: "São Paulo",
          estado: "SP",
          cep: "91234567"
        }
    }
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
    description: "Schema para cadastro de usuário",
      example: {
        nome: "João Silva",
        cpf: "12345687900",
        email: "joao.silva@email.com",
        senha: "Senha@123",
        cnh: "13345678900",
        celular: "12345678900",
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

/**
 * Schemas personalizados para upload/download de foto de usuário, não há como automatizar
 */
usuarioSchemas.UsuarioFotoPayload = {
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

export default usuarioSchemas;