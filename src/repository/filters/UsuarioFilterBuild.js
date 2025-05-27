import Usuario from "../../models/Usuario.js";

import UsuarioRepository from '../UsuarioRepository.js';

class UsuarioFilterBuild {
    constructor() {
        this.filtros = {};
        this.usuarioRepository = new UsuarioRepository();
        this.usuarioModel = new Usuario();
    }

    comNome(nome) {
        if (nome) {
            this.filtros.nome = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comEmail(email){
        if(email){
            this.filtros.email = { $regex: email, $options: 'i' };
        }
        return this;

    }

    //TODO: adicionar ativo
    comAtivo(ativo){
        if(ativo !== undefined){
            const valor = ativo === true || ativo === 'true' || ativo === 1 || ativo === '1'
            ativo === false || ativo === 'false' || ativo === 0 || ativo === '0'

            this.filtros.ativo = valor;
        }
        return this;
    }

    comNivelAcesso(nivelAcesso) {//
        if (nivelAcesso) {
            const chave = `nivel_acesso.${nivelAcesso}`;
            this.filtros[chave] = true;
        }
        return this;
    }

    comCargo(cargo) {//
        if(cargo) {
            this.filtros.cargo = { $regex: cargo, $options: 'i' }
        }
        return this;
    }

    comFormacao(formacao) {//
        if(formacao) {
            this.filtros.formacao = { $regex: formacao, $options: 'i' }
        }
        return this;
    }

    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    }

    build(){
        return this.filtros;
    }
}

export default UsuarioFilterBuild;