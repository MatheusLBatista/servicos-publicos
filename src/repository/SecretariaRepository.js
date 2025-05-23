import Secretaria from '../models/Secretaria.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import SecretariaFilterBuilder from './filters/SecretariaFilterBuilder.js';

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

        const secretaria = await query;
        
        if (!secretaria) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Secretaria',
                details: [],
                customMessage: messages.error.resourceNotFound('Secretaria')
            });
        }

        return secretaria;
    }


    async buscarPorNome(nome, idIgnorado = null) {
        // Criar o filtro base
        const filtro = { nome };

        // Adicionar a condição para excluir o ID, se fornecido
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; // Adiciona a condição _id != idIgnorado
        }

        // Consultar o documento no banco de dados
        const documento = await this.model.findOne(filtro);

        // Retornar o documento encontrado
        return documento;
    }



    async listar(req) {
        console.log('Listando em SecretariaRepository');
        const { id } = req.params || null;

        if(id) {
            console.log('Buscando secretaria por ID:', id);
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