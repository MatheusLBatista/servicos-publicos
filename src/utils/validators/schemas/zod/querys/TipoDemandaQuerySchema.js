import { z } from "zod";
import mongoose from 'mongoose';

export const TipoDemandaIDSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const TipoDemandaQuerySchema = z.object({
    titulo: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Titulo não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    descricao: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Descrição não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    icone: z
        .string()
        .optional()
        .transform((val) => val?.trim())
        .refine(
            (val) => !val || /\.(jpg|jpeg|png|gif|svg)$/i.test(val),
            {
            message: 'A URL deve apontar para uma imagem válida (jpg, png, etc).',
            }
        ),
    subdescricao: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Subdescrição não pode ser vazio",
        })
        .transform((val) => val?.trim()),
    link_imagem: z
        .string()
        .optional()
        .transform((val) => val?.trim())
        .refine(
            (val) => !val || /\.(jpg|jpeg|png|gif|svg)$/i.test(val),
            {
            message: 'A URL deve apontar para uma imagem válida (jpg, png, etc).',
            }
        ),
    tipo: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Tipo não pode ser vazio",
        })
        .transform((val) => val?.trim()),
});
