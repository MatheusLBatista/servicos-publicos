import TipoDemanda from '../models/TipoDemanda.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import TipoDemandaFilterBuild from './filters/TipoDemandaFilterBuild.js';

class TipoDemandaRepository {
    constructor({
        TipoDemandaModel = TipoDemanda
    } = {}) {
        this.modelTipoDemanda = TipoDemandaModel;
    }

    async buscarPorID(id, includeTokens = false) {
        let query = this.modelTipoDemanda.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const TipoDemanda = await query;
        
        if (!TipoDemanda) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'TipoDemanda',
                details: [],
                customMessage: messages.error.resourceNotFound('TipoDemanda')
            });
        }

        return TipoDemanda;
    }


    async buscarPorTitulo(titulo, idIgnorado = null) {
        const filtro = { titulo };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; 
        }
        const documento = await this.modelTipoDemanda.findOne(filtro);

        return documento;
    }

    async buscarPorTipo(tipo, idIgnorado = null) {
        const filtro = { tipo };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; 
        }
        const documento = await this.modelTipoDemanda.findOne(filtro);

        return documento;
    }

    async listar(req) {
    console.log('Listando em TipoDemandaRepository');
    const { id } = req.params || null;

    if (id) {
        console.log('Buscando TipoDemanda por ID:', id);
        const data = await this.modelTipoDemanda.findById(id);

        if (!data) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'TipoDemanda',
                details: [],
                customMessage: messages.error.resourceNotFound('TipoDemanda')
            });
        }

        return typeof data.toObject === 'function' ? data.toObject() : data;
    }

    const { titulo,tipo, page = 1 } = req.query;
    const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

    const filterBuild = new TipoDemandaFilterBuild()
        .comTitulo(titulo || '')
        .comTipo(tipo || '');

    if (typeof filterBuild.build !== 'function') {
        throw new CustomError({
            statusCode: 500,
            errorType: 'internalServerError',
            field: 'TipoDemanda',
            details: [],
            customMessage: messages.error.internalServerError("TipoDemanda")
        });
    }

    const filtros = filterBuild.build();

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limite, 10),
        sort: { titulo: 1 },
    };

    const resultado = await this.modelTipoDemanda.paginate(filtros, options);

    resultado.docs = resultado.docs.map(doc => {
        const usuarioObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
        return usuarioObj;
    });

    if (resultado.docs.length === 0) {
        throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'TipoDemanda',
            details: [],
            customMessage: messages.error.resourceNotFound('TipoDemanda')
        });
    }

    return resultado;
}

    async criar(dadosTipoDemanda){
        const TipoDemanda = new this.modelTipoDemanda(dadosTipoDemanda);
        return await TipoDemanda.save()
    }

    async atualizar(id, parsedData) {
            const TipoDemanda = await this.modelTipoDemanda.findByIdAndUpdate(id, parsedData, { new: true });
    
            if (!TipoDemanda) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'TipoDemanda',
                    details: [],
                    customMessage: messages.error.resourceNotFound('TipoDemanda')
                });
            }
    
            return TipoDemanda;
        }
         
    async deletar(id){
        const TipoDemanda = await this.modelTipoDemanda.findByIdAndDelete(id);
        return TipoDemanda;
    }
}

export default TipoDemandaRepository;