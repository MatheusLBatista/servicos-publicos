import mongoose from "mongoose";
import DemandaRepository from "../repository/DemandaRepository.js";
import { parse } from 'dotenv';
import CustomError from "../utils/helpers/CustomError.js";
import UsuarioRepository from "../repository/UsuarioRepository.js";
import SecretariaRepository from "../repository/SecretariaRepository.js";
import { DemandaSchema, DemandaUpdateSchema } from '../utils/validators/schemas/zod/DemandaSchema.js';
import HttpStatusCodes from "../utils/helpers/HttpStatusCodes.js";

// Importações necessárias para o upload de arquivos
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

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
            return data;
        }

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;

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
        const nivel = usuario?.nivel_acesso;

        if (nivel.operador) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Somente os munícipes podem criar uma demanda através dessa rota."
            });
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

    async atualizar(id, parsedData, req) {
        console.log("Estou em atualizar de Demanda Service");

        this.removerCampos(parsedData, ["tipo", "data"]);

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;

        const demanda = await this.repository.buscarPorID(id);

        if (!nivel.municipe && !nivel.admin) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Somente os munícipes podem atualizar uma demanda através dessa rota."
            });
        }
            
        delete parsedData.resolucao;
        delete parsedData.motivo_devolucao;
        delete parsedData.link_imagem_resolucao;

        await this.ensureDemandaExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async atribuir(id, parsedData, req) {
        console.log("Estou em atribuir de Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;

        if (!nivel.secretario) {
            throw new CustomError({
            statusCode: HttpStatusCodes.FORBIDDEN.code,
            errorType: 'permissionError',
            field: 'Usuário',
            details: [],
            customMessage: "Apenas secretários podem atribuir operadores a uma demanda."
            });
        }

        const demanda = await this.repository.buscarPorID(id);
        const secretariasUsuario = (usuario?.secretarias).map(s => s._id.toString());
        const secretariasDemanda = (demanda?.secretarias).map(s => s._id.toString());

        const permited = secretariasDemanda.some(id => secretariasUsuario.includes(id));
        if (!permited) {
            throw new CustomError({
            statusCode: HttpStatusCodes.FORBIDDEN.code,
            errorType: 'permissionError',
            field: 'Usuário',
            details: [],
            customMessage: "Você não tem permissão para atribuir essa demanda."
            });
        }

        if (!parsedData.usuarios || parsedData.usuarios.length === 0) {
            throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'Usuários',
            details: [],
            customMessage: "Você deve informar pelo menos um usuário operador para atribuir."
            });
        }

        const usuariosParaAssociar = await this.userRepository.buscarPorIDs(parsedData.usuarios);
        const todosSaoOperadores = usuariosParaAssociar.every(user => user.nivel_acesso?.operador);

        if (!todosSaoOperadores) {
            throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'Usuários',
            details: [],
            customMessage: "Só é possível associar usuários do tipo operador."
            });
        }

        const usuariosExistentes = await this.userRepository.buscarPorIDs(
            (demanda?.usuarios).map(u => u._id)
        );

        const usuariosMunicipes = usuariosExistentes
            .filter(user => user.nivel_acesso?.municipe)
            .map(user => user._id.toString());

        const usuariosFinais = new Set([
            ...parsedData.usuarios.map(id => id.toString()),
            ...usuariosMunicipes
        ]);

        await this.ensureDemandaExists(id);

        this.manterCampos(parsedData, ['usuarios'])

        const data = await this.repository.atribuir(id, {
            usuarios: Array.from(usuariosFinais),
            status: "Em andamento"
        });

        return data;
    }

    async devolver(id, parsedData, req) {
        console.log("Estou em devolver de Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;
        const userId = usuario._id.toString();

        if (!nivel.operador && !nivel.admin) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                customMessage: "Apenas operadores podem devolver uma demanda."
            });
        }

        const demanda = await this.repository.buscarPorID(id);
        const usuariosDemanda = demanda?.usuarios;

        const novaListaUsuarios = usuariosDemanda.filter(u => u._id.toString() !== userId);

        this.manterCampos(parsedData, ['motivo_devolucao']);

        const data = await this.repository.devolver(id, {
            motivo_devolucao: parsedData.motivo_devolucao,
            usuarios: novaListaUsuarios,
            status: "Em aberto"
        });

        return data;
    }

    async resolver(id, parsedData, req) {
        console.log("Estou em resolver de Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;

        if (!nivel.operador && !nivel.admin) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                customMessage: "Apenas operadores podem resolver uma demanda."
            });
        }

        const demanda = await this.repository.buscarPorID(id);

        this.manterCampos(parsedData, ["link_imagem_resolucao", "resolucao"])

        const data = await this.repository.resolver(id, {
            link_imagem_resolucao: parsedData.link_imagem_resolucao,
            resolucao: parsedData.resolucao,
            motivo_devolucao: "",
            status: "Concluída"
        });

        return data;
    }

    async atualizarFoto(id, parsedData, req) {
        console.log("Estou em atualizarFoto de DemandaService");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;
        const userId = usuario._id.toString();

        const demanda = await this.repository.buscarPorID(id);
        const usuariosDemanda = (demanda?.usuarios).map(u => u._id.toString());

        const isAdmin = nivel.administrador;
        const isMunicipe = nivel.municipe;

        if (!(isAdmin || (isMunicipe && usuariosDemanda.includes(userId)))) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Você não tem permissão para atualizar a imagem dessa demanda."
            });
        }

        await this.ensureDemandaExists(id);

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id, req) {
        console.log("Estou em deletar de Demanda Service");

        const usuario = await this.userRepository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso;

        const demanda = await this.repository.buscarPorID(id);

        const userId = usuario._id.toString();
        
        const usuariosDemanda = (demanda?.usuarios).map(u=>u._id.toString())

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
            secretario: ["_id", "tipo", "status", "data", "resolucao", "feedback", "descricao", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "createdAt", "updatedAt", "estatisticas", "endereco"], 
            administrador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "descricao", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "usuarios", "secretarias", "createdAt", "updatedAt", "estatisticas", "endereco"],
            municipe: ["tipo", "_id", "status", "resolucao", "feedback", "descricao", "avaliacao_resolucao", "link_imagem_resolucao", "link_imagem", "endereco", "createdAt", "updatedAt", "estatisticas"],
            operador: ["_id", "tipo", "status", "data", "resolucao", "feedback", "descricao", "avaliacao_resolucao", "link_imagem", "motivo_devolucao", "link_imagem_resolucao", "createdAt", "updatedAt", "estatisticas", "endereco"]
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

    removerCampos(obj, campos) {
        for(const campo of campos){
            delete obj[campo];
        }
    }

    manterCampos(obj, camposPermitidos) {
        Object.keys(obj).forEach((key) => {
            if (!camposPermitidos.includes(key)) {
                delete obj[key];
            }
        });
    }

          /**
   * Valida extensão, tamanho, redimensiona e salva a imagem,
   * atualiza o usuário e retorna nome do arquivo + metadados.
   */
    async processarFoto(demandaId, file, tipo, req) {
        const ext = path.extname(file.name).slice(1).toLowerCase();
        const validExts = ['jpg', 'jpeg', 'png', 'svg'];
        if (!validExts.includes(ext)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'file',
                customMessage: 'Extensão inválida. Permitido: jpg, jpeg, png, svg.'
            });
        }

        const MAX_BYTES = 50 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'file',
                customMessage: 'Arquivo excede 50MB.'
            });
        }

        const fileName = `${uuidv4()}.${ext}`;
        const uploadsDir = path.join(getDirname(), '..', '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const uploadPath = path.join(uploadsDir, fileName);

        const transformer = sharp(file.data).resize(400, 400, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy
        });
        if (['jpg', 'jpeg'].includes(ext)) {
            transformer.jpeg({ quality: 80 });
        }

        const buffer = await transformer.toBuffer();
        await fs.promises.writeFile(uploadPath, buffer);

        // Define dinamicamente o campo a ser atualizado
        const campo = tipo === "resolucao" ? "link_imagem_resolucao" : "link_imagem";
        const dados = { [campo]: fileName };

        DemandaUpdateSchema.parse(dados);
        await this.atualizarFoto(demandaId, dados, req);

        return {
            fileName,
            metadata: {
                fileExtension: ext,
                fileSize: file.size,
                md5: file.md5,
            },
        };
    }

} 

export default DemandaService;