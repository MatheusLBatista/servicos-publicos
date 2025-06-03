import express from "express";
import TipoDemandaController from '../controllers/TipoDemandaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';

const router = express.Router();

const tipoDemandaController = new TipoDemandaController();

router
    .get("/tipoDemanda", asyncWrapper(tipoDemandaController.listar.bind(tipoDemandaController)))
    .get("/tipoDemanda/:id", asyncWrapper(tipoDemandaController.listar.bind(tipoDemandaController)))
    .post("/tipoDemanda", asyncWrapper(tipoDemandaController.criar.bind(tipoDemandaController)))
    .patch("/tipoDemanda/:id", asyncWrapper(tipoDemandaController.atualizar.bind(tipoDemandaController)))
    .put("/tipoDemanda/:id", asyncWrapper(tipoDemandaController.atualizar.bind(tipoDemandaController)))
    .delete("/tipoDemanda/:id", asyncWrapper(tipoDemandaController.deletar.bind(tipoDemandaController)))

    console.log("Rotas de TipoDemanda carregadas");

export default router;