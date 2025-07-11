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

    async buscarPorID(id, includeTokens = false) {
    let query = this.modelDemanda.findById(id)
        .populate({
            path: 'usuarios',
            populate: [
                { path: 'secretarias' },
                { path: 'grupo' }
            ]
        })
        .populate('secretarias');

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const demanda = await query;

        if(!demanda) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        }

        return demanda;
    }

    async listar(req) {
        const { tipo, status, data_inicio, data_fim, endereco, usuario, secretaria, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

        const filterBuilder = new DemandaFilterBuild()
            .comTipo(tipo || '')
            .comData(data_inicio, data_fim || '')
            .comEndereco(endereco || '')
            .comStatus(status || '');

        await filterBuilder.comUsuario(usuario || '');
        await filterBuilder.comSecretaria(secretaria || '');

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page, 10),
            limit: limite,
            populate: [
                { path: 'usuarios', populate: [ { path: 'secretarias' }, { path: 'grupo' }] },
                { path: 'secretarias' }
            ],
            sort: { nome: 1 }
        };

        const resultado = await this.modelDemanda.paginate(filtros, options);

        resultado.docs = resultado.docs.map(doc => {
            const demandaObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
            const totalUsuarios = demandaObj.usuarios?.length || 0;

            return {
                ...demandaObj,
                estatisticas: { totalUsuarios }
            };
        });

        return resultado;
    }

    async criar(dadosDemanda){
        const demanda = new this.modelDemanda(dadosDemanda);
        return await demanda.save()
    }

    async atualizar(id, parsedData){
        const demanda = await this.modelDemanda.findByIdAndUpdate(id, parsedData, { new: true })
            .populate({
                path: 'usuarios',
                populate: [
                    { path: 'secretarias' },
                    { path: 'grupo' }
                ]
            })
            .populate('secretarias');

        if(!demanda) {
            throw new CustomError ({
                statusCode: 404,
                errorType: 'resouceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        };

        return demanda;
    }

    async atribuir(id, parsedData){
        const demanda = await this.modelDemanda.findByIdAndUpdate(id, parsedData, { new: true })
                .populate({
                    path: 'usuarios',
                    populate: [
                        { path: 'secretarias' },
                        { path: 'grupo' }
                    ]
                })
                .populate('secretarias');

        if(!demanda) {
            throw new CustomError ({
                statusCode: 404,
                errorType: 'resouceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        };

        return demanda;
    }

    async devolver(id, parsedData){
        const demanda = await this.modelDemanda.findByIdAndUpdate(id, parsedData, { new: true })
                .populate({
                    path: 'usuarios',
                    populate: [
                        { path: 'secretarias' },
                        { path: 'grupo' }
                    ]
                })
                .populate('secretarias');

        if(!demanda) {
            throw new CustomError ({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        };

        return demanda;
    }

    async resolver(id, parsedData){
        const demanda = await this.modelDemanda.findByIdAndUpdate(id, parsedData, { new: true })
                .populate({
                    path: 'usuarios',
                    populate: [
                        { path: 'secretarias' },
                        { path: 'grupo' }
                    ]
                })
                .populate('secretarias');

        if(!demanda) {
            throw new CustomError ({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        };

        return demanda;
    }

    async deletar(id) {
        const demanda = await this.modelDemanda.findByIdAndDelete(id)
                .populate({
                    path: 'usuarios',
                    populate: [
                        { path: 'secretarias' },
                        { path: 'grupo' }
                    ]
                })
                .populate('secretarias');

        if(!demanda) {
            throw new CustomError ({
                statusCode: 404,
                errorType: 'resouceNotFound',
                field: 'Demanda',
                details: [],
                customMessage: messages.error.resourceNotFound('Demanda')
            })
        }

        return demanda;
    }

}

export default DemandaRepository;
