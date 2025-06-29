// src/middlewares/AuthMiddleware.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AuthenticationError from '../utils/errors/AuthenticationError.js';
import TokenExpiredError from '../utils/errors/TokenExpiredError.js';
import { CustomError } from '../utils/helpers/index.js';
import AuthService from '../service/AuthService.js';
import UsuarioRepository from '../repository/UsuarioRepository.js';

class AuthMiddleware {
  constructor() {
   this.service = new AuthService();
   this.userRepository = new UsuarioRepository();

    /**
     * Vinculação para grantir ao método handle o contexto 'this' correto
     * Ao usar bind(this) no método handle garantimos independentemente de como ou onde o método é chamado, 
     * this sempre se referirá à instância atual de AuthMiddleware.
     */
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError("O token de autenticação não existe!");
      }

      const [scheme, token] = authHeader.split(' ');

      if (scheme !== 'Bearer' || !token) {
        throw new AuthenticationError("Formato do token de autenticação inválido!");
      }

      // Verifica e decodifica o token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_ACCESS_TOKEN);

      if (!decoded) { // Se não ocorrer a decodificação do token
        throw new TokenExpiredError("O token JWT está expirado!");
      }

      // Verifica se o refreshtoken está presente no banco de dados e se é válido
      const tokenData = await this.service.carregatokens(decoded.id);

      if (!tokenData?.data?.refreshtoken) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'unauthorized',
          field: 'Token',
          details: [],
          customMessage: 'Refresh token inválido, autentique novamente!'
        });
      }

      // Se o token for válido, anexa o user_id à requisição
      // Recupera o usuário completo pelo ID decodificado
      const usuario = await this.userRepository.buscarPorID(decoded.id);

      if (!usuario) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'unauthorized',
          field: 'Usuário',
          details: [],
          customMessage: 'Usuário não encontrado!'
        });
      }

      req.user = usuario;
      next();

    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        next(new AuthenticationError("Token JWT inválido!"));
      } else if (err.name === 'TokenExpiredError') {
        next(new TokenExpiredError("O token JWT está expirado!"));
      } else {
        next(err); 
      }
    }
  }
}

// Instanciar e exportar apenas o método 'handle' como função de middleware
export default new AuthMiddleware().handle;
