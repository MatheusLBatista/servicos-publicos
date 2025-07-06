import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { LoginSchema } from '../utils/validators/schemas/zod/LoginSchema.js';
import { UsuarioSchema, UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
// import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import { RequestAuthorizationSchema } from '../utils/validators/schemas/zod/querys/RequestAuthorizationSchema.js';

import AuthService from '../service/AuthService.js';
import { UsuarioIdSchema } from '../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';

class AuthController {
    constructor() {
        this.service = new AuthService();
    }

    login = async(req, res) => {
        const body = req.body || {};
        const validatedBody = LoginSchema.parse(body);
        const data = await this.service.login(validatedBody);
        return CommonResponse.success(res, data)
    }

    logout = async(req, res) => {
        const token = req.body.access_token || req.headers.authorization?.split(' ')[1];

        if(!token || token === 'null' || token === 'undefined'){
            console.log("Token recebido:", token);

            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'invalidLogout',
                field: 'Logout',
                details: [],
                messages: HttpStatusCodes.BAD_REQUEST.message
            })
        }

        //decodifica token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_ACCESS_TOKEN);

        if(!decoded || !decoded.id){
            console.log("Token decodificado inválid:",decoded);

            throw new CustomError({
                statusCode: HttpStatusCodes.INVALID_TOKEN.code,
                errorType: 'notAuthorized',
                field: 'NotAuthorized',
                details: [],
                messages: HttpStatusCodes.INVALID_TOKEN.message
            })
        }

        //valida o id do usuário
        const decodedId = UsuarioIdSchema.parse(decoded.id);

        // encaminha o token para o serviço de logout
        const data = await this.service.logout(decodedId, token);

        return CommonResponse.success(res, null, messages.success.logout);
    }

    revoke = async(req, res) => {
        const id = req.body.id;
        const data = await this.service.revoke(id);

        return CommonResponse.success(res);
    }

    /**
   * Método para fazer o refresh do token 
   */
  refresh = async (req, res) => {
    // Extrai do body o token
    const token = req.body.refresh_token;

    // Verifica se o cabeçalho Authorization está presente
    if (!token || token === 'null' || token === 'undefined') {
      console.log('Cabeçalho Authorization ausente.');
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: 'invalidRefresh',
        field: 'Refresh',
        details: [],
        customMessage: 'Refresh token is missing.'
      });
    }

    // Verifica e decodifica o token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_REFRESH_TOKEN);


    // encaminha o token para o serviço
    const data = await this.service.refresh(decoded.id, token);
    return CommonResponse.success(res, data);
  }

  /**
   *  Metodo para recuperar a senha do usuário
   */
  recuperaSenha = async (req, res) => {
    console.log('Estou no logar em RecuperaSenhaController, enviando req para RecuperaSenhaService');

    // 1º validação estrutural - validar os campos passados por body
    const body = req.body || {};

    // Validar apenas o email
    const validatedBody = UsuarioUpdateSchema.parse(body);
    const data = await this.service.recuperaSenha(validatedBody);
    return CommonResponse.success(res, data);
  }

  /**
   * Método para validar o token
   */

  pass = async (req, res) => {
    // 1. Validação estrutural
    const bodyrequest = req.body || {};
    const validatedBody = RequestAuthorizationSchema.parse(bodyrequest);

    // 2. Decodifica e verifica o JWT
    const decoded = /** @type {{ id: string, exp?: number, iat?: number, nbf?: number, client_id?: string, aud?: string }} */ (
      await promisify(jwt.verify)(validatedBody.accesstoken, process.env.JWT_SECRET_ACCESS_TOKEN)
    );

    // 3. Valida ID de usuário
    UsuarioIdSchema.parse(decoded.id);

    // 4. Prepara campos de introspecção
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp ?? null; // timestamp UNIX de expiração
    const iat = decoded.iat ?? null; // timestamp UNIX de emissão 
    const nbf = decoded.nbf ?? iat; // não válido antes deste timestamp
    const active = exp > now;

    // tenta extrair o client_id do próprio token; cai em aud se necessário
    const clientId = decoded.client_id || decoded.id || decoded.aud || null;

    /**
     * 5. Prepara resposta de introspecção
     */
    const introspection = {
      active,               // token ainda válido (não expirado)
      client_id: clientId,  // ID do cliente OAuth
      token_type: 'Bearer', // conforme RFC 6749
      exp,                  // timestamp UNIX de expiração
      iat,                  // timestamp UNIX de emissão
      nbf,                  // não válido antes deste timestamp
      // …adicione aqui quaisquer campos de extensão necessários…
    };

    // 5. Retorna resposta no padrão CommonResponse
    return CommonResponse.success(
      res,
      introspection,
      HttpStatusCodes.OK.code,
      messages.authorized.default
    );
  };

}

export default AuthController;