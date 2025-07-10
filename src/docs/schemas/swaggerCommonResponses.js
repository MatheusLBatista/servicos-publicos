// src/docs/swaggerCommonResponses.js

import HttpStatusCodes from "../../utils/helpers/HttpStatusCodes.js";

const swaggerCommonResponses = {};

// Percorre todas as chaves do HttpStatusCodes e cria dinamicamente
// um método para cada status code, no mesmo padrão que você já utiliza.
Object.keys(HttpStatusCodes).forEach((statusKey) => {
    const { code, message } = HttpStatusCodes[statusKey];

    swaggerCommonResponses[code] = (schemaRef = null, description = message) => ({
        description,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        data: schemaRef
                            ? { $ref: schemaRef }
                            : { type: "array", items: {}, example: [] },
                        message: { type: "string", example: message },
                        errors: {
                            type: "array",
                            // Para status de erro, retorna um array com um objeto contendo a mensagem
                            example: code >= 400 ? [{ message }] : [],
                        },
                    },
                },
            },
        },
    });
});

export default swaggerCommonResponses;
