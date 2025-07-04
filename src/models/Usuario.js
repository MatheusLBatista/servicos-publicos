import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { boolean } from "zod";

export const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

class Usuario {
  constructor() {
    const usuarioSchema = new mongoose.Schema(
      {
        cpf: { type: String, unique: true },
        email: { type: String, unique: true },
        celular: { type: String },
        cnh: { type: String, unique: true },
        data_nomeacao: { type: Date },
        cargo: { type: String },
        formacao: { type: String },
        link_imagem: { type: String },
        nivel_acesso: {
          type: {
            municipe: { type: Boolean, default: true },
            operador: { type: Boolean },
            secretario: { type: Boolean },
            administrador: { type: Boolean },
          },
        },
        nome: { type: String },
        ativo: { type: Boolean, default: true },
        nome_social: { type: String },
        portaria_nomeacao: { type: String },
        senha: { type: String, select: false },
        endereco: {
          logradouro: { type: String },
          cep: { type: String },
          bairro: { type: String },
          numero: { type: String },
          complemento: { type: String },
          cidade: { type: String },
          estado: { type: String, enum: estadosBrasil },
        },
        tokenUnico: { type: String, select: false }, // Token único para validação de email, recuperação de senha e autenticação
        refreshtoken: { type: String, select: false },
        accesstoken: { type: String, select: false },

        codigo_recupera_senha: { type: String, select: false, unique: false }, // Código de recuperação de senha, usado para validar a recuperação de senha do usuário
        exp_codigo_recupera_senha: { type: Date, select: false }, // Data de expiração do código de recuperação de senha, usado para validar a recuperação de senha do usuário
        secretarias: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "secretarias",
          },
        ]
      },
      {
        timestamps: true,
        versionKey: false,
      }
    );

    // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
    // usuarioSchema.pre('save', function (next) {
    //     const permissoes = this.permissoes;
    //     const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
    //     const setCombinacoes = new Set(combinacoes);

    //     if (combinacoes.length !== setCombinacoes.size) {
    //         return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
    //     }

    //     next();
    // });

    usuarioSchema.plugin(mongoosePaginate);
    this.model =
      mongoose.models.usuarios || mongoose.model("usuarios", usuarioSchema);
  }
}

export default new Usuario().model;
