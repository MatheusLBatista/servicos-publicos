import { z } from 'zod';
import { estadosBrasil } from '../../../../models/Usuario.js';
import mongoose from 'mongoose';
import objectIdSchema from '../zod/ObjectIdSchema.js'

export const tiposDemanda = [
  "Coleta",
  "Iluminação",
  "Saneamento",
  "Árvores",
  "Animais",
  "Pavimentação"
];

export const statusDemanda = [ "Em aberto", "Em andamento", "Concluída" ];

export const enderecoSchema = z.object({
        logradouro: z.string().min(2, "O logradouro não pode ser vazio."),
        cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
        bairro: z.string().min(1, "O bairro não pode ser vazio."),
        numero: z.number().int().positive("O número deve ser inteiro e positivo."),
        complemento: z.string().optional(),
        cidade: z.string().min(2, "A cidade não pode ser vazia."),
        estado: z.string().refine(val => estadosBrasil.includes(val), {
          message: "Estado inválido."
        })
      });

const DemandaSchema = z.object ({
    tipo: z.string().refine((val) => tiposDemanda.includes(val), {
      message: "Tipo inválido",
    }),
    status: z.string().refine((val) => statusDemanda.includes(val), {
    message: "Status inválido",
    })
    .optional(),
    data: z
      .string()
      .optional(),
    resolucao: z
      .string()
      .optional(),
    feedback:z
      .number()
      .optional(),
    avaliacao_resolucao: z
      .string()
      .optional(),
    descricao: z
      .string()
      .min(2, "A descrição não pode ser vazia."),
    link_imagem: z
      .string()
      .regex(/\.(jpg|jpeg|png|webp|svg|gif)$/i, {
      message: "Deve ser um link de imagem com extensão válida (jpg, png, etc)."
      })
      .optional(),
    motivo_devolucao: z
      .string()
      .optional(),
    link_imagem_resolucao: z
      .string()
      .regex(/\.(jpg|jpeg|png|webp|svg|gif)$/i, {
      message: "Deve ser um link de imagem com extensão válida (jpg, png, etc)."
      })
      .optional(),
    endereco: enderecoSchema,
    secretarias: z.array(
      z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "ID inválido",
      })
    )
    .optional(),
    usuarios: z.array(
      z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "ID inválido",
      })
    )
    .optional(),
    secretarias: z.array(
      z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "ID inválido",
      })
    )
    .optional()
})

const DemandaUpdateSchema = DemandaSchema.partial();

export { DemandaUpdateSchema, DemandaSchema };