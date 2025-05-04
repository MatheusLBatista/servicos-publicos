import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class TipoDemanda {
    constructor() {
        const tipoDemandaSchema = new mongoose.Schema(
            {
                id_tipo_demanda: { type: String, required: [true, "O ID do tipo de demanda é obrigatório!"]},
                titulo: { type: String, required: [true, "O título da demanda é obrigatório!"]},
                descricao: { type: String, required: [true, "A descrição da demanda é obrigatória!"]},
                link_imagem_fundo: {
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
                icone: { type: String, required: [true, "A referência do ícone é obrigatória!"]},
                subdescricao: { type: String, required: [true, "A subdescrição da demanda é obrigatória!"]},
                tipo: { type: String, required: [true, "O tipo da demanda é obrigatório!"]},
            }
        );

        demandaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('tipo_demanda', tipoDemandaSchema);
    }
}

export default TipoDemanda;