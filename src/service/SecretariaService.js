// /src/services/SecretariaService.js
// import bcrypt from 'bcrypt';
// import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
// import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
// import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import SecretariaRepository from '../repository/SecretariaRepository.js';
import { parse } from 'dotenv';

class SecretariaService {
    constructor() {
        this.repository = new SecretariaRepository();
    }

    async listar(req) {
        console.log("Estou no SecretariaService");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em SecretariaService para o controller');
        return data;
    }
}

export default SecretariaService;