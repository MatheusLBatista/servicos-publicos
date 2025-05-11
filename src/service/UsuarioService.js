// /src/services/UsuarioService.js
// import bcrypt from 'bcrypt';
// import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
// import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
// import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import UsuarioRepository from '../repository/UsuarioRepository.js';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
    }

    async listar(req) {
        console.log("Estou no UsuarioService");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em UsuarioService para o controller');
        return data;
    }
}

export default UsuarioService;