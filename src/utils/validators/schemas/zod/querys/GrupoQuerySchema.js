import { z } from "zod";
import mongoose from 'mongoose';

export const GrupoIDSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const GrupoQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    ativo: z
        .preprocess(
            (val) => {
                if (val === 'true' || val === true || val === 1 || val === '1') return true;
                if (val === 'false' || val === false || val === 0 || val === '0') return false;
                return undefined;
            },
            z.boolean().optional()
        )
});