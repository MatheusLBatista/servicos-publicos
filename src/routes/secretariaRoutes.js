import express from "express";
import SecretariaController from '../controllers/SecretariaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from "../middlewares/AuthPermission.js";

const router = express.Router();

const secretariaController = new SecretariaController();

router
    .get("/secretaria", AuthMiddleware, asyncWrapper(secretariaController.listar.bind(secretariaController)))
    .get("/secretaria/:id",AuthMiddleware, asyncWrapper(secretariaController.listar.bind(secretariaController)))
    .post("/secretaria",AuthMiddleware, AuthPermission, asyncWrapper(secretariaController.criar.bind(secretariaController)))
    .patch("/secretaria/:id",AuthMiddleware, AuthPermission, asyncWrapper(secretariaController.atualizar.bind(secretariaController)))
    .put("/secretaria/:id",AuthMiddleware, AuthPermission, asyncWrapper(secretariaController.atualizar.bind(secretariaController)))
    .delete("/secretaria/:id",AuthMiddleware, AuthPermission, asyncWrapper(secretariaController.deletar.bind(secretariaController)))

    console.log("Rotas de Secretaria carregadas");

export default router;