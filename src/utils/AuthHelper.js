import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthHelper {
    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    static async hashPassword(password) {
        const hashed = await bcrypt.hash(password, 10);
        return { senha: hashed };
    }
}

export default AuthHelper;
