// src/routes/index.js

import express from "express";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import dotenv from "dotenv";

// Importação das rotas
import usuarioRoutes from "./usuarioRoutes.js";
import demandaRoutes from "./demandaRoutes.js"
import secretariaRoutes from "./secretariaRoutes.js"
import tipoDemandaRoutes from "./tipoDemandaRoutes.js"
import authRoutes from "./authRoutes.js"

dotenv.config();

const routes = (app) => {
    // Middleware de log, se ativado
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }

    // Rota raiz simples
    app.get("/", (req, res) => {
        res.send("API rodando.");
    });

    app.use(express.json(), 
    usuarioRoutes, secretariaRoutes, demandaRoutes, tipoDemandaRoutes, authRoutes)
    
};

export default routes;
