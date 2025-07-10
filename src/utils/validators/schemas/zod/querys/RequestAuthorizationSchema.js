import { z } from "zod";

/** Body esperado para a requisição de autorização
  {
    "accesstoken": "string",
    "refreshtoken": "string", //opcional
    "domain": "string",
    "path": "string",
    "metodo": "string",
    "query": "string",
    "params": {},
    "body": {}
  }
*/

const RequestAuthorizationSchema = z.object({
    accesstoken: z.string()
        .min(1, "Accesstoken não pode ser vazio")
        .refine(val => val.trim().toLowerCase() !== "null", {
            message: "Accesstoken inválido"
        })
        .transform((val) => val.trim()),
}).passthrough();

const RequestAuthorizationUpdateSchema = RequestAuthorizationSchema.partial();

export { RequestAuthorizationSchema, RequestAuthorizationUpdateSchema };
