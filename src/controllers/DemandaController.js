import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import DemandaService from '../service/DemandaService.js';
import { DemandaIdSchema, DemandaQuerySchema } from '../utils/validators/schemas/zod/querys/DemandaQuerySchema.js';
import { DemandaSchema, DemandaUpdateSchema } from '../utils/validators/schemas/zod/DemandaSchema.js';

class DemandaController{
    constructor(){
        this.service = new DemandaService();
    }

    async listar(req,res) {
        console.log('Estou no listar em Demanda');

        const { id } = req.params || {};

        if(id) {
            DemandaIdSchema.parse(id);
        }

        //Validação das queries (se existirem)
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            // deve apenas validar o objeto query, tendo erro o zod será responsável por lançar o erro
            await DemandaQuerySchema.parseAsync(query);
        }

        const data = await this.service.listar(req);
        return CommonResponse.success(res, data);
    }

    async criar(req, res){
        console.log('Estou no criar em DemandaController');

        const parsedData = DemandaSchema.parse(req.body)
        let data = await this.service.criar(parsedData, req);

        let demandaLimpa = data.toObject();

        return CommonResponse.created(res, demandaLimpa);
    }

    async atualizar(req, res) {
        console.log('Estou no atualizar em DemandaController');

        const { id } = req.params;
        DemandaIdSchema.parse(id)

        const parsedData = DemandaUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, parsedData)

        let demandaLimpa = data.toObject();

        delete demandaLimpa.tipo;
        delete demandaLimpa.data;
        
        return CommonResponse.success(res, demandaLimpa, 200, "Demanda atualizada com sucesso!")
    }

    async deletar(req, res) {
        console.log('Estou no deletar em DemandaController');

        const { id } = req.params || {};
        DemandaIdSchema.parse(id)

        if(!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da demanda é obrigatório para deletar.'
            });
        }

        const data = await this.service.deletar(id);
        return CommonResponse.success(res, data, 200, "Demanda excluída com sucesso!")
    }
}

export default DemandaController;
