import secretariaSchemas from "../schemas/secretariaSchema.js";
//import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const secretariaRoutes = {
    "/secretaria": {
        get: {
            tags: ["Secretaria"],
            summary: "Lista todos as Secretarias cadastradas.",
            description: `
        + Caso de uso: Permitir que o sistema ou um usuário autorizado liste todos as secretarias disponíveis no sistema, com possibilidade de filtro por nome ou sigla.
        
        + Função de Negócio:
            - Permitir à front-end obter uma lista das secretarias cadastradas.
            + Recebe como query parameters (opcionais):
                • filtros: nome e/ou sigla.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **SecretariaListagem**, contendo:
                • **items**: array de secretarias. 
      `,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(secretariaSchemas.SecretariaFiltro),
            responses: {
                200: commonResponses[200](secretariaSchemas.SecretariaListagem),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Secretaria"],
            summary: "Cadastro de novas Secretarias",
            description: `
            + Caso de uso: Permitir que o administrador cadastre uma nova secretaria no sistema.
            
            + Função de Negócio:
                - Permitir à front-end permitir cadastrar uma Secretaria.
                + Recebe no corpo da requisição os seguintes campos:
                    - **nome**: nome da Secretaria.
                    - **sigla**: sigla da Secretaria.
                    - **email**: email da Secretaria.
                    - **telefone**: telefone da Secretaria.

            + Regras de Negócio:
                - O corpo da requisição deve seguir o SecretariaSchema.
                - Campos obrigatórios como nome, sigla, email e telefone devem ser enviados.
                - Não deve permitir a criação de secretaria com nome e/ou sigla duplicados.

            + Resultado Esperado:
                - HTTP 200 OK retornando a mensagem de secretaria criada com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.
        `,
            security: [{ bearerAuth: [] }],
             requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/SecretariaPost"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/SecretariaPost"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/secretaria/{id}": {
        get: {
            tags: ["Secretaria"],
            summary: "Obtém detalhes de uma secretaria",
            description: `
            + Caso de uso: Consulta de detalhes de uma secretaria específica.
            
            + Função de Negócio:
                - Permitir à front-end obter todas as informações de uma secretaria cadastrada.
                + Recebe como path parameter:
                    - **id**: identificador da secretaria (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.

            + Resultado Esperado:
                - HTTP 200 OK com corpo conforme **SecretariaDetalhes**, contendo dados completos da secretaria.
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
                200: commonResponses[200]("#/components/schemas/SecretariaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Secretaria"],
            summary: "Atualização de secretaria (PATCH)",
            description: `
            + Caso de uso: - Permitir que o administrador atualize parcialmente ou totalmente os dados de uma secretaria existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar uma secretaria.
                + Recebe como path parameter:
                    - **id**: identificador da secretaria (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o SecretariaIDSchema.
                - Os dados enviados devem seguir o SecretariaUpdateSchema.
                - Não deve permitir a criação de secretaria com nomes e/ou sigla duplicados.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da secretaria são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/SecretariaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/SecretariaPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Secretaria"],
            summary: "Atualização de secretaria (PUT)",
            description: `
            + Caso de uso: - Permitir que o administrador atualize totalmente os dados de uma secretaria existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar uma secretaria.
                + Recebe como path parameter:
                    - **id**: identificador da secretaria (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o SecretariaIDSchema.
                - Os dados enviados devem seguir o SecretariaUpdateSchema.
                - Não deve permitir a criação de secretaria com nomes e/ou sigla duplicados.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da secretaria são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/SecretariaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/SecretariaPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Secretaria"],
            summary: "Deleta uma secretaria",
            description: `
            + Caso de uso: - Permitir que o administrador exclua uma secretaria do sistema, caso ela não esteja vinculada a nenhuma demanda ativa.
            
            + Função de Negócio:
                - Permitir à front-end permitir deletar uma secretaria.
                + Recebe como path parameter:
                    - **id**: identificador da secretaria (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o SecretariaIDSchema.
                - Caso o tipo de demanda esteja associado a demandas existentes, a exclusão deve ser impedida.
                - A existência da secretaria deve ser verificada antes de excluí-lo.

            + Resultado Esperado:
                - HTTP 200 OK e a secretaria é removido com sucesso do banco de dados e o sistema retorna uma mensagem de sucesso e os dados da secretaria excluída.
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

export default secretariaRoutes;