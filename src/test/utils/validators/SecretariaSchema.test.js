import { SecretariaSchema, SecretariaUpdateSchema, distinctObjectIdArray } from '../../../utils/validators/schemas/zod/SecretariaSchema.js';
import mongoose from 'mongoose';

describe('SecretariaSchema', () => {
  describe('Validação de Criação (SecretariaSchema)', () => {
    const dadosBase = {
      nome: "Secretaria da Educação",
      sigla: "SED",
      email: "educacao@exemplo.com",
      telefone: "(61) 99999-9999",
      tipo: "Iluminação"
    };

    it('deve passar com dados válidos', () => {
      const result = SecretariaSchema.safeParse(dadosBase);
      expect(result.success).toBe(true);
    });

    describe('Validação de Nome', () => {
      it('deve falhar quando nome estiver vazio', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, nome: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo nome é obrigatório.");
      });

      it('deve falhar quando nome tiver menos de 3 caracteres', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, nome: "AB" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Nome deve ter pelo menos 3 caracteres.");
      });
    });

    describe('Validação de Sigla', () => {
      it('deve falhar quando sigla estiver vazia', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, sigla: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo sigla é obrigatório.");
      });

      it('deve falhar quando sigla tiver menos de 2 caracteres', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, sigla: "A" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Sigla deve ter pelo menos 2 caracteres.");
      });
    });

    describe('Validação de Email', () => {
    it('deve falhar quando email estiver vazio', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, email: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo email é obrigatório.");
    });

    it('deve falhar quando email tiver menos de 5 caracteres', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, email: "a@b" }); 
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Email deve ter pelo menos 5 caracteres.");
    });

    it('deve falhar com formato de email inválido', () => {
        const casosInvalidos = [
        "email@", 
        "email.com", 
        "@exemplo.com", 
        "email@exemplo."
        ];

        casosInvalidos.forEach(email => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, email });
        expect(result.success).toBe(false);
        expect(result.error.issues.some(i => i.message === "Formato de email inválido.")).toBe(true);
        });
    });
    });

    describe('Validação de Telefone', () => {
    it('deve falhar quando telefone estiver vazio', () => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, telefone: "" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Campo telefone é obrigatório.");
    });

    it('deve falhar com formatos inválidos', () => {
        const casosInvalidos = [
        "123456789",           
        "(61) 999-9999",       
        "61 99999-9999",       
        "(61)99999-9999",      
        "(61) 99999-999",      
        "(61) 999999-9999",    
        "(61) 99999-99999"     
        ];

        casosInvalidos.forEach(telefone => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, telefone });
        expect(result.success).toBe(false);
        });
    });

    it('deve aceitar formatos válidos', () => {
        const casosValidos = [
        "(61) 9999-9999",      
        "(61) 99999-9999"      
        ];

        casosValidos.forEach(telefone => {
        const result = SecretariaSchema.safeParse({ ...dadosBase, telefone });
        expect(result.success).toBe(true);
        });
    });
    });
  });

  describe('Validação de Atualização (SecretariaUpdateSchema)', () => {
    it('deve permitir atualização parcial', () => {
      const casosParciais = [
        { nome: "Novo Nome" },
        { email: "novo@email.com" },
        { sigla: "NS" },
        { telefone: "(11) 88888-8888" }
      ];

      casosParciais.forEach(dados => {
        const result = SecretariaUpdateSchema.safeParse(dados);
        expect(result.success).toBe(true);
      });
    });

    it('deve manter validações para campos atualizados', () => {
      const casosInvalidos = [
        { nome: "AB" },  
        { email: "invalido" },
        { telefone: "123" }
      ];

      casosInvalidos.forEach(dados => {
        const result = SecretariaUpdateSchema.safeParse(dados);
        expect(result.success).toBe(false);
      });
    });

    it('deve permitir objeto vazio (nenhum campo atualizado)', () => {
      const result = SecretariaUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });


    describe('Validação de Array de ObjectIds', () => {
    it('deve aceitar array de ObjectIds únicos', () => {
        const validObjectIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
        ];
        
        const result = distinctObjectIdArray.safeParse(validObjectIds);
        expect(result.success).toBe(true);
    });

    it('deve rejeitar array com ObjectIds duplicados', () => {
        const duplicateId = new mongoose.Types.ObjectId().toString();
        const invalidArray = [duplicateId, duplicateId];
        
        const result = distinctObjectIdArray.safeParse(invalidArray);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("Não pode conter ids repetidos.");
    });

    it('deve rejeitar array com IDs inválidos', () => {
        const invalidArray = ["id-invalido", "outro-id-invalido"];
        
        const result = distinctObjectIdArray.safeParse(invalidArray);
        expect(result.success).toBe(false);
    });
    });
});