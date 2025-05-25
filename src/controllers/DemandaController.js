import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import DemandaService from '../service/DemandaService.js';
import { UsuarioQuerySchema, UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

class DemandaController{
    constructor(){
        this.service = new DemandaService();
    }

    async listar(req,res) {
        console.log('Estou no listar em UsuarioController');

        const { id } = req.params || {};

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

    async criar(req, res){
        console.log('Estou no criar em DemandaController');

        let  data = await this.service.criar(req.body);

        let usuarioLimpo = data.toObject();

        //deletar campos que nao podem ser visualizados

        return CommonResponse.created(res, usuarioLimpo);
    }

}

export default DemandaController;
