import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Demanda {
    constructor() {
        const demandaSchema = new mongoose.Schema(
            {
                tipo: { type: String },
                status: { 
                    type: String,
                    enum: [ "Em aberto", "Em andamento", "Concluída" ],
                    default: "Em aberto"
                 },
                data: {type: Date },
                resolucao: { type: String },
                feedback: { type: Number },
                avaliacao_resolucao: { type: String },
                link_imagem: {
                    type: String,
                    default: "",
                    validate: {
                      validator: function(v) {
                        let validator = /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)$/.test(v)
                        return validator ;
                      },
                      message: props => `${props.value} não é um link de imagem válido!`
                    }
                },
                motivo_devolucao: { type: String },
                link_imagem_resolucao: {
                    type: String,
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
                    logradouro: { type: String },
                    cep: { type: String },
                    bairro: { type: String },
                    numero: { type: String },
                    complemento: { type: String },
                },

                //referência para usuários
                usuarios: [
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
        // demandaSchema.pre('save', function (next) {
        //     const permissoes = this.permissoes;
        //     const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
        //     const setCombinacoes = new Set(combinacoes);

        //     if (combinacoes.length !== setCombinacoes.size) {
        //         return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
        //     }

        //     next();
        // });


        demandaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('demandas', demandaSchema);
    }
}

export default new Demanda().model;