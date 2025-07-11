// /src/services/UsuarioService.js
// import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UsuarioRepository from '../repository/UsuarioRepository.js';
import { parse } from 'dotenv';

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
    }

    async listar(req) {
        console.log("Estou no UsuarioService");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em UsuarioService para o controller');
        return data;
    }

    async criar(parsedData, req) {
        console.log("Estou em criar no UsuarioService");
        
        if (req.user_id && !req.user_id.administrador) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Você não tem permissões para criar um usuário."
            });
        }

        //valida email único
        await this.validateEmail(parsedData.email);

        //gerar senha hash
        if(parsedData.senha) {
            const { senha: senhaValidada } = await AuthHelper.hashPassword(parsedData.senha);
            parsedData.senha = senhaValidada;
        }

        //chama o repositório
        const data = await this.repository.criar(parsedData);
        return data;
    }

    async atualizar(id, parsedData) {
        console.log('Estou no atualizar em UsuarioService');

        // nunca trocar senha ou email
        delete parsedData.email;
        delete parsedData.senha;

        // Garante que o usuário existe
        await this.ensureUserExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id, req) {
        console.log('Estou no atualizar em UsuarioService');

        const usuario = await this.repository.buscarPorID(req.user_id);
        const nivel = usuario.nivel_acesso || {};
        const usuarioID = usuario._id;

        await this.ensureUserExists(id);

        if (nivel.municipe) {
            if (usuarioID.toString() !== id.toString()) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.FORBIDDEN.code,
                    errorType: 'permissionError',
                    field: 'Usuário',
                    details: [],
                    customMessage: "Munícipes só podem deletar seus próprios dados."
                });
            }
        }

        const data = await this.repository.deletar(id)
        return data;
    }

    //metodos auxiliares
    async validateEmail(email, id=null) {
        const usuarioExistente = await this.repository.buscarPorEmail(email, id);
        if (usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{ path: 'email', message: 'Email já está em uso.' }],
                customMessage: 'Email já cadastrado.',
            });
        }
    }

    async ensureUserExists(id){
        const usuarioExistente = await this.repository.buscarPorID(id);

        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado.'
            });
        }

        return usuarioExistente;
    }
    
}

export default UsuarioService;