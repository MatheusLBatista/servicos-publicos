import express from "express";
// import routes from "./routes/index.js";
// import cors from "cors";
// import helmet from "helmet";
// import compression from "compression";
import DbConnect from './config/DbConnect.js';
// import errorHandler from './utils/helpers/errorHandler.js';
// import logger from './utils/logger.js';
import CommonResponse from './utils/helpers/CommonResponse.js';
// import fileUpload from 'express-fileupload';

const app = express();

// Middleware para lidar com rotas não encontradas (404)
app.use((req, res, next) => {
    return CommonResponse.error(
        res,
        404,
        'resourceNotFound',
        null,
        [{ message: 'Rota não encontrada.' }]
    );
});

await DbConnect.conectar();

export default app;