import { DemandaSchema, DemandaUpdateSchema } from '../../../utils/validators/schemas/zod/DemandaSchema';
import mongoose from 'mongoose';

const validObjectId = () => new mongoose.Types.ObjectId().toString();

const validDemanda = {
  tipo: "Coleta",
  status: "Em aberto",
  data: "2025-06-01T00:00:00Z",
  endereco: {
    logradouro: "Rua Exemplo",
    cep: "12345-678",
    bairro: "Centro",
    numero: 123,
    cidade: "Vilhena",
    estado: "RO"
  },
  usuarios: [
    { id: validObjectId() }
  ],
  resolucao: "Resolvido com sucesso.",
  feedback: 4,
  avaliacao_resolucao: "Ótima",
  link_imagem: "https://exemplo.com/imagem.jpg",
  motivo_devolucao: "Dados incompletos",
  link_imagem_resolucao: "https://exemplo.com/imagem_resolucao.png"
};

describe('DemandaSchema', () => {
  it('valida uma demanda completa válida', () => {
    const result = DemandaSchema.safeParse(validDemanda);
    expect(result.success).toBe(true);
  });

  it('rejeita tipo inválido', () => {
    const invalid = { ...validDemanda, tipo: "Errado" };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Tipo inválido");
  });

  it('rejeita status inválido', () => {
    const invalid = { ...validDemanda, status: "Fechado" };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Status inválido");
  });

  it('rejeita CEP inválido', () => {
    const invalid = { ...validDemanda, endereco: { ...validDemanda.endereco, cep: "123" } };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("CEP inválido");
  });

  it('rejeita estado inválido', () => {
    const invalid = { ...validDemanda, endereco: { ...validDemanda.endereco, estado: "ZZ" } };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Estado inválido");
  });

  it('rejeita imagem com extensão inválida', () => {
    const invalid = { ...validDemanda, link_imagem: "https://exemplo.com/arquivo.pdf" };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("extensão válida");
  });

  it('rejeita usuários com ObjectIds repetidos', () => {
    const id = validObjectId(); 
    const invalid = {
      ...validDemanda,
      usuarios: [{ id }, { id }] 
    };
    const result = DemandaSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Não pode conter ids repetidos");
  });
});

describe('DemandaUpdateSchema', () => {
  it('aceita objeto vazio (tudo opcional)', () => {
    const result = DemandaUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('valida um update parcial válido', () => {
    const update = {
      status: "Concluída",
      feedback: 5
    };
    const result = DemandaUpdateSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it('rejeita update parcial com tipo inválido', () => {
    const update = { tipo: "Errado" };
    const result = DemandaUpdateSchema.safeParse(update);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Tipo inválido");
  });
});
