import express from 'express';
import DemandaController from '../controllers/DemandaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from '../middlewares/AuthPermission.js';

const router = express.Router()

const demandaController = new DemandaController();

router
    .get('/demandas', AuthMiddleware, AuthPermission, asyncWrapper(demandaController.listar.bind(demandaController)))
    .get('/demandas/:id', AuthMiddleware, asyncWrapper(demandaController.listar.bind(demandaController)))
    .post('/demandas', AuthMiddleware, asyncWrapper(demandaController.criar.bind(demandaController)))
    .patch("/demandas/:id", AuthMiddleware, asyncWrapper(demandaController.atualizar.bind(demandaController)))
    .put("/demandas/:id", AuthMiddleware, asyncWrapper(demandaController.atualizar.bind(demandaController)))
    .delete("/demandas/:id", AuthMiddleware, asyncWrapper(demandaController.deletar.bind(demandaController)));

export default router;