import "dotenv/config";
import bcrypt from "bcryptjs";

export function gerarSenhaHash(senhaPura) {
    return bcrypt.hashSync(senhaPura, 8)
}

const senhaPura = "AaBb@123456";
const senhaHash = gerarSenhaHash(senhaPura)

 

