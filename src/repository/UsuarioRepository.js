import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class UsuarioRepository {

    async listar(req) {
        const { id } = req.params;

        if(id) {
            return Usuario.findById(id);
        }

        return Usuario.find()
    }
}

export default UsuarioRepository;