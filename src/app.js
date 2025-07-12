// import routes from "./routes/index.js";
// import cors from "cors";
// import helmet from "helmet";
// import compression from "compression";
import errorHandler from './utils/helpers/errorHandler.js';
// import logger from './utils/logger.js';
// import fileUpload from 'express-fileupload';
import DbConnect from './config/dbConnect.js';
import routes from './routes/index.js';
import CommonResponse from './utils/helpers/CommonResponse.js';
import express from "express";
import expressFileUpload from 'express-fileupload';

const app = express();

await DbConnect.conectar();

app.use(express.json()); // importante para ler JSON
app.use(expressFileUpload());

routes(app);

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

app.use(errorHandler);

export default app;