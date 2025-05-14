import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from '../middlewares/AuthPermission.js';
import SecretarariaController from '../controllers/EstudanteController.js';
import csvFileValidator from "../middlewares/csvFileValidator.js";
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

const secretarariaController = new SecretarariaController(); // Instância da classe

router
  .get("/secretaria", asyncWrapper(secretarariaController.listar.bind(secretarariaController)))
  .get("/secretaria/demandas/:id", asyncWrapper(secretarariaController.listar.bind(secretarariaController)))
  .post("/secretaria/demandas/:id/atribuir", asyncWrapper(secretarariaController.listar.bind(secretarariaController)))
  .post("/secretaria/demandas/:id/rejeitar", asyncWrapper(secretarariaController.listar.bind(secretarariaController)))
  .post("/secretaria/demandas/:id/devolucao", asyncWrapper(secretarariaController.listar.bind(secretarariaController)))

export default router;
