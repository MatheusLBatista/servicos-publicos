// src/utils/validators/schemas/zod/SecretariaSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { tiposDemanda } from './DemandaSchema.js';

// Validação de array de ObjectId sem duplicações
const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.' }
  );

const SecretariaSchema = z.object({
  nome: z.string().nonempty('Campo nome é obrigatório.').min(3, 'Nome deve ter pelo menos 3 caracteres.'),
  sigla: z.string().nonempty('Campo sigla é obrigatório.').min(2, 'Sigla deve ter pelo menos 2 caracteres.'),
  email: z
  .string()
  .nonempty('Campo email é obrigatório.') 
  .min(5, 'Email deve ter pelo menos 5 caracteres.')
  .email('Formato de email inválido.'),
  telefone: z 
  .string()
  .nonempty('Campo telefone é obrigatório.')
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: "Telefone inválido. Use o formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX"
  }),
  tipo: z.string().refine((val) => tiposDemanda.includes(val), {
    message: "Tipo inválido",
  }),
});

const SecretariaUpdateSchema = SecretariaSchema.partial();

export { SecretariaSchema, SecretariaUpdateSchema, distinctObjectIdArray };
