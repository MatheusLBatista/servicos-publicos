import { z } from "zod";
import mongoose from "mongoose";

export const TurmaSchema = z.object({
  codigo_suap: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Código SUAP é obrigatório",
    })
    .transform((val) => val.trim()),
  descricao: z
    .string()
    .refine((val) => val.trim().length > 0, {
      message: "Descrição é obrigatória",
    })
    .transform((val) => val.trim()),
  curso: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "ID de curso inválido",
    })
    .transform((val) => val.trim()),
});

export const TurmaUpdateSchema = TurmaSchema.partial();

export const TurmaIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
  })
  .transform((id) => new mongoose.Types.ObjectId(id));
