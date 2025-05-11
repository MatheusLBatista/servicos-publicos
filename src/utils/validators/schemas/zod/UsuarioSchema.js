// src/utils/validators/schemas/zod/UsuarioSchema.js

import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';
import { RotaSchema } from './RotaSchema.js';

/** Definição da expressão regular para a senha
 * Padrão: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial
 * Tamanho mínimo: 8 caracteres
 **/
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Validação de array de ObjectId sem duplicações
const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.' }
  );

const UsuarioSchema = z.object({
  nome: z.string().min(1, 'Campo nome é obrigatório.'),
  email: z
    .string()
    .email('Formato de email inválido.')
    .min(1, 'Campo email é obrigatório.'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .optional()
    .refine(
      (senha) => {
        // Senha é opcional
        if (!senha) return true;
        return senhaRegex.test(senha);
      },
      {
        message:
          'A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
      }
    ),
  link_foto: z.string().optional(),
  ativo: z.boolean().default(false),

  // Arrays sem ids repetidos:
  grupos: distinctObjectIdArray.default([]),
  unidades: distinctObjectIdArray.default([]),

  // Permissões permanece como estava
  permissoes: z.array(RotaSchema).default([]),
});

const UsuarioUpdateSchema = UsuarioSchema.partial();

export { UsuarioSchema, UsuarioUpdateSchema };
