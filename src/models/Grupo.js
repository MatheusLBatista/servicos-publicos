// models/Grupo.js
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const permissaoSchema = new mongoose.Schema(
  {
    rota: { type: String, required: true, index: true },
    dominio: { type: String },
    ativo: { type: Boolean, default: false },
    buscar: { type: Boolean, default: false },
    enviar: { type: Boolean, default: false },
    substituir: { type: Boolean, default: false },
    modificar: { type: Boolean, default: false },
    excluir: { type: Boolean, default: false },
  }
);

const grupoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true, trim: true },
    descricao: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    permissoes: [permissaoSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Validação: rota + domínio únicos
grupoSchema.pre('save', function (next) {
  const permissoes = this.permissoes || [];
  const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio || ''}`);
  const setCombinacoes = new Set(combinacoes);

  if (combinacoes.length !== setCombinacoes.size) {
    return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicas dentro de cada grupo.'));
  }

  next();
});

grupoSchema.plugin(mongoosePaginate);

const Grupo = mongoose.model('Grupo', grupoSchema);
export default Grupo;