import express from "express";
import GrupoController from "../controllers/GrupoController.js";
import { asyncWrapper } from "../utils/helpers/index.js";
import mongoose from "mongoose";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthPermission from "../middlewares/AuthPermission.js";

const router = express.Router();

const gruposController = new GrupoController();

router
  .get(
    "/grupos",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.listar.bind(gruposController))
  )
  .get(
    "/grupos/:id",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.listar.bind(gruposController))
  )
  .post(
    "/grupos",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.criar.bind(gruposController))
  )
  .patch(
    "/grupos/:id",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.atualizar.bind(gruposController))
  )
  .put(
    "/grupos/:id",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.atualizar.bind(gruposController))
  )
  .delete(
    "/grupos/:id",
    AuthMiddleware,
    AuthPermission,
    asyncWrapper(gruposController.deletar.bind(gruposController))
  );

console.log("Rotas do grupo carregadas");

export default router;
