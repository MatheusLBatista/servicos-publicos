import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthHelper {
    static generateToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    static decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
}

export default AuthHelper;
