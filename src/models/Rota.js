// models/Rota.js
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Rota {
  constructor() {
    const rotaSchema = new mongoose.Schema(
      {
        rota: { type: String, required: true, index: true, trim: true, lowercase: true },  // ex: "usuarios"
        dominio: { type: String, required: true, default: 'localhost' },                  // ex: "localhost"
        ativo: { type: Boolean, default: true },       // true por padrão
        buscar: { type: Boolean, default: false },     // GET
        enviar: { type: Boolean, default: false },     // POST
        substituir: { type: Boolean, default: false }, // PUT
        modificar: { type: Boolean, default: false },  // PATCH
        excluir: { type: Boolean, default: false },    // DELETE
      },
      {
        timestamps: true,
        versionKey: false
      }
    );

    // índice único combinando rota + dominio
    rotaSchema.index({ rota: 1, dominio: 1 }, { unique: true });

    // Plugin de paginação
    rotaSchema.plugin(mongoosePaginate);

    // Hook para garantir que rota está em minúsculas antes de salvar (redundante pois temos lowercase, mas ok)
    rotaSchema.pre('save', function (next) {
      if (this.rota) {
        this.rota = this.rota.toLowerCase();
      }
      next();
    });

    this.model = mongoose.model('rotas', rotaSchema);
  }
}

export default new Rota().model;
