// src/utils/validators/schemas/zod/GrupoSchema.js
import { z } from 'zod';

// Schema de cada item da permissão
const PermissaoSchema = z.object({
  rota: z.string().nonempty('Campo rota é obrigatório.'),
  dominio: z.string().nonempty('Campo domínio é obrigatório.'),
  ativo: z.boolean().optional(),
  buscar: z.boolean().optional(),
  enviar: z.boolean().optional(),
  substituir: z.boolean().optional(),
  modificar: z.boolean().optional(),
  excluir: z.boolean().optional(),
});

// Validação para array de permissões sem rota + domínio duplicados
const PermissaoArraySchema = z
  .array(PermissaoSchema)
  .refine((permissoes) => {
    const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio || ''}`);
    const set = new Set(combinacoes);
    return set.size === combinacoes.length;
  }, {
    message: 'Permissões duplicadas encontradas: rota + domínio devem ser únicas dentro de cada grupo.',
  });

const GrupoSchema = z.object({
  nome: z.string().nonempty('Campo nome é obrigatório.'),
  descricao: z.string().nonempty('Campo descrição é obrigatório.'),
  ativo: z.boolean().optional(), 
  permissoes: PermissaoArraySchema, 
});

const GrupoUpdateSchema = GrupoSchema.partial();

export { GrupoSchema, GrupoUpdateSchema };
