// src/utils/validators/schemas/zod/UsuarioSchema.js

import { z } from 'zod';
import { estadosBrasil } from '../../../../models/Usuario.js';

/** Definição da expressão regular para a senha
 * Padrão: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial
 * Tamanho mínimo: 8 caracteres
 **/
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const UsuarioSchema = z.object({
  nome: z
    .string()
    .min(1, 'Campo nome é obrigatório.'),
  email: z
    .string()
    .email('Formato de email inválido.')
    .min(3, 'Campo email é obrigatório.'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    //senha é opcional pois ela pode ser descartada de metodos como PUT e PATCH
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
  ativo: z.boolean().optional(),
  nome_social: z
    .string()
    .min(1, "O nome social deve conter mais que 1 caracter.")
    .optional(),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "O CPF deve conter 11 dígitos numéricos."),
  celular: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "O celular deve conter 11 dígitos numéricos."),
  cnh: z
   .string()
   .trim()
   .regex(/^\d{11}$/, "A CNH deve conter 11 dígitos."),
  data_nomeacao: z
   .string()
   .datetime()
   .optional(),
  cargo: z
   .string()
   .optional(),
  formacao: z
   .string()
   .optional(),
  nivel_acesso: z.object({
   operador: z.boolean().optional(),
   administrador: z.boolean().optional(),
   municipe: z.boolean().optional()
  }),
  portaria_nomeacao: z
   .string()
   .optional(),
  endereco: z.object({
    logradouro: z.string().min(2, "O logradouro não pode ser vazio."),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
    bairro: z.string().min(1, "O bairro não pode ser vazio."),
    numero: z.number().int().positive("O número deve ser inteiro e positivo."),
    complemento: z.string().optional(),
    cidade: z.string().min(2, "A cidade não pode ser vazia."),
    estado: z.enum(estadosBrasil, "O estado não pode ser vazio.")
  })
});

const UsuarioUpdateSchema = UsuarioSchema.partial();

export { UsuarioSchema, UsuarioUpdateSchema };
