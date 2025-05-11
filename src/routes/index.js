// src/routes/index.js

import express from "express";
import logRoutes from "../middlewares/LogRoutesMiddleware.js";
import dotenv from "dotenv";

// Importação das rotas
import usuarioRoutes from "./usuarioRoutes.js";

dotenv.config();

const routes = (app) => {
    // Middleware de log, se ativado
    if (process.env.DEBUGLOG) {
        app.use(logRoutes);
    }

    // Middleware para ler JSON
    app.use(express.json());

    // Rotas com prefixos claros
    app.use("/usuarios", usuarioRoutes);

    // Rota raiz simples
    app.get("/", (req, res) => {
        res.send("API rodando.");
    });

    // Tratamento de rota não encontrada
    app.use((req, res) => {
        res.status(404).json({
            message: "Recurso não encontrado.",
            data: null,
            errors: [{ message: "Rota não encontrada." }]
        });
    });
};


export default routes;
