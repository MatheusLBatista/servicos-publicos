import usuarioSchema from "../schemas/usuarioSchema.js";
//import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const usuarioRoutes = {
    "/usuarios": {
        get: {
            tags: ["Usuários"],
            summary: "Lista todos os usuários cadastradas.",
            description: `
        + Caso de uso: Permitir que o sistema ou um usuário autorizado liste todos os usuários disponíveis no sistema, com possibilidade de filtros.
        
        + Função de Negócio:
            - Permitir ao front-end obter uma lista das usuários cadastradas.
            + Recebe como query parameters (opcionais):
                • filtros: nome, email, ativo, secretaria, nivelAcesso, cargo e formacao.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.
            - Os usuários do tipo munícipe e operador podem apenas ver seus próprios dados.
            - Os usuários do tipo secretaria terão acesso apenas aos usuários da mesma secretaria que ele.
            - Os administradores terão acesso a todos os usuários.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **UsuarioListagem**, contendo:
                • **items**: array de usuários. 
      `,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(usuarioSchema.UsuarioFiltro),
            responses: {
                200: commonResponses[200](usuarioSchema.UsuarioListagem),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Usuários"],
            summary: "Cadastro de novos usuários",
            description: `
            + Caso de uso: Permitir que o administrador cadastre um novo usuário no sistema.
            
            + Função de Negócio:
                - Permitir ao front-end permitir cadastrar uma Usuario.
                + Recebe no corpo da requisição os seguintes campos:
                    - **nome**: nome do usuário.
                    - **cpf**: cpf do usuário.
                    - **email**: email do usuário.
                    - **cnh**: cnh do usuário.
                    - **celular**: celular do usuário.
                    - **endereco**: endereco do usuário.

            + Regras de Negócio:
                - O corpo da requisição deve seguir o UsuarioSchema.
                - Campos obrigatórios como nome, cnh, email, celular, cpf e endereco devem ser enviados.
                - Não deve permitir a criação de usuario com email, cpf ou cnh duplicados.
                - Apenas o usuário o tipo administrador pode criar outros usuários.

            + Resultado Esperado:
                - HTTP 200 OK retornando a mensagem de usuário criada com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.
        `,
            security: [{ bearerAuth: [] }],
             requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPost"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/usuarios/{id}": {
        get: {
            tags: ["Usuários"],
            summary: "Obtém detalhes de um usuário",
            description: `
            + Caso de uso: Consulta de detalhes de um usuário específico.
            
            + Função de Negócio:
                - Permitir ao front-end obter todas as informações de um usuário cadastrado.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.
                - Os usuários do tipo munícipe e operador podem apenas ver seus próprios dados.
                - Os usuários do tipo secretaria terão acesso apenas aos usuários da mesma secretaria que ele.
                - Os administradores terão acesso a todos os usuários.

            + Resultado Esperado:
                - HTTP 200 OK com corpo conforme **UsuarioDetalhes**, contendo dados completos da usuario.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Usuários"],
            summary: "Atualização de usuário (PATCH)",
            description: `
            + Caso de uso: - Permitir que os usuários atualizem parcialmente seus próprios dados.
            
            + Função de Negócio:
                - Permitir ao front-end atualizar um usuário.
                + Recebe como path parameter:
                    - **id**: identificador do usuário (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - Os dados enviados devem seguir o UsuarioUpdateSchema.
                - Não deve permitir a atualização do email ou senha.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da usuario são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }
            ],
             requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Usuários"],
            summary: "Atualização de usuário (PUT)",
            description: `
            + Caso de uso: - Permitir que os usuários atualizem parcialmente seus próprios dados.
            
            + Função de Negócio:
                - Permitir ao front-end atualizar um usuário.
                + Recebe como path parameter:
                    - **id**: identificador do usuário (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - Os dados enviados devem seguir o UsuarioUpdateSchema.
                - Não deve permitir a atualização do email ou senha.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da usuario são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }
            ],
             requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Usuários"],
            summary: "Deleta um usuário",
            description: `
            + Caso de uso: - Permitir que o administrador exclua um usuário do sistema e que o munícipe possa excluir a si mesmo.
            
            + Função de Negócio:
                - Permitir ao front-end excluir um usuário.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - O usuário que não for administrador não pode excluir os demais usuários.
                - O usuário munícipe pode excluir a si mesmo.
                - A existência da usuário deve ser verificada antes de excluí-lo.

            + Resultado Esperado:
                - HTTP 200 OK e a usuario é removido com sucesso do banco de dados e o sistema retorna uma mensagem de sucesso e os dados da usuario excluída.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                    }
                }
            ],
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
};

export default usuarioRoutes;