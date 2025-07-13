// /src/services/SecretariaService.js
//import bcrypt from 'bcrypt';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
//import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import SecretariaRepository from '../repository/SecretariaRepository.js';
import { parse } from 'dotenv';

class SecretariaService {
    constructor() {
        this.repository = new SecretariaRepository();
    }

    async listar(req) {
        console.log("Estou no SecretariaService");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em SecretariaService para o controller');
        return data;
    }

    async criar(parsedData) {
        console.log("Estou no criar em SecretariaService")

        //validar nome unico 
        await this.validarNome(parsedData.nome);
        //chama o repositório
        const data = await this.repository.criar(parsedData);

        return data;
    }

    async atualizar(id, parsedData) {
        console.log('Estou no atualizar em SecretariaService');

        delete parsedData.email;

        await this.ensureSecretariaExists(id);
        await this.validarNome(parsedData.nome);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }


    async deletar(id) {
        console.log('Estou no deletar em SecretariaService');

        await this.ensureSecretariaExists(id);

        const data = await this.repository.deletar(id)
        return data;
    }

    async ensureSecretariaExists(id){
        const secretariaExistente = await this.repository.buscarPorID(id);
        if (!secretariaExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Secretaria',
                details: [],
                customMessage: messages.error.resourceNotFound('Secretaria'),
            });
        }

        return secretariaExistente;
    }

    async validarNome(nome, id=null) {
        const secretariaExistente = await this.repository.buscarPorNome(nome, id);
        if (secretariaExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [{ path: 'nome', message: 'Nome já está em uso.' }],
                customMessage: 'Nome já cadastrado.',
            });
        }
    }

}

export default SecretariaService;