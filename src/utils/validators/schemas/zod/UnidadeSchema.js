// src/utils/validators/schemas/zod/UnidadeSchema.js

import { z } from 'zod';
// Optionally, consider removing or mocking the repository import during tests.
// import UnidadeRepository from '../../../../repositories/UnidadeRepository.js';

const UnidadeSchema = z.object({
    nome: z.string({
        required_error: 'O campo nome é obrigatório.',
    }).min(1, "Este campo é obrigatório"),
    localidade: z.string({
        required_error: 'O campo localidade é obrigatório.',
    }).min(1, "Este campo é obrigatório"),
    ativo: z.boolean().default(true),
}).passthrough();

// Reapply the default for "ativo" when using partial
const UnidadeUpdateSchema = UnidadeSchema.partial().extend({
    ativo: z.boolean().default(true),
});

export { UnidadeSchema, UnidadeUpdateSchema };
