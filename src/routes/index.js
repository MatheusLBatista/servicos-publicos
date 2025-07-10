// src/routes/index.js

import express from "express";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import getSwaggerOptions from "../docs/config/head.js";


// Importação das rotas
import usuarioRoutes from "./usuarioRoutes.js";
import demandaRoutes from "./demandaRoutes.js"
import secretariaRoutes from "./secretariaRoutes.js"
import tipoDemandaRoutes from "./tipoDemandaRoutes.js"
import authRoutes from "./authRoutes.js"
import grupoRoutes from "./grupoRoutes.js"

dotenv.config();

const routes = (app) => {
    // Middleware de log, se ativado
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }

    app.get("/", (req, res) => {
        res.redirect("/docs");
    });

    const swaggerDocs = swaggerJSDoc(getSwaggerOptions());
    app.use(swaggerUI.serve);
    app.get("/docs", (req, res, next) => {
        swaggerUI.setup(swaggerDocs)(req, res, next);
    });

    // Rota raiz simples
    app.get("/", (req, res) => {
        res.send("API rodando.");
    });

    app.use(express.json(), 
    usuarioRoutes, secretariaRoutes, demandaRoutes, tipoDemandaRoutes, authRoutes, grupoRoutes)
    
};

export default routes;
