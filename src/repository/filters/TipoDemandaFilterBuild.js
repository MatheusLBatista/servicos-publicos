// src/repositories/filters/TipoDemandaFilterBuild.js
import TipoDemanda from '../../models/TipoDemanda.js'

import TipoDemandaRepository from '../TipoDemandaRepository.js';

class TipoDemandaFilterBuild {
    constructor() {
        this.filtros = {};
        this.TipoDemandaRepository = new TipoDemandaRepository();
        this.TipoDemandaModel =  new TipoDemanda()
    }

    comTitulo(titulo) {
        if (titulo) {
            this.filtros.titulo = { $regex: titulo, $options: 'i' };
        }
        return this;
    }

    comTipo(tipo) {
        if (tipo) {
            this.filtros.tipo = { $regex: tipo, $options: 'i' };
        }
        return this;
    }

    build() {
        return this.filtros;
    }
}

export default TipoDemandaFilterBuild;
