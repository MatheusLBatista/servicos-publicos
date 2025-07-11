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
        .refine((val) => !val || ["municipe", "secretario", "secretário", "munícipe", "operador", "administrador"].includes(val), {
            message: "Nível de acesso inválido."
        }),
    secretarias: z
        .string()
        .optional()
        .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
            message: "Secretaria inválida. Tente novamente!",
        }),
    ativo: z
        .preprocess(
            (val) => {
                if (val === 'true' || val === true || val === 1 || val === '1') return true;
                if (val === 'false' || val === false || val === 0 || val === '0') return false;
                return undefined;
            },
            z.boolean().optional()
        ),
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
