import { z } from "zod";
import mongoose from 'mongoose';

export const SecretariaIDSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const SecretariaQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    email: z
            .union([z.string().email("Formato de email inválido"), z.undefined()])
            .optional(),
    sigla: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Sigla não pode ser vazio",
        })
        .transform((val) => val?.trim()),
});
