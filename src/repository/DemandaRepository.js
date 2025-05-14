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
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário')
                });
            }

            return Demanda.findById(id);
        }

        return Demanda.find()
    }

}

export default DemandaRepository;
