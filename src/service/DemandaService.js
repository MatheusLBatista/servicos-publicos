import mongoose from "mongoose";
import DemandaRepository from "../repository/DemandaRepository.js";
import { parse } from 'dotenv';
import CustomError from "../utils/helpers/CustomError.js";
import UsuarioRepository from "../repository/UsuarioRepository.js";
import SecretariaRepository from "../repository/SecretariaRepository.js";
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";

class DemandaService {
    constructor(){
        this.repository = new DemandaRepository()
        this.userRepository = new UsuarioRepository()
        this.secretariaRepository = new SecretariaRepository()
    }

    async listar(req) {
        const { id } = req.params;

        if (id) {
            const data = await this.repository.buscarPorID(id);
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Demanda',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Demanda')
                });
            }
            return data;
        }

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario.nivel_acesso || {};

        const data = await this.repository.listar(req);

        if (nivel.secretario) {
            const secretariasUsuario = usuario.secretarias?.map(s => s._id.toString());

            data.docs = data.docs.filter(demanda => {
                const secretariasDemanda = (demanda.secretarias || []).map(s => s._id.toString());
                return secretariasDemanda.some(id => secretariasUsuario.includes(id));
            });
        }

        if (nivel.operador) {
            const secretariasUsuario = usuario.secretarias?.map(s => s._id.toString());
            const userId = usuario._id.toString();

            data.docs = data.docs.filter(demanda => {
                const secretariasDemanda = (demanda.secretarias || []).map(s => s._id.toString());
                const demandaUsuarios = (demanda.usuarios || []).map(user => user._id.toString());
                return secretariasDemanda.some(id => secretariasUsuario.includes(id)) && demandaUsuarios.includes(userId);
            });
        }

        if(nivel.municipe) {
            const userId = usuario._id.toString()

            data.docs = data.docs.filter(demanda => {
                const demandaUsuarios = (demanda.usuarios || []).map(user => user._id.toString());
                return demandaUsuarios.includes(userId);
            })
        }

        if (!nivel.secretario && !nivel.operador && !nivel.municipe) {
            data.docs = await Promise.all(
                data.docs.map(demanda => this.filtrarDemandaPorUser(demanda, usuario))
            );
        }

        return data;
    }
    
    async criar(parsedData, req) {
        console.log("Estou em Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id)
        const nivel = usuario.nivel_acesso || {};

        if(!nivel.municipe && !nivel.administrador) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Apenas munícipes podem criar demandas."
            })
        }

        if(nivel.municipe) {
            const secretaria = await this.secretariaRepository.buscarPorTipo(parsedData.tipo);

            parsedData.usuarios = [req.user_id]
            delete parsedData.feedback;
            delete parsedData.avaliacao_resolucao;
            delete parsedData.resolucao;
            delete parsedData.motivo_devolucao;
            delete parsedData.link_imagem_resolucao;

            parsedData.secretarias = [secretaria._id];
        }

        const data = await this.repository.criar(parsedData);
        
        return data;
    }

    async atualizar(id, parsedData, req){
        console.log("Estou em atualizar de Demanda Service");

        delete parsedData.tipo;
        delete parsedData.data;

        const usuario = await this.userRepository.buscarPorID(req.user_id)
        const nivel = usuario.nivel_acesso || {};
        const demanda = await this.repository.buscarPorID(id);

        const userId = usuario._id.toString();
        const secretariasUsuario = (usuario.secretarias || []).map(s => s._id.toString());
        const secretariasDemanda = (demanda.secretarias || []).map(s => s._id.toString());
        const usuariosDemanda = (demanda.usuarios || []).map(u => u._id.toString());

        if(nivel.operador) {
            const permited = 
                secretariasDemanda.some(id => secretariasUsuario.includes(id)) &&
                usuariosDemanda.includes(userId);
            
            const permitedFields = ["status", "resolucao", "motivo_devolucao", "link_imagem_resolucao"]
            
            if(!permited) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.FORBIDDEN.code,
                    errorType: 'permissionError',
                    field: 'Usuário',
                    details: [],
                    customMessage: "Você não tem permissão para atualizar esta demanda."
                })
            }

            if(parsedData) {
                for(let key in parsedData) {
                    if(!permitedFields.includes(key)) {
                        delete parsedData.key;
                    }
                }
            }
        }

        //todo: pode associar apenas usuarios do tipo operador
        if(nivel.secretario) {
            const permited = secretariasDemanda.some(id => secretariasUsuario.includes(id));

            const permitedFields = ["status", "resolucao", "link_imagem_resolucao", "usuarios"];

            if (!permited) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.FORBIDDEN.code,
                    errorType: 'permissionError',
                    field: 'Usuário',
                    details: [],
                    customMessage: "Você não tem permissão para atualizar esta demanda."
                });
            }
            
            if(parsedData) {
                for(let key in parsedData) {
                    if(!permitedFields.includes(key)) {
                        delete parsedData.key;
                    }
                }

            if (parsedData.usuarios && parsedData.usuarios.length > 0) {
                const usuariosParaAssociar = await this.userRepository.buscarPorIDs(parsedData.usuarios);

                const todosSaoOperadores = usuariosParaAssociar.every(user => user.nivel_acesso?.operador);

                if (!todosSaoOperadores) {
                    throw new CustomError({
                        statusCode: HttpStatusCodes.BAD_REQUEST.code,
                        errorType: 'validationError',
                        field: 'Usuário',
                        details: [],
                        customMessage: "Só é possível associar usuários do tipo operador."
                    });
                }

                const usuariosOriginais = await this.userRepository.buscarPorIDs(usuariosDemanda);

                // Filtra os que são munícipes
                const apenasMunicipes = usuariosOriginais
                    .filter(user => user.nivel_acesso?.municipe)
                    .map(user => user._id.toString());

                const usuariosFinais = new Set([
                    ...parsedData.usuarios.map(id => id.toString()),
                    ...apenasMunicipes
                ]);

                parsedData.usuarios = Array.from(usuariosFinais);
            }

            }
        }

        if(nivel.municipe) {
            delete parsedData.resolucao;
            delete parsedData.motivo_devolucao;
            delete parsedData.link_imagem_resolucao;
        }

        await this.ensureDemandaExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id, req) {
        console.log("Estou em deletar de Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario.nivel_acesso || {};

        const demanda = await this.repository.buscarPorID(id);

        const userId = usuario._id.toString();
        
        const usuariosDemanda = (demanda.usuarios || []).map(u=>u._id.toString())

        if (nivel.municipe) {
            if(!usuariosDemanda.includes(userId)) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.FORBIDDEN.code,
                    errorType: 'permissionError',
                    field: 'Usuário',
                    details: [],
                    customMessage: "Você é apenas permitido à deletar as demandas que criou."
                });
            }
        } else if (nivel.operador || nivel.secretario) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Você não tem permissão para deletar demandas."
            });
        }

        await this.ensureDemandaExists(id);

        const data = await this.repository.deletar(id);
        return data;
    }

    async ensureDemandaExists(id) {
        const demandaExistente = await this.repository.buscarPorID(id);

        return demandaExistente;
    }

    async nivelAcesso(nivelAcesso) {
        const permissoes = {
            secretario: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "createdAt", "updatedAt", "estatisticas", "endereco"], 
            administrador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "secretarias", "createdAt", "updatedAt", "estatisticas", "endereco"],
            municipe: ["tipo", "_id", "status", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem_resolucao", "link_imagem", "endereco", "createdAt", "updatedAt", "estatisticas"],
            operador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "createdAt", "updatedAt", "estatisticas", "endereco"]
        };

        const niveis = ['administrador', 'secretario', 'operador', 'municipe'];

        const nivelAtivo = niveis.find(nivel => nivelAcesso[nivel]);

        return permissoes[nivelAtivo] || [];
    }

    async filtrarDemandaPorUser(demanda, usuario) {
        const camposPermitidos = await this.nivelAcesso(usuario.nivel_acesso);

        Object.keys(demanda).forEach(campo => {
            if(!camposPermitidos.includes(campo)){
                delete demanda[campo];
            }
        });

        return demanda;
    }
} 

export default DemandaService;