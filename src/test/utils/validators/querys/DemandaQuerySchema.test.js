import {
  DemandaQuerySchema,
  enderecoSchema,
} from "../../../../utils/validators/schemas/zod/querys/DemandaQuerySchema.js";
import mongoose from "mongoose";

describe("DemandaQuerySchema", () => {
  describe("Campos opcionais", () => {
    it("deve aceitar um objeto vazio", () => {
      const result = DemandaQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limite).toBe(10);
      }
    });

    it("deve validar page e limite com transformação para número", () => {
      const input = {
        page: "5",
        limite: "20",
      };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limite).toBe(20);
      }
    });
  });

  describe("Validação de tipo (enum)", () => {
    it("deve aceitar tipo válido", () => {
      const input = { tipo: "Coleta" };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.tipo).toBe("Coleta");
    });

    it("deve rejeitar tipo inválido", () => {
      const input = { tipo: "Inexistente" };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toMatch(/Invalid enum value/);
    });
  });

  describe("Validação de status (enum)", () => {
    it("deve aceitar status válido", () => {
      const input = { status: "Em aberto" };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe("Em aberto");
    });

    it("deve rejeitar status inválido", () => {
      const input = { status: "Finalizado" };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toMatch(/Invalid enum value/);
    });
  });

  describe("Validação de usuários (ObjectId)", () => {
    it("deve aceitar usuário com ObjectId válido", () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = DemandaQuerySchema.safeParse({ usuarios: validId });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.usuarios).toBe(validId);
    });

    it("deve rejeitar usuário com ObjectId inválido", () => {
      const invalidId = "123abc";
      const result = DemandaQuerySchema.safeParse({ usuarios: invalidId });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toBe(
          "Usuário inválido. Tente novamente!"
        );
    });
  });

  describe("Validação de datas", () => {
    it("deve aceitar datas strings opcionais", () => {
      const input = {
        data_inicio: "2023-01-01",
        data_fim: "2023-12-31",
      };
      const result = DemandaQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data_inicio).toBe("2023-01-01");
        expect(result.data.data_fim).toBe("2023-12-31");
      }
    });

    it("deve aceitar ausência de datas", () => {
      const result = DemandaQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("Validação de page e limite", () => {
    it("deve rejeitar page menor que 1", () => {
      const result = DemandaQuerySchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toBe(
          "Page deve ser um número inteiro maior que 0"
        );
    });

    it("deve rejeitar limite menor que 1", () => {
      const result = DemandaQuerySchema.safeParse({ limite: "0" });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toBe(
          "Limite deve ser um número inteiro entre 1 e 100"
        );
    });

    it("deve rejeitar limite maior que 100", () => {
      const result = DemandaQuerySchema.safeParse({ limite: "101" });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toBe(
          "Limite deve ser um número inteiro entre 1 e 100"
        );
    });

    it("deve usar valores padrão se não passados", () => {
      const result = DemandaQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limite).toBe(10);
      }
    });
  });

  describe("Validação de secretarias (ObjectId)", () => {
    it("deve aceitar secretaria com ObjectId válido", () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const result = DemandaQuerySchema.safeParse({ secretarias: validId });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.secretarias).toBe(validId);
    });

    it("deve rejeitar secretaria com ObjectId inválido", () => {
      const invalidId = "abc123";
      const result = DemandaQuerySchema.safeParse({ secretarias: invalidId });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toBe(
          "Secretaria inválida. Tente novamente!"
        );
    });
  });
});
