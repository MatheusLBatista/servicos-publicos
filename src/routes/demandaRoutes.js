import express from 'express';
import DemandaController from '../controllers/DemandaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

const router = express.Router()

const demandaController = new DemandaController();

router
    .get('/demandas', AuthMiddleware, asyncWrapper(demandaController.listar.bind(demandaController)))
    .get('/demandas/:id', asyncWrapper(demandaController.listar.bind(demandaController)))
    .post('/demandas', asyncWrapper(demandaController.criar.bind(demandaController)))
    .patch("/demandas/:id", asyncWrapper(demandaController.atualizar.bind(demandaController)))
    .put("/demandas/:id", asyncWrapper(demandaController.atualizar.bind(demandaController)))
    .delete("/demandas/:id", asyncWrapper(demandaController.deletar.bind(demandaController)));

export default router;