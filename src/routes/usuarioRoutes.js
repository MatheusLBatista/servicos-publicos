import express from "express";
import UsuarioController from '../controllers/UsuarioController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';

const router = express.Router();

const usuarioController = new UsuarioController();

router
    .get("/usuarios", asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .get("/usuarios/:id", asyncWrapper(usuarioController.listar.bind(usuarioController)))
    .post("/usuarios", asyncWrapper(usuarioController.criar.bind(usuarioController)))
    .patch("/usuarios/:id", asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .put("/usuarios/:id", asyncWrapper(usuarioController.atualizar.bind(usuarioController)))
    .delete("/usuarios/:id", asyncWrapper(usuarioController.deletar.bind(usuarioController)))

    //foto
    //.post("/usuarios/:id/foto", asyncWrapper(usuarioController.fotoUpload.bind(usuarioController)))
    //.get("/usuarios/:id/foto", asyncWrapper(usuarioController.getFoto.bind(usuarioController)));

    console.log("Rotas de usuário carregadas");

export default router;