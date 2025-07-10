//import authPaths from "../paths/auth.js";
import tipoDemandaPaths from "../paths/tipoDemanda.js";
import tipoDemandaSchemas from "../schemas/tipoDemandaSchema.js";

// Função para definir as URLs do servidor dependendo do ambiente
const getServersInCorrectOrder = () => {
    const devUrl = { url: process.env.SWAGGER_DEV_URL || `http://localhost:5011` };
    const prodUrl1 = { url: process.env.SWAGGER_PROD_URL || "http://localhost:5011/servicos" };

    if (process.env.NODE_ENV === "production") return [prodUrl1, devUrl];
    else return [devUrl, prodUrl1];
};

// Função para obter as opções do Swagger
const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API de Serviços Públicos",
                version: "1.0.0",
                description: "",
                contact: {
                    name: "Serviços Públicos",
                    email: "servicosPublicos@ifro.edu.br",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "TipoDemanda",
                    description: "Rotas para o gerenciamento de tipoDemanda"
                },
            ],
            paths: {
                ...tipoDemandaPaths,
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                },
                schemas: {
                    ...tipoDemandaSchemas,
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ["./src/routes/*.js"]
    };
};

export default getSwaggerOptions;
