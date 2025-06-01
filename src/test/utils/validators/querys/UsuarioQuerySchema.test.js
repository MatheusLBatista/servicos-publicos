import { UsuarioQuerySchema, UsuarioIdSchema } from '../../../../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import mongoose from 'mongoose';

describe('UsuarioQuerySchema', () => {
  describe('UsuarioIdSchema', () => {
    it('deve validar um ObjectId válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = UsuarioIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar um ObjectId inválido', () => {
      const invalidIds = ['123', 'abcdef', 'invalid'];
      invalidIds.forEach(id => {
        const result = UsuarioIdSchema.safeParse(id);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("ID inválido");
      });
    });
  });

  describe('UsuarioQuerySchema', () => {
    it('deve aceitar query vazia', () => {
      const result = UsuarioQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    describe('Validação de nome', () => {
      it('deve aceitar nome válido com espaços', () => {
        const result = UsuarioQuerySchema.safeParse({ nome: " Ana Maria " });
        expect(result.success).toBe(true);
        expect(result.data.nome).toBe("Ana Maria");
      });

      it('deve rejeitar nome vazio', () => {
        const result = UsuarioQuerySchema.safeParse({ nome: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Nome não pode ser vazio");
      });
    });

    describe('Validação de email', () => {
      it('deve aceitar email válido', () => {
        const result = UsuarioQuerySchema.safeParse({ email: "usuario@email.com" });
        expect(result.success).toBe(true);
      });

      it('deve aceitar email undefined', () => {
        const result = UsuarioQuerySchema.safeParse({ email: undefined });
        expect(result.success).toBe(true);
      });

      it('deve rejeitar email inválido', () => {
        const result = UsuarioQuerySchema.safeParse({ email: "usuarioemail.com" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Formato de email inválido.");
      });
    });

    describe('Validação de formação e cargo', () => {
      it('deve aceitar formação e cargo válidos com espaços', () => {
        const result = UsuarioQuerySchema.safeParse({ formacao: " Engenharia ", cargo: " Professor " });
        expect(result.success).toBe(true);
        expect(result.data.formacao).toBe("Engenharia");
        expect(result.data.cargo).toBe("Professor");
      });

      it('deve rejeitar formação vazia', () => {
        const result = UsuarioQuerySchema.safeParse({ formacao: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Formação não pode ser vazio.");
      });

      it('deve rejeitar cargo vazio', () => {
        const result = UsuarioQuerySchema.safeParse({ cargo: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Cargo não pode ser vazio.");
      });
    });

    describe('Validação de nivel_acesso', () => {
      const niveisValidos = ['municipe', 'secretario', 'secretário', 'munícipe', 'operador', 'administrador'];

      niveisValidos.forEach((nivel) => {
        it(`deve aceitar nível de acesso válido: "${nivel}"`, () => {
          const result = UsuarioQuerySchema.safeParse({ nivel_acesso: nivel });
          expect(result.success).toBe(true);
        });
      });

      it('deve rejeitar nível de acesso inválido', () => {
        const result = UsuarioQuerySchema.safeParse({ nivel_acesso: 'invalido' });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Nível de acesso inválido.");
      });
    });

    describe('Validação de paginação', () => {
      it('deve aceitar valores válidos para page e limite', () => {
        const result = UsuarioQuerySchema.safeParse({ page: '2', limite: '20' });
        expect(result.success).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.limite).toBe(20);
      });

      it('deve usar valores padrão se omitidos', () => {
        const result = UsuarioQuerySchema.safeParse({});
        expect(result.success).toBe(true);
        expect(result.data.page).toBe(1);
        expect(result.data.limite).toBe(10);
      });

      it('deve rejeitar page inválido', () => {
        const result = UsuarioQuerySchema.safeParse({ page: '0' });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Page deve ser um número inteiro maior que 0");
      });

      it('deve rejeitar limite fora da faixa', () => {
        const result = UsuarioQuerySchema.safeParse({ limite: '200' });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Limite deve ser um número inteiro entre 1 e 100");
      });
    });

    it('deve aceitar combinação de parâmetros válidos', () => {
      const result = UsuarioQuerySchema.safeParse({
        nome: " João ",
        email: "joao@exemplo.com",
        formacao: " TI ",
        cargo: " Analista ",
        nivel_acesso: "Administrador",
        ativo: true,
        page: "3",
        limite: "15"
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        nome: "João",
        email: "joao@exemplo.com",
        formacao: "TI",
        cargo: "Analista",
        nivel_acesso: "administrador",
        ativo: true,
        page: 3,
        limite: 15
      });
    });
  });
});
