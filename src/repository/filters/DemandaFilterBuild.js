import Demanda from '../../models/Demanda.js';
import Usuario from '../../models/Usuario.js';

import DemandaRepository from '../DemandaRepository.js';
import UsuarioRepository from '../UsuarioRepository.js'

class DemandaFilterBuild {
    constructor() {
        this.filtros = {};
        this.demandaRepository = new DemandaRepository();
        this.usuarioRepository = new UsuarioRepository();
        this.demandaModel = new Demanda();
        this.usuarioModel = new Usuario();
    }

    comTipo(tipo) {
        if(tipo) {
            this.filtros.tipo = { $regex: tipo, $options: 'i' }
        }

        return this;
    }

    comStatus(status) {
        if(status) {
            this.filtros.status = { $regex: status, $options: 'i' }
        }

        return this;
    }

    comData(inicio, fim) {
        if(inicio || fim) {
            this.filtros.criadoEm = {}

            if(inicio) {
                const dataInicio = new Date(inicio);
                dataInicio.setHours(0, 0, 0, 0)
                this.filtros.criadoEm.$gte = dataInicio; 
            }

            if(fim) {
                const dataFim = new Date(fim);
                dataFim.setHours(24, 59, 59, 999)
                this.filtros.criadoEm.$lte = dataFim;
            }
        }

        return this;
    }

    comEndereco(endereco) {
        if(endereco) {
            this.filtros.endereco = {
                $or: [
                    { 'endereco.logradouro': {$regex: endereco, $options: 'i'} },
                    { 'endereco.cep': {$regex: endereco, $options: 'i'} },
                    { 'endereco.bairro': {$regex: endereco, $options: 'i'} },
                    { 'endereco.numero': {$regex: endereco, $options: 'i'} },
                    { 'endereco.complemento': {$regex: endereco, $options: 'i'} }             
                ]
            }
        }

        return this;
    }

    async comUsuario(usuario) {
        if(usuario){
            const usuarioEncontrado = await this.usuarioRepository.buscarPorNome(usuario);

            const usuariosIDs = usuarioEncontrado 
                ? Array.isArray(usuarioEncontrado)
                    ? usuarioEncontrado.map(g => g._id)
                    : [ usuarioEncontrado._id ]
                : [];
            
            this.filtros.usuarios = { $in: usuariosIDs };
        }

        return this
    }

    build(){
        return this.filtros;
    }

}

export default DemandaFilterBuild;