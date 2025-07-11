import Usuario from "../../models/Usuario.js";
import Secretaria from "../../models/Secretaria.js";
import mongoose from "mongoose";

import UsuarioRepository from "../UsuarioRepository.js";
import SecretariaRepository from "../SecretariaRepository.js";

class UsuarioFilterBuild {
  constructor() {
    this.filtros = {};
    this.usuarioRepository = new UsuarioRepository();
    this.secretariaRepository = new SecretariaRepository();
    this.usuarioModel = new Usuario();
    this.secretariaModel = new Secretaria();
  }

  comNome(nome) {
    if (nome) {
      this.filtros.nome = { $regex: nome, $options: "i" };
    }
    return this;
  }

  comEmail(email) {
    if (email) {
      this.filtros.email = { $regex: email, $options: "i" };
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

  comNivelAcesso(nivelAcesso) {
    if (nivelAcesso) {
      const chave = `nivel_acesso.${nivelAcesso}`;
      this.filtros[chave] = true;
    }
    return this;
  }

  comCargo(cargo) {
    if (cargo) {
      this.filtros.cargo = { $regex: cargo, $options: "i" };
    }
    return this;
  }

  comFormacao(formacao) {
    if (formacao) {
      this.filtros.formacao = { $regex: formacao, $options: "i" };
    }
    return this;
  }

  async comSecretaria(secretaria) {
    if (secretaria) {
      if (Array.isArray(secretaria)) {
        this.filtros.secretarias = { $in: secretaria };
      } else {
        const secretariaEncontrado = await this.secretariaRepository.buscarPorNome(secretaria);

        const secretariasIDs = secretariaEncontrado
          ? Array.isArray(secretariaEncontrado)
            ? secretariaEncontrado.map((g) => g._id)
            : [secretariaEncontrado._id]
          : [];

        this.filtros.secretarias = { $in: secretariasIDs };
      }
    }

    return this;
  }

  escapeRegex(texto) {
    return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  build() {
    return this.filtros;
  }
}

export default UsuarioFilterBuild;
