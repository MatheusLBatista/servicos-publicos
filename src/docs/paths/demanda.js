import demandaSchema from "../schemas/demandaSchema.js";
//import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const demandaRoutes = {
    "/demandas": {
        get: {
            tags: ["Demandas"],
            summary: "Lista todas as demandas cadastradas.",
            description: `
        + Caso de uso: Permitir que o sistema ou um usuário autorizado liste as demandas disponíveis no sistema, com possibilidade de filtros.
        
        + Função de Negócio:
            - Permitir ao front-end obter uma lista das demandas cadastradas.
            + Recebe como query parameters (opcionais):
                • filtros: tipo, status, secretaria, endereco, usuario e data.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.
            - Os usuários do tipo secretario podem apenas listar as demandas de sua secretaria.
            - Os usuários do tipo operador podem apenas listar as demandas que lhe foram atribuídas.
            - Os usuários do tipo munícipe podem apenas listar as demandas que criaram.
            - Os administradores terão acesso a todas as demandas.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **DemandaListagem**, contendo:
                • **items**: array de demandas. 
      `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "tipo",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por tipo"
                },
                {
                    name: "status",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por status"
                },
                {
                    //todo: revisar endereco
                    name: "endereco",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por status endereco"
                },
                {
                    name: "secretaria",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por secretaria"
                },
                {
                    name: "usuario",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por usuario"
                },
                {
                    name: "data",
                    in: "query",
                    schema: { type: "string", format: "date" },
                    required: false,
                    description: "Filtra por data"
                },
                {
                    name: "limite",
                    in: "query",
                    schema: { type: "number" },
                    required: false,
                    description: "Filtra por limite"
                },
                {
                    name: "page",
                    in: "query",
                    schema: { type: "number" },
                    required: false,
                    description: "Filtra por página"
                },
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaListagem"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Demandas"],
            summary: "Cadastro de novos demandas",
            description: `
            + Caso de uso: Permitir que o munícipe e administrador cadastrem uma novo demanda no sistema.
            
            + Função de Negócio:
                - Permitir ao front-end permitir cadastrar uma demanda.
                + Recebe obrigatoriamente no corpo da requisição os seguintes campos:
                    - **tipo**: tipo da demanda.
                    - **descricao**: descricao da demanda.
                    - **endereco**: endereco da demanda.

            + Regras de Negócio:
                - O corpo da requisição deve seguir o DemandaSchema.
                - Campos obrigatórios como tipo, descricao e endereco devem ser enviados.
                - Apenas os usuários do tipo munícipe e administrador podem criar novas demandas.

            + Resultado Esperado:
                - HTTP 200 OK retornando a mensagem de demanda criada com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.
        `,
            security: [{ bearerAuth: [] }],
             requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/DemandaPost"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/demandas/{id}": {
        get: {
            tags: ["Demandas"],
            summary: "Obtém detalhes de uma demanda",
            description: `
            + Caso de uso: Consulta de detalhes de uma demanda específica.
            
            + Função de Negócio:
                - Permitir ao front-end obter todas as informações de uma demanda cadastrada.
                + Recebe como path parameter:
                    - **id**: identificador da demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.
                - Os usuários do tipo munícipe podem ver apenas suas próprias demandas.
                - Os usuários do tipo secretaria terão acesso apenas as demandas da mesma secretaria que ele.
                - Os usuários do tipo operador terão acesso apenas as demandas atribuídas à ele.
                - Os administradores terão acesso a todas as demandas.

            + Resultado Esperado:
                - HTTP 200 OK com corpo conforme **DemandaDetalhes**, contendo dados completos da demanda.
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
                200: commonResponses[200]("#/components/schemas/DemandaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Demandas"],
            summary: "Atualização de demanda (PATCH)",
            description: `
            + Caso de uso: - Permitir que os munícipes atualizem parcialmente suas demandas.
            
            + Função de Negócio:
                - Permitir ao front-end atualizar um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Não deve permitir a atualização do tipo ou data.
                - Apenas os munícipes e administradores podem atualizar uma demandas através dessa rota.
                - Rota usada principalmente para trazer o feedback da resolução da demanda.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Demandas"],
            summary: "Atualização de demanda (PUT)",
            description: `
            + Caso de uso: - Permitir que os munícipes atualizem parcialmente suas demandas.
            
            + Função de Negócio:
                - Permitir ao front-end atualizar um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Não deve permitir a atualização do tipo ou data.
                - Apenas os munícipes e administradores podem atualizar uma demandas através dessa rota.
                - Rota usada principalmente para trazer o feedback da resolução da demanda.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaPutPatch"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Demandas"],
            summary: "Deleta um demanda",
            description: `
            + Caso de uso: - Permitir que o administrador exclua uma demanda do sistema e que o munícipe exclua as que criou.
            
            + Função de Negócio:
                - Permitir ao front-end excluir um demanda.
                + Recebe como path parameter:
                    - **id**: identificador da demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - O usuário que não for administrador não pode excluir as demais demandas.
                - O usuário munícipe pode excluir apenas as suas demandas.
                - A existência da demanda deve ser feita antes de excluí-la.

            + Resultado Esperado:
                - HTTP 200 OK e a demanda é removido com sucesso do banco de dados e o sistema retorna uma mensagem de sucesso e os dados da demanda excluída.
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
    "/demandas/{id}/atribuir": {
        patch: {
            tags: ["Demandas"],
            summary: "Atribuição de demanda (PATCH)",
            description: `
            + Caso de uso: - Permitir que os secretários atribuam demandas aos operadores.
            
            + Função de Negócio:
                - Permitir ao front-end atribuir um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas do usuário na demanda, adicionando o ID do operador.
                - O secretário e operador devem ser da mesma secretaria.
                - Apenas os secretários podem atualizar uma demanda através dessa rota.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaAtribuir"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaAtribuir"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Demandas"],
            summary: "Atribuição de demanda (PUT)",
            description: `
            + Caso de uso: - Permitir que os secretários atribuam demandas aos operadores.
            
            + Função de Negócio:
                - Permitir ao front-end atribuir um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas do usuário na demanda, adicionando o ID do operador.
                - Apenas os secretários podem atualizar uma demanda através dessa rota.
                - O secretário e operador devem ser da mesma secretaria.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaAtribuir"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaAtribuir"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/demandas/{id}/devolver": {
        patch: {
            tags: ["Demandas"],
            summary: "Devolução de demanda (PATCH)",
            description: `
            + Caso de uso: - Permitir que os operadores devolvam demandas à secretaria.
            
            + Função de Negócio:
                - Permitir ao front-end devolver um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas do campo motivo_devolucao da demanda.
                - O operador será automaticamente retirado da demanda.
                - Apenas os operadores podem devolver uma demanda através dessa rota.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaDevolver"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaDevolver"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Demandas"],
            summary: "Devolução de demanda (PUT)",
            description: `
            + Caso de uso: - Permitir que os operadores devolvam demandas à secretaria.
            
            + Função de Negócio:
                - Permitir ao front-end devolver um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas do campo motivo_devolucao da demanda.
                - O operador será automaticamente retirado da demanda.
                - Apenas os operadores podem devolver uma demanda através dessa rota.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaDevolver"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaDevolver"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/demandas/{id}/resolver": {
        patch: {
            tags: ["Demandas"],
            summary: "Resolução de demanda (PATCH)",
            description: `
            + Caso de uso: - Permitir que os operadores resolvam demandas.
            
            + Função de Negócio:
                - Permitir ao front-end resolver um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas dos campos link_imagem_resolucao e resolucao na demanda.
                - Apenas o operador pode resolver uma demanda.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaResolver"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaResolver"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Demandas"],
            summary: "Resolução de demanda (PUT)",
            description: `
            + Caso de uso: - Permitir que os operadores resolvam demandas.
            
            + Função de Negócio:
                - Permitir ao front-end resolver um demanda.
                + Recebe como path parameter:
                    - **id**: identificador do demanda (MongoDB ObjectId).

            + Regras de Negócio:
                - O ID deve ser validado com o DemandaIDSchema.
                - Os dados enviados devem seguir o DemandaUpdateSchema.
                - Devem permitir a atualizaçao apenas dos campos link_imagem_resolucao e resolucao na demanda.
                - Apenas o operador pode resolver uma demanda.

            + Resultado Esperado:
                - HTTP 200 OK e os dados da demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.
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
                            $ref: "#/components/schemas/DemandaResolver"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/DemandaResolver"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    // Rotas para upload de foto do demanda
    "/demandas/{id}/foto/{tipo}": {
        post: {
            tags: ["Demandas"],
            summary: "Faz upload da foto do demanda",
            description: `
            + Caso de uso: Recebe um arquivo de imagem e atualiza o link_imagem do demanda.
            + Função de Negócio:
                - Validar extensão (jpg, jpeg, png, svg).
                - Redimensionar para 400×400.
                - Salvar no servidor e atualizar o campo link_imagem.
            + Regras de Negócio:
                - Verificar se o demanda existe.
                - demanda pode apenas atualizar sua própria foto, exceto o administrador.
                - Garantir que o arquivo seja uma imagem válida.
            + Resultado Esperado:
                - 200 OK com mensagem de sucesso, link_imagem atualizado e metadados do arquivo.
        `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                },
                {
                    name: "tipo",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }
            ],
            requestBody: {
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                file: {
                                    type: "string",
                                    format: "binary",
                                    description: "Arquivo de imagem a ser enviado"
                                }
                            },
                            required: ["file"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]('#/components/schemas/DemandaFotoPayload'),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        get: {
            tags: ["Demandas"],
            summary: "Faz download da foto do demanda",
            description: `
            + Caso de uso: Retorna o arquivo de imagem associado ao demanda.
            + Função de Negócio:
                - Buscar link_imagem no banco.
                - Retornar o binário da imagem com o Content-Type apropriado.
            + Regras de Negócio:
                - Verificar se o demanda existe.
                - Garantir que o arquivo seja uma imagem válida.
            + Resultado Esperado:
                - 200 OK com o arquivo de imagem.
        `,
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                },
                {
                    name: "tipo",
                    in: "path",
                    required: true,
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Arquivo de imagem retornado",
                    content: {
                        "image/jpeg": { schema: { type: "string", format: "binary" } },
                        "image/png": { schema: { type: "string", format: "binary" } },
                        "image/svg+xml": { schema: { type: "string", format: "binary" } }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default demandaRoutes;