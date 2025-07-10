import jwt from 'jsonwebtoken';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import tokenUtil from '../utils/TokenUtil.js';
import bcrypt from 'bcrypt'; 
import AuthHelper from '../utils/AuthHelper.js';
import nodemailer from 'nodemailer';
//import fetch from 'node-fetch'; // importacao de biblioteca para utilizar api externa

import UsuarioRepository from "../repository/UsuarioRepository.js";

class AuthService {
    constructor(params = {}) {
        const { tokenUtil: injectedToken } = params;
        this.TokenUtil = injectedToken || tokenUtil;
        this.repository = new UsuarioRepository();
    }

    async carregatokens(id, token) {
        const data = await this.repository.buscarPorID(id, { includeTokens: true })
        return { data };
    }

    async login(body){
        const userEncontrado = await this.repository.buscarPorEmail(body.email);
        if(!userEncontrado) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'notFound',
                field:"Email",
                details:[],
                customMessage: messages.error.unauthorized("Credenciais inválidas") 
            })
        }

        const senhaValida = await bcrypt.compare(body.senha, userEncontrado.senha);
        if(!senhaValida) {
            throw new CustomError({
                statusCode: 401,
                errorType:'notFound',
                field:'Senha',
                details:[],
                customMessage: messages.error.unauthorized('Credenciais inválidas')
            })
        }

        // gerar novo access token com instância injetada
        const accessToken = await this.TokenUtil.generateAccessToken(userEncontrado._id);

        // buscar user com os tokens já armazenados
        const userComToken = await this.repository.buscarPorID(userEncontrado._id, true);
        let refreshtoken = userComToken.refreshtoken;
        console.log("refresh token no banco", refreshtoken);

        if(refreshtoken) {
            try{
                jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH_TOKEN);
            } catch(error) {
                if(error.name === "TokenExpiredError" || error.name === "JsonWebTokenError"){
                    refreshtoken = await this.TokenUtil.generateRefreshToken(userEncontrado._id);
                } else {
                    throw new CustomError({
                        statusCode: 500, 
                        errorType: "ServerError",
                        field: "Token",
                        details: [],
                        customMessage: messages.error.unauthorized('Falha na criação do token')
                    })
                }
            }
        } else {
            refreshtoken = await this.TokenUtil.generateRefreshToken(userEncontrado._id)
        }

        console.log("refresh token gerado", refreshtoken);

        await this.repository.armazenarTokens(userEncontrado._id, accessToken, refreshtoken);

        const userLogado = await this.repository.buscarPorEmail(body.email);
        delete userLogado.senha;

        const userObject = userLogado.toObject();

        return { user: { accessToken, refreshtoken, ...userObject } }

    }

    async logout(id) {
        const data = await this.repository.removerTokens(id);
        return { data };
    }

    async revoke(id) {
        const data = await this.repository.removerTokens(id);
        return { data };
    }

    async refresh(id, token) {
        const userEncontrado = await this.repository.buscarPorID(id, { includeTokens: true });

        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Token',
                details: [],
                customMessage: HttpStatusCodes.NOT_FOUND.message
            });
        }

        if (userEncontrado.refreshtoken !== token) {
            console.log('Token inválido');
            throw new CustomError({
                statusCode: HttpStatusCodes.UNAUTHORIZED.code,
                errorType: 'invalidToken',
                field: 'Token',
                details: [],
                customMessage: messages.error.unauthorized('Token')
            });
        }


        // Gerar novo access token utilizando a instância injetada
        const accesstoken = await this.TokenUtil.generateAccessToken(id);

        /**
         * Se SINGLE_SESSION_REFRESH_TOKEN for true, gera um novo refresh token
         * Senão, mantém o token armazenado
         */
        let refreshtoken = '';
        if (process.env.SINGLE_SESSION_REFRESH_TOKEN === 'true') {
            refreshtoken = await this.TokenUtil.generateRefreshToken(id);
        } else {
            refreshtoken = userEncontrado.refreshtoken;
        }

        // Atualiza o usuário com os novos tokens
        await this.repository.armazenarTokens(id, accesstoken, refreshtoken);

        // monta o objeto de usuário com os tokens para resposta
        const userLogado = await this.repository.buscarPorID(id, { includeTokens: true });
        delete userLogado.senha;
        const userObjeto = userLogado.toObject();

        const userComTokens = {
            accesstoken,
            refreshtoken,
            ...userObjeto
        };

        return { user: userComTokens };
    }

    // RecuperaSenhaService.js
    async recuperaSenha(body) {
        console.log('Estou em RecuperaSenhaService');

        console.log('Dados recebidos para recuperação de senha:', body);
        // ───────────────────────────────────────────────
        // Passo 1 – Buscar usuário pelo e-mail informado
        // ───────────────────────────────────────────────
        const userEncontrado = await this.repository.buscarPorEmail(body.email);

        console.log('Usuário encontrado:', userEncontrado);

        // Se não encontrar, lança erro 404
        if (!userEncontrado) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                field: 'Email',
                details: [],
                customMessage: HttpStatusCodes.NOT_FOUND.message
            });
        }

        // ───────────────────────────────────────────────
        // Passo 2 – Gerar código de verificação (4 carac.)
        // ───────────────────────────────────────────────
        const generateCode = () => Math.random()
            .toString(36)              // ex: “0.f5g9hk3j”
            .replace(/[^a-z0-9]/gi, '') // mantém só letras/números
            .slice(0, 4)               // pega os 4 primeiros
            .toUpperCase();            // converte p/ maiúsculas

        let codigoRecuperaSenha = generateCode();

        // ───────────────────────────────────────────────
        // Passo 3 – Garantir unicidade do código gerado 
        // ───────────────────────────────────────────────
        let codigoExistente =
            await this.repository.buscarPorPorCodigoRecuperacao(codigoRecuperaSenha);
        console.log('Código existente:', codigoExistente);

        console.log(codigoExistente)
        
        while (codigoExistente) {
            console.log('Código já existe, gerando um novo código');
            codigoRecuperaSenha = generateCode();
            codigoExistente =
                await this.repository.buscarPorPorCodigoRecuperacao(codigoRecuperaSenha);
        }
        console.log('Código gerado:', codigoRecuperaSenha);

        // ───────────────────────────────────────────────
        // Passo 4 – Gerar token único (JWT) p/ recuperação
        // ───────────────────────────────────────────────
        console.log('Gerando token único para recuperação de senha');
        const tokenUnico =
            await this.TokenUtil.generatePasswordRecoveryToken(userEncontrado._id);

        // ───────────────────────────────────────────────
        // Passo 5 – Persistir token + código no usuário
        // ───────────────────────────────────────────────
        const expMs = Date.now() + 60 * 60 * 1000; // 1 hora de expiração
        const data = await this.repository.atualizar(userEncontrado._id, {
            tokenUnico,
            codigo_recupera_senha: codigoRecuperaSenha,
            exp_codigo_recupera_senha: new Date(expMs).toISOString() // Armazenar expiração como string ISO TMZ0 Ex.: 2023-10-01T12:00:00.000Z
        });

        if (!data) {
            // Falha ao atualizar → erro 500
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                field: 'Recuperação de Senha',
                details: [],
                customMessage: HttpStatusCodes.INTERNAL_SERVER_ERROR.message
            });
        }

        /**
         * Passo 6 – Enviar e-mail com código + link
         * 
         * Usar CHAVE MAIL_API_KEI no .env para requisitar o envio de e-mail em https://edurondon.tplinkdns.com/mail/emails/send
         * Exemplo de corpo do e-mail:
         * Corpo do e-mail:
         * {
            "to": "falecomgilberto@gmail.com",
            "subject": "Redefinir senha",
            "template": "password-reset",
            "data": {
                "name": "Gilberto",
                "resetUrl": "https://edurondon.tplinkdns.com?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yJpZCI6IjY4NDFmNWVhMmQ5YWYxOWVlN2Y1YmY3OCIsImlhdCI6MTc0OTU2OTI1MiwiZXhwIjoxNzQ5NTcyODUyfQ.D_bW22QyKqZ2YL6lv7kRo-_zY54v3esNHsxK7DKeOq0",
                "expirationMinutes": 30,
                "year": 2025,
                "company": "Exemplo Ltda"
                }
            }
         * 
         */

        const resetUrl = `https://edurondon.tplinkdns.com/auth/?token=${tokenUnico}`;
        console.log('URL de redefinição de senha:', resetUrl);
        const emailData = {
            to: userEncontrado.email,
            subject: 'Redefinir senha',
            template: 'password-reset',
            data: {
                name: userEncontrado.nome,
                resetUrl: resetUrl,
                expirationMinutes: 60, // Expiração em minutos
                year: new Date().getFullYear(),
                company: process.env.COMPANY_NAME || 'Auth'
            }
        };
        console.log('Dados do e-mail:', emailData);


        // Criar função para fazer a chamada para enviar o e-mai
        //Necessário passa apiKey presente em MAIL_API_KEY
        const sendMail = async (emailData) => {
            console.log('Enviando e-mail de recuperação de senha para:', emailData.to);
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: '"Equipe Auth" <no-reply@auth.com>',
                    to: emailData.to,
                    subject: emailData.subject,
                    html: `
                        <p>Olá ${emailData.data.name},</p>
                        <p>Clique no link abaixo para redefinir sua senha:</p>
                        <p>
                        <a href="${emailData.data.resetUrl}" target="_blank">${emailData.data.resetUrl}</a>
                        </p>
                        <p>Este link expira em ${emailData.data.expirationMinutes} minutos.</p>
                        <p>Obrigado,<br>Equipe ${emailData.data.company}</p>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                console.log('E-mail enviado:', info.messageId);
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
                throw new CustomError({
                    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                    field: 'E-mail',
                    details: [],
                    customMessage: 'Erro ao enviar e-mail de recuperação de senha.'
                });
            }
        };


        console.log('Antes de sendMail');
        await sendMail(emailData);
        console.log('Depois de sendMail');;

        console.log('Enviando e-mail de recuperação de senha');

        // ───────────────────────────────────────────────
        // Passo 7 – Retornar resposta ao cliente
        // ───────────────────────────────────────────────
        return {
            message:
                'Solicitação de recuperação de senha recebida. Um e-mail foi enviado com instruções.'
        };
    }

}

export default AuthService;