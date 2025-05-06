import bcrypt from "bcryptjs";

export function gerarSenhaHash(senhaPura) {
    return bcrypt.hashSync(senhaPura, 8)
}

const senhaPura = "AaBb@123456";
const senhaHash = gerarSenhaHash(senhaPura)

//-------------------------------------------
import "dotenv/config";
import mongoose from "mongoose";

// Se você usa @faker-js/faker:
import { faker } from "@faker-js/faker";
import fakebr from 'faker-br';

// Se quiser faker em pt-BR, pode usar:
// import { faker } from "@faker-js/faker/locale/pt_BR";

// Dependências
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { randomBytes as _randomBytes } from "crypto";

// Conexão com banco
import DbConect from "../config/DbConnect.js";

import Usuario from "../models/usuarios.js";
import getGlobalFakeMapping from "./globalFakeMapping";

await DbConect.conectar();

async function seedUsuario() {
    await Usuario.deleteMany();

    const usuarios = [];
    
    usuarios.push(
        {
            cpf: getGlobalFakeMapping.cpf(),
            email: { type: String, required: [true, "O email do usuário é obrigatório!"] },
            celular: { type: String, required: [true, "O celular do usuário é obrigatório!"] },
            cnh: { type: String, required: [false, "A CNH do usuário não é obrigatória!"] },
            data_nomeacao: { type: Date, required: [false, "A data de nomeação não é obrigatório!"] },
            cargo: { type: String, required: [false, "O cargo do usuário não é obrigatório!"] },
            formacao: { type: String, required: [false, "A formação do usuário não é obrigatório!"] },
            nivel_acesso: {
                type: {
                    municipe: { type: Boolean, required: true, default: true },
                    operador: { type: Boolean, required: true, default: false },
                    administrador: { type: Boolean, required: true, default: false }
                }, required: [ true, "O nível de acesso do usuário é obrigatório!"]
            },
            nome: { type: String, required: [true, "O nome do usuário é obrigatório!"] },
            nome_social: { type: String, required: [false, "O nome social do usuário não é obrigatório!"] },
            portaria_nomeacao: { type: String, required: [false, "A portaria de nomeação do usuário não é obrigatória!"] },
            senha: { type: String, required: [true, "A senha do usuário é obrigatória!"] },
            endereco: {
                logradouro: { type: String, required: [true, "O logradouro é obrigatório!"]},
                cep: { type: String, required: [true, "O CEP é obrigatório!"]},
                bairro: { type: String, required: [true, "O bairro é obrigatório!"]},
                numero: { type: String, required: [true, "O número é obrigatório!"]},
                complemento: { type: String, required: [true, "O complemento é obrigatório!"]},
                cidade: { type: String, required: [true, "O cidade é obrigatório!"]},
                estado: { type: String, enum: estadosBrasil, required: [true, "O estado é obrigatório!"]}
            }
        }
    )
}
