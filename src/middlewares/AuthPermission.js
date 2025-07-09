// middlewares/AuthPermission.js

import jwt from 'jsonwebtoken';
import PermissionService from '../service/PermissionService.js';
import Rota from '../models/Rota.js';
import { CustomError, errorHandler, messages } from '../utils/helpers/index.js';

// Certifique-se de que as variáveis de ambiente estejam carregadas
const JWT_SECRET_ACCESS_TOKEN = process.env.JWT_SECRET_ACCESS_TOKEN;

class AuthPermission {
  constructor() {
    this.jwt = jwt;
    this.permissionService = new PermissionService();
    this.Rota = Rota;
    this.JWT_SECRET_ACCESS_TOKEN = JWT_SECRET_ACCESS_TOKEN;
    this.messages = messages;

    // Vincula o método handle ao contexto da instância
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      // 1. Extrai o token do cabeçalho Authorization
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Authorization',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Token')
        });
      }

      const token = authHeader.split(' ')[1];

      // 2. Verifica e decodifica o token
      let decoded;
      try {
        decoded = this.jwt.verify(token, this.JWT_SECRET_ACCESS_TOKEN);
      } catch (err) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Token',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Token')
        });
      }
      const userId = decoded.id;

      /**
       * 3. Determina a rota e o domínio da requisição
       * Remove barras iniciais e finais, remove query strings e pega a primeira parte da URL
       */
      const rotaReq = req.url.split('/').filter(Boolean)[0].split('?')[0];

      const dominioReq = `localhost`; // domínio foi colocado como localhost para fins de teste

      // 4. Busca a rota atual no banco de dados
      const rotaDB = await this.Rota.findOne({ rota: rotaReq, dominio: dominioReq });
      console.log(rotaDB)
      if (!rotaDB) {
        throw new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Rota',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Rota')
        });
      }

      // 5. Mapeia o método HTTP para o campo de permissão correspondente
      const metodoMap = {
        'GET': 'buscar',
        'POST': 'enviar',
        'PUT': 'substituir',
        'PATCH': 'modificar',
        'DELETE': 'excluir'
      };

      const metodo = metodoMap[req.method];
      if (!metodo) {
        throw new CustomError({
          statusCode: 405,
          errorType: 'methodNotAllowed',
          field: 'Método',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Método.')
        });
      }

      // 6. Verifica se a rota está ativa e suporta o método
      if (!rotaDB.ativo || !rotaDB[metodo]) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Rota',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Rota.')
        });
      }

      // 7. Verifica se o usuário tem permissão
      const hasPermission = await this.permissionService.hasPermission(
        userId,
        rotaReq.toLowerCase(),
        rotaDB.dominio,
        metodo
      );

      if (!hasPermission) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Permissão',
          details: [],
          customMessage: this.messages.error.resourceNotFound('Permissão')
        });
      }

      // 8. Anexa o usuário ao objeto de requisição para uso posterior
      req.user = { id: userId };

      // 9. Permite a continuação da requisição
      next();
    } catch (error) {
      // Utilize o handler de erros personalizado
      errorHandler(error, req, res, next);
    }
  }
}

// Instanciar e exportar apenas o método 'handle' como função de middleware
export default new AuthPermission().handle;
