import Grupo from '../models/Grupo.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import GrupoFilterBuilder from './filters/GrupoFilterBuild.js';

class GrupoRepository {
    constructor({
        GrupoModel = Grupo
    } = {}) {
        this.modelGrupo = GrupoModel;
    }

    async buscarPorID(id, includeTokens = false) {
        let query = this.modelGrupo.findById(id);

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const grupo = await query;
        
        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceNotFound('Grupo')
            });
        }

        return grupo;
    }

    async buscarPorNome(nome, idIgnorado = null) {
        const filtro = { nome };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado }; 
        }
        const documento = await this.modelGrupo.findOne(filtro);

        return documento;
    }

    async listar(req) {
        const { id } = req.params;

        if(id) {
            const data = await this.modelGrupo.findById(id)

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Grupo',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Grupo')
                });
            }

            return data;
        }

        const { nome, ativo, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100)
        
        const filterBuilder = new GrupoFilterBuilder()
            .comNome(nome || '')
            .comAtivo(ativo)

        if(typeof filterBuilder.build !== 'function') {
            throw new CustomError({
                statusCode: 500,
                errorType: 'internalServerError',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.internalServerError("Usuário")
            });
        }

        const filtros = filterBuilder.build();

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { nome: 1 },
        };

        const resultado = await this.modelGrupo.paginate(filtros, options);

        resultado.docs = resultado.docs.map(doc => {
            const grupoObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
            return grupoObj;
        });
        
        return resultado;
    }

    async criar(dadosGrupo){
        const grupo = new this.modelGrupo(dadosGrupo);
        return await grupo.save()
    }

    async atualizar(id, parsedData) {
            const grupo = await this.modelGrupo.findByIdAndUpdate(id, parsedData, { new: true });
    
            if (!grupo) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Grupo',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Grupo')
                });
            }
    
            return grupo;
        }
         
    async deletar(id){
        const grupo = await this.modelGrupo.findByIdAndDelete(id);

        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: messages.error.resourceNotFound('Grupo')
            });
        }
        return grupo;
    }
}

export default GrupoRepository;