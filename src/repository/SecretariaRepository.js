import SecretariaModel from '../models/Secretaria.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class SecretariaRepository {
    constructor({ model = SecretariaModel } = {}) {
        this.model = model;
    }

    // Método para listar secretarias,
    // podendo buscar por ID
    async listar(req) {
        const { id } = req.params || {};

        // Se vier um ID na rota, retorna apenas a secretaria correspondente
        if (id) {
            const secretararia = await this.model.findById(id);
            if (!secretararia) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Secretaria',
                    customMessage: messages.error.resourceNotFound('Secretaria'),
                });
            }
            return secretararia.find();
        }

    }
}