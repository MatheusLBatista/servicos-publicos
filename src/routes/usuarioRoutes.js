import express from "express";
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

const router = express.Router();

const usuarioController = new UsuarioController();

router
    .get("/usuarios", AuthMiddleware, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id", AuthMiddleware, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .post("/usuarios", AuthMiddleware, asyncWrapper(usuarioController.criar.bind(usuarioController)))
    .patch("/usuarios/:id", AuthMiddleware, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .put("/usuarios/:id", AuthMiddleware, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .delete("/usuarios/:id", AuthMiddleware, asyncWrapper(usuarioController.deletar.bind(usuarioController)))

    .post("/usuarios/:id/foto", AuthMiddleware, asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
    .get("/usuarios/:id/foto", AuthMiddleware, asyncWrapper(usuarioController.getFoto.bind(usuarioController)));

    console.log("Rotas de usuário carregadas");

export default router;