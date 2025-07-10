import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import UsuarioFilterBuild from './filters/UsuarioFilterBuild.js';

class UsuarioRepository {
    constructor({
        usuarioModel = Usuario
    } = {}) {
        this.modelUsuario = usuarioModel;
    }

    async armazenarTokens(id, accesstoken, refreshtoken) {
        const document = await this.modelUsuario.findById(id);
        if(!document) {
            throw new CustomError({
                statusCode: 401,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            })
        }
        document.accesstoken = accesstoken;
        document.refreshtoken = refreshtoken;
        const data = document.save();
        return data;
    }

    async removerTokens(id) {
        const parsedData = {
            refreshtoken: null,
            accesstoken: null
        };

        const usuario = await this.modelUsuario.findByIdAndUpdate(id, parsedData, { new: true }).exec();

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            });
        }

        return usuario;
    }

    async buscarPorID(id, includeTokens = false) {
        let query = this.modelUsuario.findById(id)
            .populate('secretarias')
            .populate('grupo');

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const user = await query;
        
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async buscarPorIDs(ids) {
        return await this.modelUsuario.find({ _id: { $in: ids } })
            .populate('secretarias')
            .populate('grupo')
    }

    async buscarPorNome(nome, idIgnorado = null) {
        const filtro = {
            nome: { $regex: nome, $options: 'i' }
        };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }

        const documentos = await this.modelUsuario.findOne(filtro);
        return documentos;
    }

    async buscarPorEmail(email, idIgnorado = null) {
        const filtro = { email };

        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }

        // const documento = await this.modelUsuario.findOne(filtro, '+senha')
        const documento = await this.modelUsuario.findOne(filtro).select('+senha');

        return documento;
    }

    async listar(req) {
        const { id } = req.params;

        if(id) {
            const data = await this.modelUsuario.findById(id)
                .populate('secretarias')
                .populate('grupo')

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuário',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuário')
                });
            }

            return data;
        }

        const { nome, email, nivel_acesso, cargo, formacao, secretaria, ativo, page = 1 } = req.query;
        const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100)
        
        const filterBuilder = new UsuarioFilterBuild()
            .comEmail(email || '')
            .comNome(nome || '')
            .comNivelAcesso(nivel_acesso || '')
            .comCargo(cargo || '')
            .comFormacao(formacao || '')
            .comAtivo(ativo)

            await filterBuilder.comSecretaria(secretaria || '');

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
            populate: [
                { path: 'secretarias' },
                { path: 'grupo' }
            ],
            sort: { nome: 1 },
        };

        const resultado = await this.modelUsuario.paginate(filtros, options);

        resultado.docs = resultado.docs.map(doc => {
            const usuarioObj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
            return usuarioObj;
        });
        
        return resultado;
    }

    async criar(dadosUsuario){
        const usuario = new this.modelUsuario(dadosUsuario);
        return await usuario.save()
    }

    async atualizar(id, parsedData) {
        const usuario = await this.modelUsuario.findByIdAndUpdate(id, parsedData, { new: true })
            .populate('secretarias')
            .populate('grupo')

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return usuario;
    }

    async deletar(id){
        const usuario = await this.modelUsuario.findByIdAndDelete(id)
            .populate('secretarias')
            .populate('grupo')
        return usuario;
    }

    async buscarPorPorCodigoRecuperacao(codigo) {
        console.log('Estou no buscarPorPorCodigoRecuperacao em UsuarioRepository');
        const filtro = { codigo_recupera_senha: codigo };
        const documento = await this.modelUsuario.findOne(filtro, ['+senha', '+codigo_recupera_senha', '+exp_codigo_recupera_senha'])
        return documento;
    }
}

export default UsuarioRepository;