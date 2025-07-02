import mongoose from "mongoose";
import DemandaRepository from "../repository/DemandaRepository.js";
import { parse } from 'dotenv';
import CustomError from "../utils/helpers/CustomError.js";
import UsuarioRepository from "../repository/UsuarioRepository.js";

class DemandaService {
    constructor(){
        this.repository = new DemandaRepository()
        this.userRepository = new UsuarioRepository()
    }

    async listar(req) {
        console.log("Estou em Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario.nivel_acesso || {};

        const data = await this.repository.listar(req);

        if (!nivel.secretario) {
            data.docs = await Promise.all(
                data.docs.map(demanda => this.filtrarDemandaPorUser(demanda, usuario))
            );
        }

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

    async nivelAcesso(nivelAcesso) {
        const permissoes = { 
            //TODO: revisar com cliente
            secretario: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "createdAt", "updatedAt", "estatisticas", "endereco"], 
            administrador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "secretarias", "createdAt", "updatedAt", "estatisticas", "endereco"],
            municipe: ["tipo", "_id", "status", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem_resolucao", "link_imagem", "endereco", "createdAt", "updatedAt", "estatisticas"],
            //removi usuário
            operador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "createdAt", "updatedAt", "estatisticas", "endereco"]
        };

        const niveis = ['administrador', 'secretario', 'operador', 'municipe'];

        const nivelAtivo = niveis.find(nivel => nivelAcesso[nivel]);

        return permissoes[nivelAtivo] || [];
    }

    async filtrarDemandaPorUser(demanda, usuario) {
        const camposPermitidos = await this.nivelAcesso(usuario.nivel_acesso);

        Object.keys(demanda).forEach(campo => {
            if(!camposPermitidos.includes(campo)){
                delete demanda[campo];
            }
        });

        return demanda;
    }
} 

export default DemandaService;