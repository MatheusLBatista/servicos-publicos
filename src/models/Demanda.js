import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Demanda {
    constructor() {
        const demandaSchema = new mongoose.Schema(
            {
                tipo: { 
                    type: String,
                    enum: [ "Coleta", "Iluminação", "Saneamento", "Árvores", "Animais", "Pavimentação"]
                 },
                status: { 
                    type: String,
                    enum: [ "Em aberto", "Em andamento", "Concluída" ],
                    default: "Em aberto"
                 },
                data: {
                    type: Date, 
                    default: new Date() 
                },
                resolucao: { type: String },
                feedback: { type: Number },
                avaliacao_resolucao: { type: String },
                link_imagem: { type: String },
                descricao: { type: String },
                motivo_devolucao: { type: String },
                link_imagem_resolucao: { type: String },
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
                ],

                secretarias: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'secretarias',
                    }
                ]
            }, 
            {
                timestamps: true,
                versionKey: false
            }
        );

        demandaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('demandas', demandaSchema);
    }
}

export default new Demanda().model;