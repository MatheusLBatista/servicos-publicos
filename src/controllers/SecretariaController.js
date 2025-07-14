//recebe a requisicao de fato e da a resposta
import SecretariaService from "../service/SecretariaService.js";
import { SecretariaUpdateSchema, SecretariaSchema } from '../utils/validators/schemas/zod/SecretariaSchema.js';
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
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
        // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
            await SecretariaQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res) {
        console.log('Estou no criar em SecretariaController');
    
        const parsedData = SecretariaSchema.parse(req.body);
        let data = await this.service.criar(parsedData);
    
        let secretariaLimpo = data.toObject();
    
        return CommonResponse.created(res, secretariaLimpo);
    }

    async atualizar(req, res) {
        console.log('Estou no atualizar em SecretariaController');

        const { id } = req.params;
        SecretariaIDSchema.parse(id);

        const parsedData = SecretariaUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, parsedData);

        //let secretariaLimpo = data.toObject();

        return CommonResponse.success(res, data, 200, 'Secretaria atualizada com sucesso.');
    }


    async deletar(req, res) {
        console.log('Estou no deletar em SecretariaController');
    
        const { id } = req.params || {};
        SecretariaIDSchema.parse(id);
    
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da secretaria é obrigatório para deletar.'
            });
        }
    
        const data = await this.service.deletar(id);
        return CommonResponse.success(res, data, 200, 'Secretaria excluída com sucesso.');
    }

}

export default SecretariaController;