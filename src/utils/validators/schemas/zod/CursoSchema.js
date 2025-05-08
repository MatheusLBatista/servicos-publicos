// src/utils/validators/schemas/zod/CursoSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const CursoSchema = z.object({
  nome: z.string().min(1, 'Campo nome é obrigatório.'),
  codigo: z.string().min(1, 'Campo codigo é obrigatório.'),
  contra_turnos: z.object({
    segunda: z.boolean().default(false),
    terca: z.boolean().default(false),
    quarta: z.boolean().default(false),
    quinta: z.boolean().default(false),
    sexta: z.boolean().default(false),
    sabado: z.boolean().default(false),
    domingo: z.boolean().default(false),
  }).default({
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false,
    domingo: false,
  }),
});

const CursoUpdateSchema = CursoSchema.partial();

export { CursoSchema, CursoUpdateSchema };
