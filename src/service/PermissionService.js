// services/PermissionService.js

import Usuario from "../models/Usuario.js";
import Grupo from "../models/Grupo.js";
import Rota from '../models/Rota.js';
import UsuarioRepository from "../repository/UsuarioRepository.js";
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';

class PermissionService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.Usuario = Usuario;
        this.Grupo = Grupo;
        this.Rota = Rota;
        this.messages = messages;
    }

    async hasPermission(userId, rota, dominio, metodo) {
    try {
        // Busca usuário e popula o grupo (singular)
        const usuario = await this.repository.buscarPorID(userId, { populate: 'grupo' });

        if (!usuario) {
        throw new CustomError({
            statusCode: 404,
            errorType: 'resourceNotFound',
            field: 'Usuário',
            details: [],
            customMessage: this.messages.error.resourceNotFound('Usuário')
        });
        }

        if (!usuario.grupo) {
        // Usuário sem grupo
        return false;
        }

        // Normaliza rota e domínio para evitar erros
        const rotaNormalized = rota.toLowerCase().replace(/^\/|\/$/g, '');
        const dominioNormalized = dominio.toLowerCase();

        // Pega permissões do grupo
        const permissoes = usuario.grupo.permissoes || [];

        // Verifica se alguma permissão bate com a rota, domínio, método e está ativa
        const hasPermissao = permissoes.some(p => {
        const pRota = (p.rota || '').toLowerCase().replace(/^\/|\/$/g, '');
        const pDominio = (p.dominio || '').toLowerCase();

        return (
            pRota === rotaNormalized &&
            pDominio === dominioNormalized &&
            p.ativo &&
            p[metodo]
        );
        });

        return hasPermissao;
    } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return false;
    }
    }

}

export default PermissionService;
