//src/utils/validators/schemas/zod/grupoSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { RotaSchema } from './RotaSchema.js';

const GrupoSchema = z.object({
    nome: z.string().min(1, 'O campo nome é obrigatório.'),
    descricao: z.string().min(1, 'O campo descrição é obrigatório.'),
    ativo: z.boolean().default(true),
    permissoes: z.array(RotaSchema).default([]),
    unidades: z.array(objectIdSchema).default([]),
});

const GrupoUpdateSchema = GrupoSchema.partial();

export { GrupoSchema, GrupoUpdateSchema };
