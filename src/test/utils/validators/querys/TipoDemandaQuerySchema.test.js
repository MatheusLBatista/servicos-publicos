// tests/unit/schemas/TipoDemandaQuerySchema.test.js

import { TipoDemandaQuerySchema, TipoDemandaIDSchema } from '../../../../utils/validators/schemas/zod/querys/TipoDemandaQuerySchema.js';
import mongoose from 'mongoose';

describe('TipoDemandaQuerySchema', () => {
  describe('TipoDemandaIDSchema', () => {
    it('deve validar um ObjectId válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = TipoDemandaIDSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar um ObjectId inválido', () => {
      const invalidIds = ['123', '60d5f484f1c2b8a0b8c8e4e', 'id-invalido'];
      invalidIds.forEach(id => {
        const result = TipoDemandaIDSchema.safeParse(id);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("ID inválido");
      });
    });
  });

  describe('TipoDemandaQuerySchema', () => {
    it('deve aceitar query vazia', () => {
      const result = TipoDemandaQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    describe('Validação de Titulo', () => {
      it('deve aceitar título válido', () => {
        const result = TipoDemandaQuerySchema.safeParse({ titulo: " Demanda " });
        expect(result.success).toBe(true);
        expect(result.data.titulo).toBe("Demanda");
      });

      it('deve rejeitar título vazio', () => {
        const result = TipoDemandaQuerySchema.safeParse({ titulo: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Titulo não pode ser vazio");
      });
    });

    describe('Validação de Descrição', () => {
      it('deve aceitar descrição válida', () => {
        const result = TipoDemandaQuerySchema.safeParse({ descricao: " Teste " });
        expect(result.success).toBe(true);
        expect(result.data.descricao).toBe("Teste");
      });

      it('deve rejeitar descrição vazia', () => {
        const result = TipoDemandaQuerySchema.safeParse({ descricao: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Descrição não pode ser vazio");
      });
    });

    describe('Validação de Subdescrição', () => {
      it('deve aceitar subdescrição válida', () => {
        const result = TipoDemandaQuerySchema.safeParse({ subdescricao: " Sub " });
        expect(result.success).toBe(true);
        expect(result.data.subdescricao).toBe("Sub");
      });

      it('deve rejeitar subdescrição vazia', () => {
        const result = TipoDemandaQuerySchema.safeParse({ subdescricao: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Subdescrição não pode ser vazio");
      });
    });

    describe('Validação de Tipo', () => {
      it('deve aceitar tipo válido', () => {
        const result = TipoDemandaQuerySchema.safeParse({ tipo: " Reparo " });
        expect(result.success).toBe(true);
        expect(result.data.tipo).toBe("Reparo");
      });

      it('deve rejeitar tipo vazio', () => {
        const result = TipoDemandaQuerySchema.safeParse({ tipo: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Tipo não pode ser vazio");
      });
    });

    describe('Validação de Icone e Link de Imagem', () => {
      it('deve aceitar URLs de imagens válidas', () => {
        const imagensValidas = [
          "http://exemplo.com/imagem.jpg",
          "https://exemplo.com/img.png",
          "/static/icon.svg"
        ];
        imagensValidas.forEach(url => {
          const resultIcone = TipoDemandaQuerySchema.safeParse({ icone: url });
          const resultLink = TipoDemandaQuerySchema.safeParse({ link_imagem: url });
          expect(resultIcone.success).toBe(true);
          expect(resultLink.success).toBe(true);
        });
      });

      it('deve rejeitar URLs de imagens inválidas', () => {
        const imagensInvalidas = [
          "http://exemplo.com/documento.pdf",
          "imagemsemextensao",
          "imagem.txt"
        ];
        imagensInvalidas.forEach(url => {
          const resultIcone = TipoDemandaQuerySchema.safeParse({ icone: url });
          const resultLink = TipoDemandaQuerySchema.safeParse({ link_imagem: url });
          expect(resultIcone.success).toBe(false);
          expect(resultLink.success).toBe(false);
          expect(resultIcone.error.issues[0].message).toBe('A URL deve apontar para uma imagem válida (jpg, png, etc).');
        });
      });
    });

    it('deve aceitar múltiplos parâmetros combinados', () => {
      const result = TipoDemandaQuerySchema.safeParse({
        titulo: " Solicitação ",
        descricao: " Descrição válida ",
        tipo: " Tipo válido ",
        icone: "http://site.com/imagem.png",
        link_imagem: "https://outro.com/imagem.jpg",
        subdescricao: " Subdescrição válida "
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        titulo: "Solicitação",
        descricao: "Descrição válida",
        tipo: "Tipo válido",
        icone: "http://site.com/imagem.png",
        link_imagem: "https://outro.com/imagem.jpg",
        subdescricao: "Subdescrição válida"
      });
    });
  });
});