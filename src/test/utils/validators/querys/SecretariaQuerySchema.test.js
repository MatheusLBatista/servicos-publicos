import { SecretariaQuerySchema, SecretariaIDSchema } from '../../../../utils/validators/schemas/zod/querys/SecretariaQuerySchema.js';
import mongoose from 'mongoose';

describe('SecretariaQuerySchema', () => {
  describe('SecretariaIDSchema', () => {
    it('deve validar um ObjectId válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = SecretariaIDSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar um ObjectId inválido', () => {
      const invalidIds = ['123', '60d5f484f1c2b8a0b8c8e4e', 'inválido'];
      invalidIds.forEach(id => {
        const result = SecretariaIDSchema.safeParse(id);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("ID inválido");
      });
    });
  });

  describe('SecretariaQuerySchema', () => {
    it('deve aceitar query vazia', () => {
      const result = SecretariaQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    describe('Validação de Nome', () => {
      it('deve aceitar nome válido', () => {
        const result = SecretariaQuerySchema.safeParse({ nome: " Educação " });
        expect(result.success).toBe(true);
        expect(result.data.nome).toBe("Educação"); // Testa o trim()
      });

      it('deve rejeitar nome vazio', () => {
        const result = SecretariaQuerySchema.safeParse({ nome: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Nome não pode ser vazio");
      });
    });

    describe('Validação de Email', () => {
      it('deve aceitar email válido', () => {
        const result = SecretariaQuerySchema.safeParse({ email: "teste@exemplo.com" });
        expect(result.success).toBe(true);
      });

      it('deve aceitar undefined', () => {
        const result = SecretariaQuerySchema.safeParse({ email: undefined });
        expect(result.success).toBe(true);
      });

      it('deve rejeitar email inválido', () => {
        const result = SecretariaQuerySchema.safeParse({ email: "email-invalido" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Formato de email inválido");
      });
    });

    describe('Validação de Sigla', () => {
      it('deve aceitar sigla válida', () => {
        const result = SecretariaQuerySchema.safeParse({ sigla: " SEC " });
        expect(result.success).toBe(true);
        expect(result.data.sigla).toBe("SEC"); // Testa o trim()
      });

      it('deve rejeitar sigla vazia', () => {
        const result = SecretariaQuerySchema.safeParse({ sigla: " " });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Sigla não pode ser vazio");
      });
    });

    it('deve aceitar combinação de parâmetros', () => {
      const result = SecretariaQuerySchema.safeParse({
        nome: " Saúde ",
        email: "saude@exemplo.com",
        sigla: " SES "
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        nome: "Saúde",
        email: "saude@exemplo.com",
        sigla: "SES"
      });
    });
  });
});