import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { LoginSchema } from '../utils/validators/schemas/zod/LoginSchema.js';
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
// import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
// import { RequestAuthorizationSchema } from '../utils/validators/schemas/zod/querys/RequestAuthorizationSchema.js';

import AuthService from '../service/AuthService.js';
import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

class AuthController {
    constructor() {
        this.service = new AuthService();
    }

    login = async(req, res) => {
        const body = req.body || {};
        const validatedBody = LoginSchema.parse(body);
        const data = await this.service.login(validatedBody);
        return CommonResponse.success(res, data)
    }

    logout = async(req, res) => {
        const token = req.body.access_token || req.headers.authorization?.split(' ')[1];

        if(!token || token === 'null' || token === 'undefined'){
            console.log("Token recebido:", token);

            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'invalidLogout',
                field: 'Logout',
                details: [],
                messages: HttpStatusCodes.BAD_REQUEST.message
            })
        }

        //decodifica token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_ACCESS_TOKEN);

        if(!decoded || !decoded.id){
            console.log("Token decodificado inválid:",decoded);

            throw new CustomError({
                statusCode: HttpStatusCodes.INVALID_TOKEN.code,
                errorType: 'notAuthorized',
                field: 'NotAuthorized',
                details: [],
                messages: HttpStatusCodes.INVALID_TOKEN.message
            })
        }

        //valida o id do usuário
        const decodedId = UsuarioIdSchema.parse(decoded.id);

        // encaminha o token para o serviço de logout
        const data = await this.service.logout(decodedId, token);

        return CommonResponse.success(res, null, messages.success.logout);
    }

    revoke = async(req, res) => {
        const id = req.params.id;
        const data = await this.service.revoke(id);

        return CommonResponse.success(res);
    }
}

export default AuthController;