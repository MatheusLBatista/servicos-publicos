import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Demanda {
    constructor() {
        const demandaSchema = new mongoose.Schema(
            {
                id_demanda: { type: String, require: [true, "O ID da demanda é obrigatório!"]},
                tipo: { type: String, require: [true, "O tipo da demanda é obrigatório!"]}
            }
        )
    }
}

export default Demanda;