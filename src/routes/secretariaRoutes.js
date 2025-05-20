import express from "express";
import SecretariaController from '../controllers/SecretariaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';

const router = express.Router();

const secretariaController = new SecretariaController();

router
    .get("/secretaria", asyncWrapper(secretariaController.listar.bind(secretariaController)))
    .get("/secretaria/:id", asyncWrapper(secretariaController.listar.bind(secretariaController)))
    .post("/secretaria", asyncWrapper(secretariaController.criar.bind(secretariaController)))
    //.delete("/secretaria/:id", asyncWrapper(secretariaController.deletar.bind(secretariaController)))

    //foto
    //.post("/secretaria/:id/foto", asyncWrapper(secretariaController.fotoUpload.bind(secretariaController)))
    //.get("/secretaria/:id/foto", asyncWrapper(secretariaController.getFoto.bind(secretariaController)));

    console.log("Rotas de Secretaria carregadas");

export default router;