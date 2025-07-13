import grupoSchemas from "../schemas/gruposSchema.js";
// import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const gruposRoutes = {
    "/grupos": {
        get: {
            tags: ["Grupos"],
            summary: "Lista todos os grupos",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
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
