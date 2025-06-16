import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
// import { LoginSchema } from '../utils/validators/schemas/zod/LoginSchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { RequestAuthorizationSchema } from '../utils/validators/schemas/zod/querys/RequestAuthorizationSchema.js';

import AuthService from '../service/AuthService.js';

class AuthController {
    constructor() {
        this.service = new AuthController();
    }

    login = async(req, res) => {
        const body = req.body || {};
        //todo: implement zod verification
        const validatedBody = body;
        const data = await this.service.login(validatedBody);
        return CommonResponse.success(res, data)
    }
}

export default AuthController;