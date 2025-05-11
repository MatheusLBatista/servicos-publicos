//recebe a requisicao de fato e da a resposta
// import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import UsuarioService from "../service/UsuarioService.js";
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


class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }
    
    async listar(req, res){
        console.log('Estou no listar em UsuarioController');

        const { id } = req.params || {}
        if(id) {
            UsuarioIdSchema.parse(id);
        }

        //Validação das queries (se existirem)
        // const query = req.query || {};
        // if (Object.keys(query).length !== 0) {
        //     // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
        //     await UsuarioQuerySchema.parseAsync(query);
        // }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }
}

export default UsuarioController;