import mongoose, { mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

// TODO: verificar porque nao consigo filtrar nivel acesso
class Usuario {
    constructor() {
        const usuarioSchema = new mongoose.Schema(
            {
                cpf: { type: String },//
                email: { type: String },//
                celular: { type: String },//
                cnh: { type: String },//
                data_nomeacao: { type: Date },//
                cargo: { type: String },//
                formacao: { type: String },//
                nivel_acesso: {//
                    type: {
                        municipe: { type: Boolean },
                        operador: { type: Boolean },
                        administrador: { type: Boolean },
                    }, 
                },
                nome: { type: String }, //
                nome_social: { type: String }, //
                portaria_nomeacao: { type: String },
                senha: { type: String },//
                endereco: {
                    logradouro: { type: String },
                    cep: { type: String },
                    bairro: { type: String },
                    numero: { type: String },
                    complemento: { type: String },
                    cidade: { type: String },
                    estado: { type: String, enum: estadosBrasil }
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