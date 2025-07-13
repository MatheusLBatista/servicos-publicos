import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import usuarioSchema from "../schemas/usuarioSchema.js";
import mongoose from "mongoose";

const authRoutes = {
    "/login": {
        post: {
            tags: ["Auth"],
            summary: "Autentica usuário e emite tokens JWT",
            description: `
            + Caso de uso: Autenticação de usuários e emissão de tokens JWT.

            + Função de Negócio
                - Permitir que os usuários (ou sistemas externos) entrem no sistema e obtenham acesso às funcionalidades internas.
                + Recebe credenciais (email e senha) no corpo da requisição.
                    - Se as credenciais estiverem corretas e o usuário for ativo:
                    - Gera um **accessToken** (expiração: 15 minutos; algoritmo: HS256).
                    - Gera um **refreshToken** (expiração: 7 dias) e o armazena em lista de tokens válidos.
                    - Retorna um objeto contendo { accessToken, refreshToken, user }.
            
            + Regras de Negócio Envolvidas:
                - Aplica rate-limit e contagem de tentativas falhas para prevenir brute-force.
                - Se o usuário estiver bloqueado ou inativo, retorna 401 Unauthorized.
                - Auditoria de login deve registrar sucesso/fracasso sem expor senha.

            + Resultado Esperado:
                - Retorno dos tokens de acesso e refresh (se aplicável).
                - Dados básicos do usuário, como nome, status (ativo/inativo) e outras informações relevantes ao contexto de negócio.
      `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/loginPost" }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioRespostaLogin"),
                400: commonResponses[400](),    // Requisição malformada
                422: commonResponses[422](),    // Erro de validação de dados
                500: commonResponses[500]()     // Erro interno
            }
        }
    },

    "/signup": {
        post: {
            tags: ["Auth"],
            summary: "Registra novo usuário no sistema",
            description: `
            + Caso de uso: Criação própria conta no sistema.
            
            + Função de Negócio:
                - Permitir que novos usuários se registrem, criando uma conta com dados básicos.
                + Recebe no corpo da requisição:
                    - Objeto conforme schema **UsuarioPost**, contendo campos como nome, email, senha, etc.

            + Regras de Negócio:
                - Validação de campos obrigatórios (nome e email).  
                - Verificação de unicidade para campos únicos (email, código interno).  
                - Definição de status inicial (ex.: ativo ou pendente) de acordo com o fluxo de cadastro.  
                - Em caso de duplicidade ou erro de validação, retorna erro apropriado.

            + Resultado Esperado:
                - HTTP 201 Created com corpo conforme **UsuarioDetalhes**, contendo todos os dados do usuário criado.            
        `,
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            "$ref": "#/components/schemas/signupPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/signupPostDestalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },

    "/logout": {
        post: {
            tags: ["Auth"],
            summary: "Encerra sessão e invalida access token",
            description: `
            + Caso de uso: Logout de usuário e revogação de token de acesso.
            
            + Função de Negócio:
                - Permitir ao usuário encerrar a sessão corrente e impedir o uso futuro do mesmo token.

            + Recebe pelo header \`Authorization
                - Bearer <token>\` o accessToken a ser revogado.
            
            + Fluxo:
                - Valida accestoken e revogando ao excluir da base de dados, impedindo usos futuros.
                - Invalida sessão corrente.
                - Endpoint idempotente: se já revogado, continua retornando 200 OK.
            
            + Resultado Esperado:
                - 200 OK sem conteúdo em caso de sucesso: Sessão encerrada.
      `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                access_token: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
                                },
                            },
                            required: ["access_token"]
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200](),    // Logout bem-sucedido
                400: commonResponses[400](),    // Token ausente ou formato inválido
                401: commonResponses[401](),    // Token inválido ou já expirado
                498: commonResponses[498](),    // Token expirado
                500: commonResponses[500]()     // Erro interno
            }
        }
    },

    /**
     *  active: { type: "boolean", description: "Indica se o token ainda é válido (não expirado)", example: true, },
      client_id: { type: "string", description: "ID do cliente OAuth", example: "1234567890abcdef", },
      token_type: { type: "string", description: "Tipo de token, conforme RFC 6749", example: "Bearer", },
      exp: { type: "integer", description: "Timestamp UNIX de expiração do token", example: 1672531199, },
      iat: { type: "integer", description: "Timestamp UNIX de emissão do token", example: 1672527600, },
      nbf: { type: "integer", description: "Timestamp UNIX de início de validade do token", example: 1672527600, },
     */

    "/refresh": {
        post: {
            tags: ["Auth"],
            summary: "Renova access token a partir de refresh token",
            description: `
            + Caso de uso: Renovação de accessToken via refreshToken.
            
            + Função de Negócio:
                - Permitir ao usuário continuar logado sem necessidade de nova autenticação completa.

            + Recebe **refreshToken** válido no header \`Authorization: Bearer <token>\` ou no corpo da requisição.
                1. Valida se o token não está expirado nem consta na blacklist.
                2. Gera um **accessToken** (expiração: 15 minutos).
                3. Opcionalmente, gera um **refreshToken** novo (rotacionamento) e revoga o refreshToken antigo.
            
            + Regras de Negócio Adicionais:
                - Máximo de 5 renovações consecutivas antes de exigir re-login.
                - Falha na validação retorna 401 Unauthorized ou 498 Token Expired.
                - Log de rotação deve registrar o ID do refreshToken utilizado.
            
            + Resultado Esperado:
                - **accessToken** (string): novo JWT de acesso, válido por 15 minutos.  
                - **refreshToken** (string, opcional): novo refreshToken, válido por 7 dias, se rotacionado.  
                - **user** (object): dados do usuário autenticado (ex.: id, nome, email).
      `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                refresh_token: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
                                },
                            },
                            required: ["refresh_token"]
                        }
                    }
                }

            },
            responses: {
                200: commonResponses[200]("#/components/schemas/UsuarioRespostaLogin"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
};

export default authRoutes;
