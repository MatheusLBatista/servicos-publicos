import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import DemandaService from '../service/DemandaService.js';
import { DemandaIdSchema, DemandaQuerySchema } from '../utils/validators/schemas/zod/querys/DemandaQuerySchema.js';
import { DemandaSchema, DemandaUpdateSchema } from '../utils/validators/schemas/zod/DemandaSchema.js';

// Importações necessárias para o upload de arquivos
import path from 'path';
import { fileURLToPath } from 'url';
// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

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

        const data = await this.service.atualizar(id, parsedData, req)

        let demandaLimpa = data.toObject();

        delete demandaLimpa.tipo;
        delete demandaLimpa.data;
        
        return CommonResponse.success(res, demandaLimpa, 200, "Demanda atualizada com sucesso!")
    }

    async atribuir(req, res) {
        console.log('Estou no atribuir em DemandaController');

        const { id } = req.params;
        DemandaIdSchema.parse(id)

        const parsedData = DemandaUpdateSchema.parse(req.body);

        const data = await this.service.atribuir(id, parsedData, req)

        let demandaLimpa = data.toObject();
        
        return CommonResponse.success(res, demandaLimpa, 200, "Demanda atribuída com sucesso!")
    }

    async devolver(req, res) {
        console.log('Estou no devolver em DemandaController');

        const { id } = req.params;
        DemandaIdSchema.parse(id)

        const parsedData = DemandaUpdateSchema.parse(req.body);

        const data = await this.service.devolver(id, parsedData, req)

        let demandaLimpa = data.toObject();
        
        return CommonResponse.success(res, demandaLimpa, 200, "Demanda devolvida com sucesso!")
    }

    async resolver(req, res) {
        console.log('Estou no resolver em DemandaController');

        const { id } = req.params;
        DemandaIdSchema.parse(id)

        const parsedData = DemandaUpdateSchema.parse(req.body);

        const data = await this.service.resolver(id, parsedData, req)

        let demandaLimpa = data.toObject();
        
        return CommonResponse.success(res, demandaLimpa, 200, "Demanda resolvida com sucesso!")
    }

    async deletar(req, res) {
        console.log('Estou no deletar em DemandaController');

        const id = req?.params?.id;
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

        const data = await this.service.deletar(id, req);
        return CommonResponse.success(res, data, 200, "Demanda excluída com sucesso!")
    }

    /**
     * Faz upload de uma foto para um usuário.
     */
    ///*
    async fotoUpload(req, res, next) {
        try {
            const { id, tipo } = req.params;
            DemandaIdSchema.parse(id);

            const file = req.files?.file;
            if (!file) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'file',
                    customMessage: 'Nenhum arquivo foi enviado.'
                });
            }

            const { fileName, metadata } = await this.service.processarFoto(id, file, tipo, req);

            return CommonResponse.success(res, {
                message: 'Arquivo enviado e salvo com sucesso.',
                dados: { [`link_imagem${tipo === "resolucao" ? "_resolucao" : ""}`]: fileName },
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
            const { id, tipo } = req.params;
            DemandaIdSchema.parse(id);

            const demanda = await this.service.listar({ params: { id }, user_id: req.user_id });
            const campo = tipo === "resolucao" ? "link_imagem_resolucao" : "link_imagem";
            const fileName = demanda[campo];

            if (!fileName) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'notFound',
                    field: campo,
                    customMessage: `Imagem de ${tipo} não encontrada.`
                });
            }

            const filePath = path.join(getDirname(), '..', '..', 'uploads', fileName);
            const extensao = path.extname(fileName).slice(1).toLowerCase();
            const mimeTypes = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                svg: 'image/svg+xml'
            };

            res.setHeader('Content-Type', mimeTypes[extensao] || 'application/octet-stream');
            return res.sendFile(filePath);
        } catch (error) {
            console.error('Erro no getFoto:', error);
            return next(error);
        }
    }

}

export default DemandaController;
