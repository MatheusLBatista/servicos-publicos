import Demanda from "../models/Demanda.js";
import Usuario from "../models/Usuario.js";
import mongoose from "mongoose";
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class DemandaRepository {
    constructor({
        demandaModel = Demanda,
        usuarioModel = Usuario
    } = {}) {
        this.modelDemanda = demandaModel;
        this.modelUsuario = usuarioModel;
    }

    async listar(req) {
        const { id } = req.params;

        if(id) {
            const data = await this.modelDemanda.findById(id);

            if(!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Demanda',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Demanda')
                });
            }

            return Demanda.findById(id);
        }

        return Demanda.find()
    }

    async criar(dadosDemanda){
        const demanda = new this.modelDemanda(dadosDemanda);
        return await demanda.save()
    }

    async atualizar(id, parsedData){

    }

}

export default DemandaRepository;
