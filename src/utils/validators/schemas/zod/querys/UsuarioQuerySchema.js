import { z } from "zod";
import mongoose from 'mongoose';

export const UsuarioIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const UsuarioQuerySchema = z.object({
    nome: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    email: z
        .union([z.string().email("Formato de email inválido."), z.undefined()])
        .optional(),
    formacao: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Formação não pode ser vazio."
        })
        .transform((val) => val?.trim()),
    cargo: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Cargo não pode ser vazio."
        })
        .transform((val) => val?.trim()),
    nivel_acesso: z
        .string()
        .optional()
        .transform((val) => val?.trim().toLowerCase())
        .refine((val) => !val || ["municipe", "munícipe", "operador", "administrador"].includes(val), {
            message: "Nível de acesso inválido."
        }),
    ativo: z
        .string()
        .optional()
        .transform((val) => val?.trim().toLowerCase())
        .refine((value) => !value || value === "true" || value === "false", {
            message: "Ativo deve ser 'true' ou 'false'",
        }),
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
