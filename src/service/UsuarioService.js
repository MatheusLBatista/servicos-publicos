// /src/services/UsuarioService.js
// import { PermissoesArraySchema } from '../utils/validators/schemas/zod/PermissaoValidation.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import AuthHelper from '../utils/AuthHelper.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import UsuarioRepository from '../repository/UsuarioRepository.js';
import { parse } from 'dotenv';
import GrupoRepository from '../repository/GrupoRepository.js'
import SecretariaRepository from '../repository/SecretariaRepository.js'

// Importações necessárias para o upload de arquivos
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
// Helper para __dirname em módulo ES
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

class UsuarioService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.grupoRepository = new GrupoRepository;
        this.secretariaRepository = new SecretariaRepository();
    }

    async listar(req) {
        console.log("Estou no UsuarioService");

        const usuarioLogado = await this.repository.buscarPorID(req.user_id);
        const nivel = usuarioLogado?.nivel_acesso;
        const usuarioID = usuarioLogado._id;

        const id = req?.params?.id ?? String(usuarioID);

        if (nivel.municipe || nivel.operador) {
                if (String(usuarioID) !== String(id)) {
                    throw new CustomError({
                        statusCode: HttpStatusCodes.FORBIDDEN.code,
                        errorType: 'permissionError',
                        customMessage: 'Munícipes e operadores só podem acessar seus próprios dados.'
                    });
                }

                const data = await this.repository.buscarPorID(id);
                return data;
        }

        if (nivel.secretario) {
            if (id) {
                const usuarioPesquisado = await this.repository.buscarPorID(id);

                const secretariasUsuarioLogado = (usuarioLogado?.secretarias).map(s => s.toString());
                const secretariasUsuarioPesquisado = (usuarioPesquisado?.secretarias ).map(s => s.toString());

                const temAcesso = secretariasUsuarioPesquisado.some(sec => secretariasUsuarioLogado.includes(sec));

                if (!temAcesso) {
                    throw new CustomError({
                        statusCode: HttpStatusCodes.FORBIDDEN.code,
                        errorType: 'permissionError',
                        customMessage: 'Secretários só podem acessar usuários da mesma secretaria.'
                    });
                }
                return usuarioPesquisado;

            } else {
                const secretariasDoLogado = (usuarioLogado?.secretarias).map(s => s._id?.toString?.() || s.toString());
                req.query.secretaria = secretariasDoLogado;
            }
        }

        const data = await this.repository.listar(req);
        console.log('Estou retornando os dados em UsuarioService para o controller');
        return data;
    }

    async criar(parsedData, req) {
        console.log("Estou em criar no UsuarioService");

        const usuarioLogado = await this.repository.buscarPorID(req.user_id);
        const nivel = usuarioLogado.nivel_acesso;

        if (nivel.municipe) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Munícipes não podem criar usuários."
            });
        }

        //valida email único
        await this.validateEmail(parsedData.email);

        //gerar senha hash
        if(parsedData.senha) {
            const { senha: senhaValidada } = await AuthHelper.hashPassword(parsedData.senha);
            parsedData.senha = senhaValidada;
        }

        //chama o repositório
        const data = await this.repository.criar(parsedData);
        return data;
    }

    async criarComSenha(parsedData) {
        console.log("Estou em signUp no UsuarioService");

        delete parsedData.grupo;
        delete parsedData.nivel_acesso;

        await this.validateEmail(parsedData.email);

        if (parsedData.senha) {
            const { senha: senhaValidada } = await AuthHelper.hashPassword(parsedData.senha);
            parsedData.senha = senhaValidada;
        }

        parsedData.nivel_acesso = {
            municipe: true,
            operador: false,
            secretario: false,
            administrador: false
        };

        const grupo = await this.grupoRepository.buscarPorNome("Municipe");
        if (grupo) {
            parsedData.grupo = grupo._id;
        }

        const data = await this.repository.criar(parsedData);

        delete data.senha

        return data;
    }

    async atualizar(id, parsedData, req) {
        console.log('Estou no atualizar em UsuarioService');

        delete parsedData.email;
        delete parsedData.senha;

        await this.ensureUserExists(id);

        const usuario = await this.repository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso ;
        const isAdmin = nivel.administrador;

        const atualizarOutroUser = String(usuario._id) !== String(id);

        if (!isAdmin && atualizarOutroUser) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Você não tem permissões para atualizar outro usuário."
            });
        }

        if (!isAdmin) {
            delete parsedData.grupo;
            delete parsedData.nivel_acesso;
            delete parsedData.secretarias;
        }

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    async deletar(id, req) {
        console.log('Estou no atualizar em UsuarioService');

        const usuario = await this.repository.buscarPorID(req.user_id);
        const nivel = usuario?.nivel_acesso ;
        const usuarioID = usuario._id;

        await this.ensureUserExists(id);

        if (nivel.municipe) {
            if (usuarioID.toString() !== id.toString()) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.FORBIDDEN.code,
                    errorType: 'permissionError',
                    field: 'Usuário',
                    details: [],
                    customMessage: "Munícipes só podem deletar seus próprios dados."
                });
            }
        }

        const data = await this.repository.deletar(id)
        return data;
    }

    async atualizarFoto(id, parsedData, req) {
        console.log('Estou no atualizarFoto em UsuarioService');

        await this.ensureUserExists(id);

        const usuarioLogado = await this.repository.buscarPorID(req.user_id);
        const nivel = usuarioLogado.nivel_acesso;

        if (nivel.admin && String(usuarioLogado._id) !== String(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'permissionError',
                field: 'Usuário',
                details: [],
                customMessage: "Você só pode atualizar a sua própria foto."
            });
        }

        const data = await this.repository.atualizar(id, parsedData);
        return data;
    }

    //metodos auxiliares
    async validateEmail(email, id=null) {
        const usuarioExistente = await this.repository.buscarPorEmail(email, id);
        if (usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'email',
                details: [{ path: 'email', message: 'Email já está em uso.' }],
                customMessage: 'Email já cadastrado.',
            });
        }
    }

    async ensureUserExists(id){
        const usuarioExistente = await this.repository.buscarPorID(id);

        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado.'
            });
        }

        return usuarioExistente;
    }

      /**
   * Valida extensão, tamanho, redimensiona e salva a imagem,
   * atualiza o usuário e retorna nome do arquivo + metadados.
   */
    async processarFoto(userId, file, req) {
        // 1) valida extensão
        const ext = path.extname(file.name).slice(1).toLowerCase();
        const validExts = ['jpg', 'jpeg', 'png', 'svg'];
        if (!validExts.includes(ext)) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'file',
            details: [],
            customMessage: 'Extensão de arquivo inválida. Permitido: jpg, jpeg, png, svg.',
        });
        }

        // 2) valida tamanho (max 50MB)
        const MAX_BYTES = 50 * 1024 * 1024;
        if (file.size > MAX_BYTES) {
        throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: 'validationError',
            field: 'file',
            details: [],
            customMessage: `Arquivo não pode exceder ${MAX_BYTES / (1024 * 1024)} MB.`,
        });
        }

        // 3) prepara paths
        const fileName = `${uuidv4()}.${ext}`;
        const uploadsDir = path.join(getDirname(), '..', '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const uploadPath = path.join(uploadsDir, fileName);

        // 4) redimensiona/comprime
        const transformer = sharp(file.data)
        .resize(400, 400, { fit: sharp.fit.cover, position: sharp.strategy.entropy });
        if (['jpg', 'jpeg'].includes(ext)) {
        transformer.jpeg({ quality: 80 });
        }
        const buffer = await transformer.toBuffer();
        await fs.promises.writeFile(uploadPath, buffer);

        // 5) atualiza usuário no banco
        const dados = { link_imagem: fileName };
        UsuarioUpdateSchema.parse(dados);
        await this.atualizarFoto(userId, dados, req);

        // 6) retorna metadados adicionais
        return {
        fileName,
        metadata: {
            fileExtension: ext,
            fileSize: file.size,
            md5: file.md5, // vem do express-fileupload
        },
        };
    }
    
}

export default UsuarioService;