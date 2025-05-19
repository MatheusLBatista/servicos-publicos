import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Secretaria {
    constructor() {
        const secretariaSchema = new mongoose.Schema(
            {
                nome: { type: String, required: [true, "O nome da secretaria é obrigatório!"]}, 
                permissoes: [
                {
                    rota: { type: String, index: true, required: true },
                    dominio: { type: String, default: "" },           
                    ativo: { type: Boolean, default: false },
                    buscar: { type: Boolean, default: false },
                    enviar: { type: Boolean, default: false },
                    substituir: { type: Boolean, default: false },
                    modificar: { type: Boolean, default: false },
                    excluir: { type: Boolean, default: false },
                }
                ]
            },

            {
                timestamps: true,
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        secretariaSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
            const setCombinacoes = new Set(combinacoes);

            if (combinacoes.length !== setCombinacoes.size) {
                return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
            }

            next();
        });


        secretariaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('secretarias', secretariaSchema);
    }
}

export default new Secretaria().model;