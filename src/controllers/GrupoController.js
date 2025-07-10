import GrupoService from "../service/GrupoService.js";
import { GrupoUpdateSchema, GrupoSchema } from "../utils/validators/schemas/zod/GrupoSchema.js";
import mongoose from 'mongoose';
import { GrupoIDSchema, GrupoQuerySchema } from "../utils/validators/schemas/zod/querys/GrupoQuerySchema.js";
import {
    CommonResponse,
    CustomError,
    HttpStatusCodes,
    errorHandler,
    messages,
    StatusService,
    asyncWrapper
} from '../utils/helpers/index.js';


class GrupoController {
    constructor() {
        this.service = new GrupoService();
    }
    async listar(req, res){
        console.log('Estou no listar em GrupoController');

        const { id } = req.params || {}
        if(id) {
            GrupoIDSchema.parse(id);
        }

        //Validação das queries (se existirem)
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
        // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
            await GrupoQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        console.log('Estou no criar em GrupoController');
    
        const parsedData = GrupoSchema.parse(req.body);
        let data = await this.service.criar(parsedData);
    
        let grupoLimpo = data.toObject();
    
        return CommonResponse.created(res, grupoLimpo);
    }

    async atualizar(req, res) {
        console.log('Estou no atualizar em GrupoController');

        const { id } = req.params;
        GrupoIDSchema.parse(id);

        const parsedData = GrupoUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, parsedData);

        return CommonResponse.success(res, data, 200, 'Grupo atualizado com sucesso.');
    }


    async deletar(req, res) {
        console.log('Estou no deletar em GrupoController');
    
        const { id } = req.params || {};
        GrupoIDSchema.parse(id);
    
        const data = await this.service.deletar(id);
        return CommonResponse.success(res, data, 200, 'Grupo excluído com sucesso.');
    }

}

export default GrupoController;