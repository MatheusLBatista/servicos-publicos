import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const estadosBrasil = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
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
        tokenUnico: { type: String, select: false },
        refreshtoken: { type: String, select: false },
        accesstoken: { type: String, select: false },
        codigo_recupera_senha: { type: String, select: false, unique: false },
        exp_codigo_recupera_senha: { type: Date, select: false },
        grupo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Grupo',
        },
        secretarias: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "secretarias",
          },
        ],
      },
      {
        timestamps: true,
        versionKey: false,
      }
    )

    usuarioSchema.plugin(mongoosePaginate);

    this.model =
      mongoose.models.usuarios || mongoose.model("usuarios", usuarioSchema);
  }
}

export default new Usuario().model;
