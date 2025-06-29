import mongoose from "mongoose";
import DemandaRepository from "../repository/DemandaRepository.js";
import { parse } from 'dotenv';
import CustomError from "../utils/helpers/CustomError.js";

class DemandaService {
    constructor(){
        this.repository = new DemandaRepository()
    }

    async listar(req) {
        console.log("Estou em Demanda Service");
        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em DemandaService para o controller');
        return data;
    }

    async criar(parsedData) {
        console.log("Estou em Demanda Service");

        const data = await this.repository.criar(parsedData);
        
        return data;
    }

    async atualizar(id, parsedData){
        console.log("Estou em atualizar de Demanda Service");

        delete parsedData.tipo;
        delete parsedData.data;

        //garantir id
        await this.ensureDemandaExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id) {
        console.log("Estou em deletar de Demanda Service");

        await this.ensureDemandaExists(id);

        const data = await this.repository.deletar(id);
        return data;
    }

    async ensureDemandaExists(id) {
        const demandaExistente = await this.repository.buscarPorID(id);

        return demandaExistente;
    }

    async filtrarDemandaPorUser(demanda, user) {
        if(user.nivel_acesso?.administrador) {
            return {
                tipo: demanda.tipo
            }
        }

        return demanda;
    }
} 

export default DemandaService;