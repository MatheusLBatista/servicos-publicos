import { TipoDemandaSchema, TipoDemandaUpdateSchema } from '../../../utils/validators/schemas/zod/TipoDemandaSchema.js';

describe('TipoDemandaSchema', () => {
  const dadosBase = {
    titulo: "Iluminação Pública",
    descricao: "Solicitação para troca de lâmpadas queimadas.",
    subdescricao: "Lâmpadas estão queimadas há semanas.",
    icone: "icone.png",
    link_imagem: "imagem.jpg",
    tipo: "Infraestrutura"
  };

  describe('Validação de Criação (TipoDemandaSchema)', () => {
    it('deve passar com dados válidos', () => {
      const result = TipoDemandaSchema.safeParse(dadosBase);
      expect(result.success).toBe(true);
    });

    describe('Validação de Titulo', () => {
      it('deve falhar com titulo vazio', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, titulo: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo Titulo é obrigatório.");
      });

      it('deve falhar com titulo muito curto', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, titulo: "AB" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo Titulo é obrigatório.");
      });
    });

    describe('Validação de Tipo', () => {
      it('deve falhar com tipo vazio', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, tipo: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo Tipo é obrigatório.");
      });

      it('deve falhar com tipo muito curto', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, tipo: "A" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo Tipo é obrigatório.");
      });
    });

    describe('Validação de Descrição e Subdescrição', () => {
      it('deve falhar com descrição vazia ou só espaços', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, descricao: "   " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Descrição é obrigatória");
      });

      it('deve falhar com subdescrição vazia ou só espaços', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, subdescricao: "   " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Subdescrição é obrigatória");
      });
    });

    describe('Validação de URLs de Imagens (icone e link_imagem)', () => {
      it('deve falhar se icone não for imagem', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, icone: "arquivo.txt" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("A URL deve apontar para uma imagem válida (jpg, png, etc).");
      });

      it('deve falhar se link_imagem não for imagem', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, link_imagem: "documento.pdf" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("A URL deve apontar para uma imagem válida (jpg, png, etc).");
      });

      it('deve passar se icone e link_imagem forem vazios', () => {
        const result = TipoDemandaSchema.safeParse({ ...dadosBase, icone: "", link_imagem: "" });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validação de Atualização (TipoDemandaUpdateSchema)', () => {
    it('deve permitir atualização parcial com campos válidos', () => {
      const casosParciais = [
        { titulo: "Novo Título" },
        { descricao: "Nova descrição" },
        { subdescricao: "Nova subdescrição" },
        { tipo: "Novo Tipo" },
        { icone: "icone.jpg" },
        { link_imagem: "imagem.gif" }
      ];

      casosParciais.forEach(dados => {
        const result = TipoDemandaUpdateSchema.safeParse(dados);
        expect(result.success).toBe(true);
      });
    });

    it('deve falhar com campos inválidos mesmo em atualização', () => {
      const casosInvalidos = [
        { titulo: "" },
        { tipo: "A" },
        { descricao: "   " },
        { subdescricao: "" },
        { icone: "arquivo.doc" },
        { link_imagem: "img.zip" }
      ];

      casosInvalidos.forEach(dados => {
        const result = TipoDemandaUpdateSchema.safeParse(dados);
        expect(result.success).toBe(false);
      });
    });

    it('deve permitir objeto vazio (nenhum campo atualizado)', () => {
      const result = TipoDemandaUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});