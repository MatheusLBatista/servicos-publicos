import Demanda from "../models/Demanda.js";
import Usuario from "../models/Usuario.js";
import mongoose from "mongoose";
import DemandaFilterBuild from './filters/DemandaFilterBuild.js'
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { populate } from "dotenv";

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
            const data = await this.modelDemanda.findById(id)
                .populate('usuarios');

            if(!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Demanda',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Demanda')
                });
            }

            //length dos arrays
            const totalUsuarios = data.usuarios ? data.usuarios.length : 0;
            const dataWithStats = {
                ...data.toObject(),
                estatisticas: {
                    totalUsuarios
                }
            };

            return dataWithStats;
            // return Demanda.findById(id);
        }

        const { tipo, status, data, resolucao, feedback, avaliacao_resulucao, link_imagem, motivo_devolucao, link_imagem_resolucao, endereco, usuario, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.params.limite, 10) || 10, 100)
        // return Demanda.find()

        const filterBuilder = new DemandaFilterBuild()
            .comTipo()
            .comData()
            .comEndereco()
            .comStatus()

        await filterBuilder.comUsuario(usuario);

        if (typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError('Usuário')
            });
        }

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            populate: { path: 'usuarios' },
            sort: { nome: 1 } 
        }

        const resultado = await this.modelDemanda.paginate(filtros, options);

        resultado.docs = resultado.docs.map(doc => {
            const demandaObj= typeof doc.toObject === 'function' ? doc.toObject() : doc;

            const totalUsuarios = demandaObj.usuarios ? demandaObj.usuarios.length : 0;

            return {
                ...demandaObj,
                estatisticas: {
                    totalUsuarios
                }
            };
        }) 

        return resultado;

    }

    async criar(dadosDemanda){
        const demanda = new this.modelDemanda(dadosDemanda);
        return await demanda.save()
    }

    async atualizar(id, parsedData){

    }

}

export default DemandaRepository;
