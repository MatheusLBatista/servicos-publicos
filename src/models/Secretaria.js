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

        secretariaSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('secretarias', secretariaSchema);
    }
}

export default new Secretaria().model;