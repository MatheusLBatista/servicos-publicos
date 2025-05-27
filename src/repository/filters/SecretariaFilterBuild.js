// src/repositories/filters/SecretariaFilterBuild.js
import Secretaria from '../../models/Secretaria.js'

import SecretariaRepository from '../SecretariaRepository.js';

class SecretariaFilterBuild {
    constructor() {
        this.filtros = {};
        this.secretariaRepository = new SecretariaRepository();
        this.secretariaModel =  new Secretaria()
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comSigla(sigla) {
        if (sigla) {
            this.filtros.sigla = { $regex: sigla, $options: 'i' };
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default SecretariaFilterBuild;
