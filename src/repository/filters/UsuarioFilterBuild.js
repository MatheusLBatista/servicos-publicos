import Usuario from "../../models/Usuario.js";

import UsuarioRepository from '../UsuarioRepository.js';

class UsuarioFilterBuild {
    constructor() {
        this.filtros = {};
        this.usuarioRepository = new UsuarioRepository();
        this.usuarioModel = new Usuario()
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

    comNivelAcesso(nivelAcesso) {
        if (nivelAcesso) {
            const chave = `nivel_acesso.${nivelAcesso}`;
            this.filtros[chave] = true;
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