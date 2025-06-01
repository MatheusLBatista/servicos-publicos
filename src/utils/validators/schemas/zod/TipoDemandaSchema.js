// src/utils/validators/schemas/zod/TipoDemandaSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

// Validação de array de ObjectId sem duplicações
const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.' }
  );

const TipoDemandaSchema = z.object({
  titulo: z.string().min(3, 'Campo Titulo é obrigatório.'),
  descricao: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Descrição é obrigatória",
    })
    .transform((val) => val.trim()),
  subdescricao: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Subdescrição é obrigatória",
    })
    .transform((val) => val.trim()),
  icone: z
    .string()
    .refine((val) => !val || /\.(jpg|jpeg|png|gif|svg)$/i.test(val), {
        message: 'A URL deve apontar para uma imagem válida (jpg, png, etc).',
    }),
   link_imagem: z
    .string()
    .refine((val) => !val || /\.(jpg|jpeg|png|gif|svg)$/i.test(val), {
        message: 'A URL deve apontar para uma imagem válida (jpg, png, etc).',
    }),
    tipo: z.string().min(3, 'Campo Tipo é obrigatório.'),
});

const TipoDemandaUpdateSchema = TipoDemandaSchema.partial();

export { TipoDemandaSchema, TipoDemandaUpdateSchema };
