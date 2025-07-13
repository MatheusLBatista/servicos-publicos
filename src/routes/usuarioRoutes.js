import express from "express";
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from '../middlewares/AuthPermission.js';

const router = express.Router();

const usuarioController = new UsuarioController();

router
    .get("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .post("/usuarios", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.criar.bind(usuarioController)))
    .patch("/usuarios/:id", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .put("/usuarios/:id", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .delete("/usuarios/:id", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.deletar.bind(usuarioController)))

    .post("/usuarios/:id/foto", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
    .get("/usuarios/:id/foto", AuthMiddleware, AuthPermission, asyncWrapper(usuarioController.getFoto.bind(usuarioController)));

    console.log("Rotas de usuário carregadas");

export default router;