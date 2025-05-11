import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class UsuarioRepository {
    constructor({
        usuarioModel = Usuario
    } = {}) {
        this.modelUsuario = usuarioModel;
    }

    //listar ou listar por ID
    async listar(req) {
        const { id } = req.params;

        if(id) {
            const data = await this.modelUsuario.findById(id);

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário')
                });
            }

            return Usuario.findById(id);
        }

        return Usuario.find()
    }
}

export default UsuarioRepository;