import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import SecretariaController from '../controllers/SecretariaController.js';
import csvFileValidator from "../middlewares/csvFileValidator.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const secretariaController = new SecretariaController(); // Instância da classe

router
  .get("/secretaria", asyncWrapper(secretariaController.listar.bind(secretariaController)))
  .get("/secretaria/demandas/:id", asyncWrapper(secretariaController.listar.bind(secretariaController)))
  .post("/secretaria/demandas/:id/atribuir", asyncWrapper(secretariaController.listar.bind(secretariaController)))
  .post("/secretaria/demandas/:id/rejeitar", asyncWrapper(secretariaController.listar.bind(secretariaController)))
  .patch("/secretaria/demandas/:id/devolucao", asyncWrapper(secretariaController.listar.bind(secretariaController)))

export default router;
