// src/repositories/filters/SecretariaFilterBuilder.js

class SecretariaFilterBuilder {
    constructor() {
        this.filtros = {};
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

export default SecretariaFilterBuilder;
