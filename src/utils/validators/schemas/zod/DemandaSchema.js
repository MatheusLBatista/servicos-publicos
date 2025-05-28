import { z } from 'zod';
import { estadosBrasil } from '../../../../models/Usuario.js';
import mongoose from 'mongoose';

export const tiposDemanda = [ "Coleta", "Iluminação", "Saneamento", "Árvores", "Animais", "Pavimentação"];

export const statusDemanda = [ "Em aberto", "Em andamento", "Concluída" ]

export const enderecoSchema = z.object({
        logradouro: z.string().min(2, "O logradouro não pode ser vazio."),
        cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
        bairro: z.string().min(1, "O bairro não pode ser vazio."),
        numero: z.number().int().positive("O número deve ser inteiro e positivo."),
        complemento: z.string().optional(),
        cidade: z.string().min(2, "A cidade não pode ser vazia."),
        estado: z.enum((val) => estadosBrasil.includes(val), {
            message: "Estado inválido."
        })
      });

const distinctObjectIdArray = z
  .array(objectIdSchema)
  .refine(
    (arr) => new Set(arr.map((id) => id.toString())).size === arr.length,
    { message: 'Não pode conter ids repetidos.'}
  );

const DemandaSchema = z.object ({
    tipo: z
      .string()
      .transform((val) => val.trim().toLowerCase())
      .refine((val) => tiposDemanda.includes(val),
        {
        message: "Tipo inválido. Deve ser um dos valores permitidos.",
        }
    ),
    status: z
      .string()
      .transform((val) => val.trim().toLocaleLowerCase())
      .refine((val) => statusDemanda.includes(val),
      {
        message: "Status inválido. Deve ser um dos valores permitidos."
      }),
    data: z
      .string()
      .datetime(),
    resolucao: z
      .optional()
      .string(),
    feedback:z
      .number()
      .optional(),
    avaliacao_resolucao: z
      .string()
      .optional(),
    link_imagem: z
      .string()
      .url("Deve ser uma URL válida")
      .regex(/\.(jpg|jpeg|png|webp|svg|gif)$/i, {
      message: "Deve ser um link de imagem com extensão válida (jpg, png, etc)."
      })
      .optional(),
    motivo_devolucao: z
      .string()
      .optional(),
    link_imagem_resolucao: z
      .string()
      .url("Deve ser uma URL válida")
      .regex(/\.(jpg|jpeg|png|webp|svg|gif)$/i, {
      message: "Deve ser um link de imagem com extensão válida (jpg, png, etc)."
      })
      .optional(),
    endereco: enderecoSchema,
    usuarios: distinctObjectIdArray.default([])
})

const DemandaUpdateSchema = DemandaSchema.partial();

export { DemandaUpdateSchema, DemandaSchema };