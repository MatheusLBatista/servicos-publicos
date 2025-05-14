import express from 'express';
import DemandaController from '../controllers/DemandaController.js';
import { asyncWrapper } from '../utils/helpers/index.js';
import mongoose from 'mongoose';

const router = express.Router()

const demandaController = new DemandaController();

router
    .get('/demandas', asyncWrapper(demandaController.listar.bind(demandaController)))
    .get('/demandas/:id', asyncWrapper(demandaController.listar.bind(demandaController)));

export default router;