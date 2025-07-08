import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Secretaria {
    constructor() {
        const secretariaSchema = new mongoose.Schema(
            {
                nome: { type: String }, 
                sigla: { type: String },
                email: { type: String },
                telefone: { type: String },
                tipo: { type: String }
            },

            {
                timestamps: true,
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        /*
        secretariaSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
            const setCombinacoes = new Set(combinacoes);

            if (combinacoes.length !== setCombinacoes.size) {
                return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
            }

            next();
        });
        */

        secretariaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('secretarias', secretariaSchema);
    }
}

export default new Secretaria().model;