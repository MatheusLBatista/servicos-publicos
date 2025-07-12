import express from "express";
import TipoDemandaController from '../controllers/TipoDemandaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from "../middlewares/AuthPermission.js";

const router = express.Router();

const tipoDemandaController = new TipoDemandaController();

router
    .get("/tipoDemanda", AuthMiddleware, asyncWrapper(tipoDemandaController.listar.bind(tipoDemandaController)))
    .get("/tipoDemanda/:id", AuthMiddleware, asyncWrapper(tipoDemandaController.listar.bind(tipoDemandaController)))
    .post("/tipoDemanda", AuthMiddleware, AuthPermission, asyncWrapper(tipoDemandaController.criar.bind(tipoDemandaController)))
    .patch("/tipoDemanda/:id", AuthMiddleware, AuthPermission, asyncWrapper(tipoDemandaController.atualizar.bind(tipoDemandaController)))
    .put("/tipoDemanda/:id", AuthMiddleware, AuthPermission, asyncWrapper(tipoDemandaController.atualizar.bind(tipoDemandaController)))
    .delete("/tipoDemanda/:id", AuthMiddleware, AuthPermission, asyncWrapper(tipoDemandaController.deletar.bind(tipoDemandaController)))

    console.log("Rotas de TipoDemanda carregadas");

export default router;