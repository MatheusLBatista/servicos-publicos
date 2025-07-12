//recebe a requisicao de fato e da a resposta
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import UsuarioService from "../service/UsuarioService.js";
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import mongoose from 'mongoose';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';
import TokenUtil from '../utils/TokenUtil.js';

// Importações necessárias para o upload de arquivos
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));


class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
        this.TokenUtil = TokenUtil;
    }
    
    async listar(req, res){
        console.log('Estou no listar em UsuarioController');

        const id = req?.params?.id;
        if(id) {
            UsuarioIdSchema.parse(id);
        }

        //Validação das queries (se existirem)
        const query = req?.query;
        if (Object.keys(query).length !== 0) {
            // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
            await UsuarioQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        console.log('Estou no criar em UsuarioController');

        // valida os dados - criar ajustes na biblioteca zod
        const parsedData = UsuarioSchema.parse(req.body);
        let data = await this.service.criar(parsedData, req);

        let usuarioLimpo = data.toObject();

        delete usuarioLimpo.senha;

        return CommonResponse.created(res, usuarioLimpo);
    }

    /**
     * Cria um novo usuário.
     */
    async criarComSenha(req, res) {
        console.log('Estou no criar em UsuarioController');

        // valida os dados
        const parsedData = UsuarioSchema.parse(req.body);
        
        if (!req.user_id) {
            parsedData.nivel_acesso = {
                municipe: true,
                operador: false,
                secretario: false,
                administrador: false
            };
        }

        let data = await this.service.criarComSenha(parsedData);

        // Converte o documento Mongoose para um objeto simples
        let usuarioLimpo = data.toObject();

        delete usuarioLimpo.senha;

        return CommonResponse.created(res, usuarioLimpo);
    }

    async atualizar(req, res) {
        console.log('Estou no atualizar em UsuarioController');

        const id = req?.params?.id;
        UsuarioIdSchema.parse(id);

        const parsedData = UsuarioUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, parsedData, req);

        let usuarioLimpo = data.toObject();

        delete usuarioLimpo.email;
        delete usuarioLimpo.senha;

        return CommonResponse.success(res, usuarioLimpo, 200, 'Usuário atualizado com sucesso.');
    }

    async deletar(req, res) {
        console.log('Estou no atualizar em UsuarioController');

        const id = req?.params?.id;
        UsuarioIdSchema.parse(id);

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório para deletar.'
            });
        }

        const data = await this.service.deletar(id, req);
        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }
        /**
     * Faz upload de uma foto para um usuário.
     */
    ///*
    async fotoUpload(req, res, next) {
        try {
            console.log('Estou no fotoUpload em UsuarioController');

            const { id } = req.params;
            UsuarioIdSchema.parse(id);

            const file = req.files?.file;
            console.log('req.files:', req.files);
            if (!file) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'file',
                    details: [],
                    customMessage: 'Nenhum arquivo foi enviado.'
                });
            }

            // delega toda a lógica de validação e processamento ao service
            const { fileName, metadata } = await this.service.processarFoto(id, file, req);

            return CommonResponse.success(res, {
                message: 'Arquivo recebido e usuário atualizado com sucesso.',
                dados: { link_imagem: fileName },
                metadados: metadata
            });
        } catch (error) {
            console.error('Erro no fotoUpload:', error);
            return next(error);
        }
    }

    /**
     * Faz download da foto de um usuário.
     */
    async getFoto(req, res, next) {
        try {
            console.log('Estou no getFoto em UsuarioController');

            const id = req?.params?.id;
            UsuarioIdSchema.parse(id);

            const usuario = await this.service.listar(req);
            const { link_imagem } = usuario;

            if (!link_imagem) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'notFound',
                    field: 'link_imagem',
                    details: [],
                    customMessage: 'Foto do usuário não encontrada.'
                });
            }

            const filename = link_imagem;
            const uploadsDir = path.join(getDirname(), '..', '../uploads');
            const filePath = path.join(uploadsDir, filename);

            const extensao = path.extname(filename).slice(1).toLowerCase();
            const mimeTypes = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                svg: 'image/svg+xml'
            };
            const contentType = mimeTypes[extensao] || 'application/octet-stream';

            res.setHeader('Content-Type', contentType);
            return res.sendFile(filePath);
        } catch (error) {
            console.error('Erro no getFoto:', error);
            return next(error);
        }
    }

}

export default UsuarioController;