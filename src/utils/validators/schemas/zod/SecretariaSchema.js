// src/utils/validators/schemas/zod/SecretariaSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { RotaSchema } from './RotaSchema.js';

// Validação de array de ObjectId sem duplicações
const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.' }
  );

const SecretariaSchema = z.object({
  nome: z.string().min(3, 'Campo nome é obrigatório.'),
  sigla: z.string().min(1, 'Campo sigla é obrigatório.'),
  email: z
      .string()
      .email('Formato de email inválido.')
      .min(1, 'Campo email é obrigatório.'),
  telefone: z 
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{5}-?\d{4}$/, {
    message: "Telefone inválido. Use o formato (XX) XXXX-XXXX"})
    .min(1, 'Campo telefone é obrigatório.')
});

const SecretariaUpdateSchema = SecretariaSchema.partial();

export { SecretariaSchema, SecretariaUpdateSchema };
