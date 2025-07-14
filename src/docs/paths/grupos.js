import grupoSchemas from "../schemas/gruposSchema.js";
// import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const gruposRoutes = {
    "/grupos": {
        get: {
            tags: ["Grupos"],
            summary: "Lista todos os grupos",
            description: `
        + Caso de uso: Permitir que o administrador liste os grupos, com possibilidade de filtro por nome.
        
        + Função de Negócio:
            - Permitir ao front-end obter uma lista dos grupos cadastradas.
            + Recebe como query parameters (opcionais):
                • filtro: nome.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.
            - Apenas os administradores terão acesso aos grupos.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **GrupoListagem**, contendo:
                • **items**: array de grupos. 
      `,
            security: [{ bearerAuth: [] }],
            // Gerando os parâmetros a partir do JSON Schema recursivamente
            parameters: generateParameters(grupoSchemas.GrupoFiltro),
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoListagem"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Grupos"],
            summary: "Cria um novo grupo",
            description: `
            + Caso de uso: Permitir que o administrador cadastre um novo grupo no sistema.
            
            + Função de Negócio:
                - Permitir ao front-end permitir cadastrar um grupo.
                + Recebe no corpo da requisição os seguintes campos:
                    - **nome**: nome do Grupo.
                    - **descricao**: descrição do Grupo.
                    - **ativo**: ativo.
                    - **permissoes**: array de permissões do Grupo.

            + Regras de Negócio:
                - O corpo da requisição deve seguir o GrupoSchema.
                - Campos obrigatórios como nome e descricao devem ser enviados.
                - Não deve permitir a criação de grupo com nome duplicado.

            + Resultado Esperado:
                - HTTP 200 OK retornando a mensagem de grupo criado com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.
        `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/GrupoPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/grupos/{id}": { // endpoint ajustado para manter o padrão plural
        get: {
            tags: ["Grupos"],
            summary: "Obtém detalhes de um grupo",
            description: `
            + Caso de uso: Consulta de detalhes de grupo específico.
            
            + Função de Negócio:
                - Permitir à front-end obter todas as informações de um grupo cadastrado.
                + Recebe como path parameter:
                    - **id**: identificador do grupo (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.

            + Resultado Esperado:
                - HTTP 200 OK com corpo conforme **GrupoDetalhes**, contendo dados completos do grupo.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Grupos"],
            summary: "Atualiza um grupo",
            description: `
            + Caso de uso: - Permitir que o administrador atualize parcialmente ou totalmente os dados de um grupo existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar um grupo.
                + Recebe como path parameter:
                    - **id**: identificador do grupo (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o GrupoIDSchema.
                - Os dados enviados devem seguir o GrupoUpdateSchema.

            + Resultado Esperado:
                - HTTP 200 OK e os dados do grupo são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    }
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/GrupoPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Grupos"],
            summary: "Atualiza um grupo",
            description: `
            + Caso de uso: - Permitir que o administrador atualize parcialmente ou totalmente os dados de um grupo existente.
            
            + Função de Negócio:
                - Permitir à front-end permitir atualizar um grupo.
                + Recebe como path parameter:
                    - **id**: identificador do grupo (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o GrupoIDSchema.
                - Os dados enviados devem seguir o GrupoUpdateSchema.

            + Resultado Esperado:
                - HTTP 200 OK e os dados do grupo são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
                    }
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/GrupoPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/GrupoDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Grupos"],
            summary: "Deleta um grupo",
            description: `
            + Caso de uso: - Permitir que o administrador exclua um grupo do sistema.
            
            + Função de Negócio:
                - Permitir ao front-end permitir deletar um grupo.
                + Recebe como path parameter:
                    - **id**: identificador do grupo (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o GrupoIDSchema.
                - A existência do grupo deve ser verificada antes de excluí-lo.

            + Resultado Esperado:
                - HTTP 200 OK e o grupo é removido com sucesso do banco de dados e o sistema retorna uma mensagem de sucesso e os dados da secretaria excluída.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string"
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
        }
    }
};

export default gruposRoutes;
