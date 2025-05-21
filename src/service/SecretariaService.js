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

    async criar(parsedData) {
        console.log("Estou no criar em SecretariaService")

        //chama o repositório
        const data = await this.repository.criar(parsedData);

        return data;
    }

    async deletar(id) {
        console.log('Estou no deletar em SecretariaService');

        await this.ensureSecretariaExists(id);

        const data = await this.repository.deletar(id)
        return data;
    }

    async ensureSecretariaExists(id){
        const secretariaExistente = await this.repository.buscarPorID(id);
        if (!secretariaExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Secretaria',
                details: [],
                customMessage: messages.error.resourceNotFound('Secretaria'),
            });
        }

        return secretariaExistente;
    }

}

export default SecretariaService;