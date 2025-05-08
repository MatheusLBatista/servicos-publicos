// src/routes/index.js

import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "../docs/config/head.js";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import usuarios from './usuarioRoutes.js';
import grupos from './grupoRoutes.js';
import rotas from './rotaRoutes.js';
import unidades from './unidadeRoutes.js';
import auth from './authRoutes.js';
import dotenv from "dotenv";

dotenv.config();

const routes = (app) => {
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }
    // rota para encaminhar da raiz para /docs
    app.get("/", (req, res) => {
        res.redirect("/docs");
    }
    );

    const swaggerDocs = swaggerJsDoc(getSwaggerOptions());
    app.use(swaggerUI.serve);
    app.get("/docs", (req, res, next) => {
        swaggerUI.setup(swaggerDocs)(req, res, next);
    });

    app.use(express.json(),
        auth, 
        usuarios,
        grupos,
        rotas,
        unidades,
        
        cursos,
        turmas,
        estudantes,
        projetos,
        estagios,
        refeicaoTurmas,
        refeicoes
    );

    // Se não é nenhuma rota válida, produz 404
    app.use((req, res) => {
        res.status(404).json({ message: "Rota não encontrada" });
    });
};

export default routes;