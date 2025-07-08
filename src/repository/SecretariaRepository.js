import Secretaria from '../models/Secretaria.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import SecretariaFilterBuilder from './filters/SecretariaFilterBuild.js';

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

    async buscarPorTipo(tipo) {
        const secretaria = await this.modelSecretaria.findOne({tipo})

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
        const filtro = { nome };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; 
        }
        const documento = await this.modelSecretaria.findOne(filtro);

        return documento;
    }

    async listar(req) {
    console.log('Listando em SecretariaRepository');
    const { id } = req.params || null;

    if (id) {
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

        return typeof data.toObject === 'function' ? data.toObject() : data;
    }

    const { nome, page = 1 } = req.query;
    const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

    const filterBuild = new SecretariaFilterBuilder()
        .comNome(nome || '');

    if (typeof filterBuild.build !== 'function') {
        throw new CustomError({
            statusCode: 500,
            errorType: 'internalServerError',
            field: 'Secretaria',
            details: [],
            customMessage: messages.error.internalServerError("Secretaria")
        });
    }

    const filtros = filterBuild.build();

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limite, 10),
        sort: { nome: 1 },
    };

    const resultado = await this.modelSecretaria.paginate(filtros, options);

    resultado.docs = resultado.docs.map(doc => {
        const usuarioObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
        return usuarioObj;
    });

    if (resultado.docs.length === 0) {
        throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Secretaria',
            details: [],
            customMessage: messages.error.resourceNotFound('Secretaria')
        });
    }

    return resultado;
}

    async criar(dadosSecretaria){
        const secretaria = new this.modelSecretaria(dadosSecretaria);
        return await secretaria.save()
    }

    async atualizar(id, parsedData) {
            const secretaria = await this.modelSecretaria.findByIdAndUpdate(id, parsedData, { new: true });
    
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
         
    async deletar(id){
        const secretaria = await this.modelSecretaria.findByIdAndDelete(id);
        return secretaria;
    }
}

export default SecretariaRepository;