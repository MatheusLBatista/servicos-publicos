import tipoDemandaSchemas from "../schemas/tipoDemandaSchema.js";
import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário


const tipoDemandaRoutes = {
    "/tipoDemanda": {
        get: {
            tags: ["TipoDemanda"],
            summary: "Lista todos os tipos Demanda",
            description: `
        + Caso de uso: Permitir que o sistema ou um usuário autorizado liste todos os tipos de demanda disponíveis no sistema.
        
        + Função de Negócio:
            - Permitir à front-end obter uma lista dos tipos de Demanda cadastrados.
            + Recebe como query parameters (opcionais):
                • filtros: titulo e/ou tipo.

        + Regras de Negócio:
            - Validar formatos e valores dos filtros fornecidos.  
            - A listagem deve ocorrer mesmo se nenhuma query (filtro) for enviada.

        + Resultado Esperado:
            - 200 OK com corpo conforme schema **tipoDemandaListagem**, contendo:
                • **items**: array de tipoDemandas. 
      `,
            security: [{ bearerAuth: [] }],
            parameters: generateParameters(tipoDemandaSchemas.TipoDemandaFiltro),
            responses: {
                200: commonResponses[200](tipoDemandaSchemas.TipoDemandaListagem),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
    "/tipoDemanda/{id}": {
        get: {
            tags: ["TipoDemanda"],
            summary: "Obtém detalhes de um tipo Demanda",
            description: `
            + Caso de uso: Consulta de detalhes de um tipoDemanda específico.
            
            + Função de Negócio:
                - Permitir à front-end obter todas as informações de um tipoDemanda cadastrado.
                + Recebe como path parameter:
                    - **id**: identificador do tipoDemanda (MongoDB ObjectId).

            + Regras de Negócio:
                - Validação do formato do ID.

            + Resultado Esperado:
                - HTTP 200 OK com corpo conforme **tipoDemandaDetalhes**, contendo dados completos do tipoDemanda.
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
                200: commonResponses[200]("#/components/schemas/ExampleDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
    },
};

export default tipoDemandaRoutes;
