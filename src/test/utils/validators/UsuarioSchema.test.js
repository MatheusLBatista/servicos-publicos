import { UsuarioSchema, UsuarioUpdateSchema } from '../../../utils/validators/schemas/zod/UsuarioSchema.js';

describe('UsuarioSchema', () => {
  const dadosBase = {
    nome: "Maria da Silva",
    email: "maria@exemplo.com",
    senha: "Senha@123",
    link_imagem: "http://foto.com/maria.png",
    ativo: true,
    nome_social: "Maria",
    cpf: "12345678901",
    celular: "11987654321",
    cnh: "12345678901",
    data_nomeacao: new Date().toISOString(),
    cargo: "Professora",
    formacao: "Pedagogia",
    nivel_acesso: {
      operador: true,
      administrador: false,
      secretario: false,
      municipe: true
    },
    portaria_nomeacao: "PORT123",
    endereco: {
      logradouro: "Rua das Flores",
      cep: "12345-678",
      bairro: "Centro",
      numero: 123,
      cidade: "São Paulo",
      estado: "SP"
    }
  };

  it('deve validar com dados completos e válidos', () => {
    const result = UsuarioSchema.safeParse(dadosBase);
    expect(result.success).toBe(true);
  });

  it('deve falhar se secretarias contiver ID inválido', () => {
    const invalido = { ...dadosBase, secretarias: ['1234'] };
    const result = UsuarioSchema.safeParse(invalido);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("ID inválido");
  });

  it('deve validar secretarias com IDs válidos', () => {
    const valido = { ...dadosBase, secretarias: ['507f1f77bcf86cd799439011'] };
    expect(UsuarioSchema.safeParse(valido).success).toBe(true);
  });

  it('deve falhar se grupo contiver ID inválido', () => {
    const invalido = { ...dadosBase, grupo: ['1234'] };
    const result = UsuarioSchema.safeParse(invalido);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("ID inválido");
  });

  it('deve validar grupo com IDs válidos', () => {
    const valido = { ...dadosBase, grupo: ['507f1f77bcf86cd799439011'] };
    expect(UsuarioSchema.safeParse(valido).success).toBe(true);
  });


  describe('Validação da senha', () => {
    it('deve falhar se senha não tiver caractere especial', () => {
      const result = UsuarioSchema.safeParse({ ...dadosBase, senha: "Senha123" });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/A senha deve conter/);
    });

    it('deve permitir senha ausente (campo opcional)', () => {
      const { senha, ...dadosSemSenha } = dadosBase;
      const result = UsuarioSchema.safeParse(dadosSemSenha);
      expect(result.success).toBe(true);
    });
  });

  describe('Validações de CPF, celular e CNH', () => {
    const campos = ['cpf', 'celular', 'cnh'];
    campos.forEach((campo) => {
      it(`deve falhar se ${campo} não tiver 11 dígitos`, () => {
        const result = UsuarioSchema.safeParse({ ...dadosBase, [campo]: "12345" });
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toMatch(/11 dígitos/);
      });
    });
  });

  describe('Validações do endereço', () => {
    it('deve falhar se o estado for inválido', () => {
      const result = UsuarioSchema.safeParse({
        ...dadosBase,
        endereco: { ...dadosBase.endereco, estado: "XX" }
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Invalid enum value. Expected 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO', received 'XX'");
    });

    it('deve falhar com CEP inválido', () => {
      const result = UsuarioSchema.safeParse({
        ...dadosBase,
        endereco: { ...dadosBase.endereco, cep: "1234" }
      });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("CEP inválido");
    });
  });
});
