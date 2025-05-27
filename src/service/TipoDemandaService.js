// /src/services/TipoDemandaService.js
//import bcrypt from 'bcrypt';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
//import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import TipoDemandaRepository from '../repository/TipoDemandaRepository.js';
import { parse } from 'dotenv';

class TipoDemandaService {
    constructor() {
        this.repository = new TipoDemandaRepository();
    }

    async listar(req) {
        console.log("Estou no TipoDemandaService");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em TipoDemandaService para o controller');
        return data;
    }

    async criar(parsedData) {
        console.log("Estou no criar em TipoDemandaService")

        //validar nome unico e tipo
        await this.validarTitulo(parsedData.titulo);
        await this.validarTipo(parsedData.tipo);
        //chama o repositório
        const data = await this.repository.criar(parsedData);

        return data;
    }

    async atualizar(id, parsedData) {
        console.log('Estou no atualizar em TipoDemandaService');

        await this.ensureTipoDemandaExists(id);

        if (parsedData.titulo) {
        await this.validarTitulo(parsedData.titulo, id);
        }
        if (parsedData.tipo) {
            await this.validarTipo(parsedData.tipo);
        }
        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }


    async deletar(id) {
        console.log('Estou no deletar em TipoDemandaService');

        await this.ensureTipoDemandaExists(id);

        const data = await this.repository.deletar(id)
        return data;
    }

    async ensureTipoDemandaExists(id){
        const TipoDemandaExistente = await this.repository.buscarPorID(id);
        if (!TipoDemandaExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'TipoDemanda',
                details: [],
                customMessage: messages.error.resourceNotFound('TipoDemanda'),
            });
        }

        return TipoDemandaExistente;
    }

    async validarTitulo(titulo, id=null) {
        const TipoDemandaExistente = await this.repository.buscarPorTitulo(titulo, id);
        if (TipoDemandaExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'titulo',
                details: [{ path: 'titulo', message: 'Titulo já está em uso.' }],
                customMessage: 'Titulo já cadastrado.',
            });
        }
    }

    async validarTipo(tipo) {
    const tiposPermitidos = [
        'Coleta',
        'Iluminação',
        'Saneamento',
        'Árvores',
        'Animais',
        'Pavimentação'
    ];

    if (!tiposPermitidos.includes(tipo)) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'tipo',
            details: [{ path: 'tipo', message: 'Tipo inválido. Valores permitidos: Coleta, Iluminação, Saneamento, Árvores, Animais, Pavimentação.' }],
            customMessage: 'Tipo de demanda não é válido.',
        });
    }
}

}

export default TipoDemandaService;