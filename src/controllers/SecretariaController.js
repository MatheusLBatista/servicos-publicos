//recebe a requisicao de fato e da a resposta
// import { SecretariaSchema, SecretariaUpdateSchema } from '../utils/validators/schemas/zod/SecretariaSchema.js';
import SecretariaService from "../service/SecretariaService.js";
import { SecretariaSchema } from '../utils/validators/schemas/zod/SecretariaSchema.js';
import mongoose from 'mongoose';
import { SecretariaQuerySchema, SecretariaIDSchema } from '../utils/validators/schemas/zod/querys/SecretariaQuerySchema.js';
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';

// Importações necessárias para o upload de arquivos
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));


class SecretariaController {
    constructor() {
        this.service = new SecretariaService();
    }
    
    async listar(req, res){
        console.log('Estou no listar em SecretariaController');

        const { id } = req.params || {}
        if(id) {
            SecretariaIDSchema.parse(id);
        }

        //Validação das queries (se existirem)
        // const query = req.query || {};
        // if (Object.keys(query).length !== 0) {
        //     // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
        //     await SecretariaQuerySchema.parseAsync(query);
        // }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
            console.log('Estou no criar em SecretariaController');
    
            // Cria o DTO de criação e valida os dados - criar ajustes na biblioteca zod
            //const parsedData = UsuarioSchema.parse(req.body);
            let data = await this.service.criar(req.body);
    
            let secretaria = data.toObject();
    
            delete secretaria.senha;
    
            return CommonResponse.created(res, secretaria);
        }

}

export default SecretariaController;