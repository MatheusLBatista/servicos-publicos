import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Demanda {
    constructor() {
        const demandaSchema = new mongoose.Schema(
            {
                tipo: { type: String, required: [true, "O tipo da demanda é obrigatório!"]},
                status: { 
                    type: String,
                    enum: [ "Em aberto", "Em andamento", "Concluída" ],
                    required: [true, "O status da demanda é obrigatório!"],
                    default: "Em aberto"
                 },
                data: {type: Date, required: [true, "A data é obrigatória!"]},
                resolucao: { type: String, required: false },
                feedback: { type: Number, required: false },
                avaliacao_resolucao: { type: String, required: false },
                link_imagem: {
                    type: String,
                    required: false,
                    default: "",
                    validate: {
                      validator: function(v) {
                        let validator = /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)$/.test(v)
                        return validator ;
                      },
                      message: props => `${props.value} não é um link de imagem válido!`
                    }
                },
                motivo_devolucao: { type: String, required: false },
                link_imagem_resolucao: {
                    type: String,
                    required: false,
                    default: "",
                    validate: {
                      validator: function(v) {
                        let validator = /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)$/.test(v)
                        return validator ;
                      },
                      message: props => `${props.value} não é um link de imagem válido!`
                    }
                },
                endereco: {
                    logradouro: { type: String, required: [true, "O logradouro é obrigatório!"]},
                    cep: { type: String, required: [true, "O CEP é obrigatório!"]},
                    bairro: { type: String, required: [true, "O bairro é obrigatório!"]},
                    numero: { type: String, required: [true, "O número é obrigatório!"]},
                    complemento: { type: String, required: [true, "O complemento é obrigatório!"]}
                },

                //referência para usuários
                usuario: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'usuarios'
                    }
                ]
            }, 
            {
                timestamps: true,
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        demandaSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
            const setCombinacoes = new Set(combinacoes);

            if (combinacoes.length !== setCombinacoes.size) {
                return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
            }

            next();
        });


        demandaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('demanda', demandaSchema);
    }
}

export default Demanda;