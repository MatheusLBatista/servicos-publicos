// src/utils/validators/schemas/zod/EstudanteSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const EstudanteSchema = z.object({
  _id: z.string().min(1, 'O Campo ID é obrigatório.'),
  matricula: z.string().min(1, 'Campo matrícula é obrigatório.'),
  nome: z.string().min(1, 'Campo nome é obrigatório.'),
  turma: objectIdSchema,
  ativo: z.boolean().default(true)
});

const EstudanteUpdateSchema = EstudanteSchema.partial();

export { EstudanteSchema, EstudanteUpdateSchema };
