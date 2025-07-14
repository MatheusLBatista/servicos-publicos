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
            - Permitir ao front-end obter uma lista dos usuários cadastradas.
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
            parameters: [
                {
                    name: "nome",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por nome"
                },
                {
                    name: "email",
                    in: "query",
                    schema: { type: "string", format: "email" },
                    required: false,
                    description: "Filtra por email"
                },
                {
                    name: "ativo",
                    in: "query",
                    schema: { type: "boolean" },
                    required: false,
                    description: "Filtra por status ativo"
                },
                {
                    name: "secretaria",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por secretaria"
                },
                {
                    name: "cargo",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por cargo"
                },
                {
                    name: "formação",
                    in: "query",
                    schema: { type: "string" },
                    required: false,
                    description: "Filtra por formação"
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
                200: commonResponses[200]("#/components/schemas/UsuarioListagem"),
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
    // Rotas para upload de foto do usuário
    //todo: revisar
    "/usuarios/{id}/foto": {
        post: {
            tags: ["Usuários"],
            summary: "Faz upload da foto do usuário",
            description: `
            + Caso de uso: Recebe um arquivo de imagem e atualiza o link_imagem do usuário.
            + Função de Negócio:
                - Validar extensão (jpg, jpeg, png, svg).
                - Redimensionar para 400×400.
                - Salvar no servidor e atualizar o campo link_imagem.
            + Regras de Negócio:
                - Verificar se o usuário existe.
                - Usuário pode apenas atualizar sua própria foto, exceto o administrador.
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
                200: commonResponses[200]('#/components/schemas/UsuarioFotoPayload'),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        get: {
            tags: ["Usuários"],
            summary: "Faz download da foto do usuário",
            description: `
            + Caso de uso: Retorna o arquivo de imagem associado ao usuário.
            + Função de Negócio:
                - Buscar link_imagem no banco.
                - Retornar o binário da imagem com o Content-Type apropriado.
            + Regras de Negócio:
                - Verificar se o usuário existe.
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

export default usuarioRoutes;