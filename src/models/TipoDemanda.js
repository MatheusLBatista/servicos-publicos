import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class TipoDemanda {
    constructor() {
        const tipoDemandaSchema = new mongoose.Schema(
            {
                titulo: { type: String, required: [true, "O título da demanda é obrigatório!"]},
                descricao: { type: String, required: [true, "A descrição da demanda é obrigatória!"]},
                link_imagem: {
                    type: String,
                    required: false,
                    default: "",
                    validate: {
                        validator: function (v) {
                            if (!v) return true; 
                            return /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(v);
                        },
                        message: props => `${props.value} não é um nome de imagem válido!`
                    }
                },
                icone: {
                    type: String,
                    required: false,
                    default: "",
                    validate: {
                    validator: function (v) {
                        if (!v) return true;
                        return /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(v);
                    },
                    message: props => `${props.value} não é um nome de imagem válido!`
                }
                },
                subdescricao: { type: String, required: [true, "A subdescrição da demanda é obrigatória!"]},
                tipo: { type: String, required: [true, "O tipo da demanda é obrigatório!"]},
            }, 
            {
                timestamps: true,
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        /*
        tipoDemandaSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
            const setCombinacoes = new Set(combinacoes);

            if (combinacoes.length !== setCombinacoes.size) {
                return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
            }

            next();
        });
        */

        tipoDemandaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('tipo_demandas', tipoDemandaSchema);
    }
}

export default new TipoDemanda().model;