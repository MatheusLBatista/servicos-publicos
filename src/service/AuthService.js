import jwt from 'jsonwebtoken';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import tokenUtil from '../utils/TokenUtil.js';
import bcrypt from 'bcrypt'; 
import AuthHelper from '../utils/AuthHelper.js';
// import fetch from 'node-fetch'; - importacao de biblioteca para utilizar api externa

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
}

export default AuthService;