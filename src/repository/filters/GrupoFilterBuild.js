// src/repositories/filters/GrupoFilterBuild.js
import Grupo from '../../models/Grupo.js'

import GrupoRepository from '../GrupoRepository.js';

class GrupoFilterBuild {
    constructor() {
        this.filtros = {};
        this.grupoRepository = new GrupoRepository();
        this.grupoModel =  new Grupo()
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comAtivo(ativo) {
        if (ativo !== undefined) {
        const valor =
            ativo === true || ativo === "true" || ativo === 1 || ativo === "1";
        this.filtros.ativo = valor;
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default GrupoFilterBuild;
