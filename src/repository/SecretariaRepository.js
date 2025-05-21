import Secretaria from '../models/Secretaria.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class SecretariaRepository {
    constructor({
        SecretariaModel = Secretaria
    } = {}) {
        this.modelSecretaria = SecretariaModel;
    }

    async buscarPorID(id, includeTokens = false) {
        let query = this.modelSecretaria.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const user = await query;
        
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Secretaria',
                details: [],
                customMessage: messages.error.resourceNotFound('Secretaria')
            });
        }

        return user;
    }

    async listar(req) {
        const { id } = req.params;

        if(id) {
            const data = await this.modelSecretaria.findById(id);

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Secretaria',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Secretaria')
                });
            }

            return Secretaria.findById(id);
        }

        return Secretaria.find()
    }

    async criar(dadosSecretaria){
        const secretaria = new this.modelSecretaria(dadosSecretaria);
        return await secretaria.save()
    }
         
    async deletar(id){
        const secretaria = await this.modelSecretaria.findByIdAndDelete(id);
        return secretaria;
    }
}

export default SecretariaRepository;