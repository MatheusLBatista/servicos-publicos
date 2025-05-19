import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

class Usuario {
    constructor() {
        const usuarioSchema = new mongoose.Schema(
            {
                cpf: { type: String, required: [true, "O CPF do usuário é obrigatório!"] },
                email: { type: String, required: [true, "O email do usuário é obrigatório!"] },
                celular: { type: String, required: [true, "O celular do usuário é obrigatório!"] },
                cnh: { type: String, required: [false, "A CNH do usuário não é obrigatória!"] },
                data_nomeacao: { type: Date, required: [false, "A data de nomeação não é obrigatório!"] },
                cargo: { type: String, required: [false, "O cargo do usuário não é obrigatório!"] },
                formacao: { type: String, required: [false, "A formação do usuário não é obrigatório!"] },
                nivel_acesso: {
                    type: {
                        municipe: { type: Boolean, required: true, default: true },
                        operador: { type: Boolean, required: true, default: false },
                        administrador: { type: Boolean, required: true, default: false }
                    }, required: [ true, "O nível de acesso do usuário é obrigatório!"]
                },
                nome: { type: String, required: [true, "O nome do usuário é obrigatório!"] },
                nome_social: { type: String, required: [false, "O nome social do usuário não é obrigatório!"] },
                portaria_nomeacao: { type: String, required: [false, "A portaria de nomeação do usuário não é obrigatória!"] },
                senha: { type: String, required: [true, "A senha do usuário é obrigatória!"] },
                endereco: {
                    logradouro: { type: String, required: [true, "O logradouro é obrigatório!"]},
                    cep: { type: String, required: [true, "O CEP é obrigatório!"]},
                    bairro: { type: String, required: [true, "O bairro é obrigatório!"]},
                    numero: { type: String, required: [true, "O número é obrigatório!"]},
                    complemento: { type: String, required: [true, "O complemento é obrigatório!"]},
                    cidade: { type: String, required: [true, "O cidade é obrigatório!"]},
                    estado: { type: String, enum: estadosBrasil, required: [true, "O estado é obrigatório!"]}
                }
            }, 
            {
                timestamps: true,
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        // usuarioSchema.pre('save', function (next) {
        //     const permissoes = this.permissoes;
        //     const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
        //     const setCombinacoes = new Set(combinacoes);

        //     if (combinacoes.length !== setCombinacoes.size) {
        //         return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
        //     }

        //     next();
        // });

        
        usuarioSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuarios', usuarioSchema);
    }
}

export default new Usuario().model;