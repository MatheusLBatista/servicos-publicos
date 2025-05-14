import mongoose from "mongoose";
import DemandaRepository from "../repository/DemandaRepository.js";
import { parse } from 'dotenv';

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
}

export default DemandaService;