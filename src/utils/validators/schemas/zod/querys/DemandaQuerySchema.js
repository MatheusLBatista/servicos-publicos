import { z } from "zod";
import mongoose from 'mongoose';
import { enderecoSchema, tiposDemanda, statusDemanda } from "../DemandaSchema.js";
//TODO: revisar se essas importações afetaram o teste

export const DemandaIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const DemandaQuerySchema = z.object({
    tipo: z
        .string()
        .optional()
        .transform((val) => val?.trim().toLowerCase())
        .refine((val) => tiposDemanda.includes(val), {
            message: "Tipo inválido. Deve ser um dos valores permitidos."
        }),
    status: z
        .string()
        .transform((val) => val?.trim().toLocaleLowerCase())
        .optional()
        .refine((val) => statusDemanda.includes(val),{
            message: "Status inválido. Deve ser um dos valores permitidos."
        }),
    data: z
        .string()
        .optional(),
    usuarios: z
        .string()
        .optional()
        .refine((val) => val?.trim()),
    endereco: enderecoSchema
        .optional(),
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
