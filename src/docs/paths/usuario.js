import usuarioSchema from "../schemas/usuarioSchema.js";
//import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const usuarioRoutes = {
    "/usuarios": {
        get: {
            tags: ["Usuario"],
            summary: "Lista todos os usuarios cadastradas.",
            description: `
        + Caso de uso: Permitir que o sistema ou um usuário autorizado liste todos as usuarios disponíveis no sistema, com possibilidade de filtro por nome ou sigla.
        
        + Função de Negócio:
            - Permitir à front-end obter uma lista das usuarios cadastradas.
            + Recebe como query parameters (opcionais):
                • filtros: nome e/ou sigla.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **UsuarioListagem**, contendo:
                • **items**: array de usuarios. 
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
            tags: ["Usuario"],
            summary: "Cadastro de novas Usuarios",
            description: `
            + Caso de uso: Permitir que o administrador cadastre um novo usuário no sistema.
            
            + Função de Negócio:
                - Permitir à front-end permitir cadastrar uma Usuario.
                + Recebe no corpo da requisição os seguintes campos:
                    - **nome**: nome da Usuario.
                    - **sigla**: sigla da Usuario.
                    - **email**: email da Usuario.
                    - **telefone**: telefone da Usuario.

            + Regras de Negócio:
                - O corpo da requisição deve seguir o UsuarioSchema.
                - Campos obrigatórios como nome, sigla, email e telefone devem ser enviados.
                - Não deve permitir a criação de usuario com nome e/ou sigla duplicados.

            + Resultado Esperado:
                - HTTP 200 OK retornando a mensagem de usuario criada com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.
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
            tags: ["Usuario"],
            summary: "Obtém detalhes de uma usuario",
            description: `
            + Caso de uso: Consulta de detalhes de uma usuario específica.
            
            + Função de Negócio:
                - Permitir à front-end obter todas as informações de uma usuario cadastrada.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.

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
            tags: ["Usuario"],
            summary: "Atualização de usuario (PATCH)",
            description: `
            + Caso de uso: - Permitir que o administrador atualize parcialmente ou totalmente os dados de uma usuario existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar uma usuario.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - Os dados enviados devem seguir o UsuarioUpdateSchema.
                - Não deve permitir a criação de usuario com nomes e/ou sigla duplicados.

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
            tags: ["Usuario"],
            summary: "Atualização de usuario (PUT)",
            description: `
            + Caso de uso: - Permitir que o administrador atualize totalmente os dados de uma usuario existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar uma usuario.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - Os dados enviados devem seguir o UsuarioUpdateSchema.
                - Não deve permitir a criação de usuario com nomes e/ou sigla duplicados.

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
            tags: ["Usuario"],
            summary: "Deleta uma usuario",
            description: `
            + Caso de uso: - Permitir que o administrador exclua uma usuario do sistema, caso ela não esteja vinculada a nenhuma demanda ativa.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar uma usuario.
                + Recebe como path parameter:
                    - **id**: identificador da usuario (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o UsuarioIDSchema.
                - Caso o tipo de demanda esteja associado a demandas existentes, a exclusão deve ser impedida.
                - A existência da usuario deve ser verificada antes de excluí-lo.

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