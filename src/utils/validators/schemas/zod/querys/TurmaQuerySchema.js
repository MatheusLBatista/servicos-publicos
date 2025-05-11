import { z } from "zod";
import mongoose from "mongoose";

export const TurmaIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), { message: "ID inválido", })
  .transform((id) => new mongoose.Types.ObjectId(id));


export const TurmaQuerySchema = z.object({
  codigo_suap: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Código SUAP não pode ser vazio",
    })
    .transform((val) => val?.trim()),
  descricao: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Descrição não pode ser vazia",
    })
    .transform((val) => val?.trim()),
  curso: z.string().optional().transform((val) => val?.trim()),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Page deve ser um número inteiro maior que 0",
    }),
  limite: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
      message: "Limite deve ser um número inteiro entre 1 e 100",
    }),
});
