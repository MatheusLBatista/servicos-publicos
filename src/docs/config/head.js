//import authPaths from "../paths/auth.js";
import usuarioPaths from "../paths/usuario.js";
import usuarioSchemas from "../schemas/usuarioSchema.js";
import tipoDemandaPaths from "../paths/tipoDemanda.js";
import tipoDemandaSchemas from "../schemas/tipoDemandaSchema.js";
import secretariaPaths from "../paths/secretaria.js";
import secretariaSchemas from "../schemas/secretariaSchema.js";
import gruposPaths from "../paths/grupos.js";
import grupoSchemas from "../schemas/gruposSchema.js";
import authPaths from "../paths/auth.js";
import authSchemas from "../schemas/authSchema.js";
import demandaPaths from "../paths/demanda.js";
import demandaSchemas from "../schemas/demandaSchema.js";

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
                description: "Documentação da API para gerenciamento de serviços públicos",
                contact: {
                    name: "Serviços Públicos",
                    email: "servicosPublicos@ifro.edu.br",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Auth",
                    description: "Rotas para autenticação e autorização"
                },
                {
                    name: "Usuários",
                    description: "Rotas para o gerenciamento de usuarios"
                },
                {
                    name: "Demandas",
                    description: "Rotas para o gerenciamento de demandas"
                },
                {
                    name: "TipoDemanda",
                    description: "Rotas para o gerenciamento de tipoDemanda"
                },
                {
                    name: "Secretaria",
                    description: "Rotas para o gerenciamento das secretarias"
                },
                {
                    name: "Grupos",
                    description: "Rotas para gestão de grupos"
                }
            ],
            paths: {
                ...authPaths,
                ...usuarioPaths,
                ...demandaPaths,
                ...gruposPaths,
                ...tipoDemandaPaths,
                ...secretariaPaths,
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
                    ...authSchemas,
                    ...usuarioSchemas,
                    ...demandaSchemas,
                    ...grupoSchemas,
                    ...tipoDemandaSchemas,
                    ...secretariaSchemas
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
