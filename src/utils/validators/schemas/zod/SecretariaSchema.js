// src/utils/validators/schemas/zod/SecretariaSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { RotaSchema } from './RotaSchema.js';

/** Definição da expressão regular para a senha
 * Padrão: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial
 * Tamanho mínimo: 8 caracteres
 **/

// Validação de array de ObjectId sem duplicações
const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.' }
  );

const SecretariaSchema = z.object({
  nome: z.string().min(1, 'Campo nome é obrigatório.')
});

const SecretaraUpdateSchema = SecretariaSchema.partial();

export { SecretariaSchema, SecretaraUpdateSchema };
