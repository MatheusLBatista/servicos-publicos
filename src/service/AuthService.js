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
}

export default AuthService;