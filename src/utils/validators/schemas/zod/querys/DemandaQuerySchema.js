import { z } from "zod";
import mongoose from 'mongoose';
import { enderecoSchema } from "../DemandaSchema.js";

export const TipoDemandaEnum = z.enum([
  "Coleta",
  "Iluminação",
  "Saneamento",
  "Árvores",
  "Animais",
  "Pavimentação"
]);

export const StatusDemandaEnum = z.enum([
  "Em aberto",
  "Em andamento",
  "Concluída"
]);

export const DemandaIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const DemandaQuerySchema = z.object({
    tipo: TipoDemandaEnum
        .optional(),
    status: StatusDemandaEnum
        .optional(),
    data_inicio: z
        .string()
        .optional(),
    data_fim: z
        .string()
        .optional(),
    usuarios: z
        .string()
        .optional()
        .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
            message: "Usuário inválido. Tente novamente!",
        }),
    secretarias: z
        .string()
        .optional()
        .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
            message: "Secretaria inválida. Tente novamente!",
        }),
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
