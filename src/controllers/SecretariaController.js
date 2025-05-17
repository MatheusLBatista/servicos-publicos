import Secretaria from "../models/Secretaria.js";
import SecretarariaService from "../services/SecretarariaService.js";
//import { paginateOptions } from "../config/paginacao.js";
import handleQuery from "../utils/handleQuery.js";

import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper
} from '../utils/helpers/index.js';

import { SecretariaQuerySchema, SecretariaIdSchema } from '../utils/validators/schemas/zod/querys/EstudanteQuerySchema.js';
import { SecretariaSchema, SecretariaUpdateSchema } from '../utils/validators/schemas/zod/EstudanteSchema.js';

class SecretariaController {
  async listar(req, res) {
    try {
      console.log("Estou no listar em SecretariaController");
      
      const query = handleQuery(req.query, { nome: "asc" });

      const secretaria = await Secretaria.paginate(
        { ...query.filtros },
        {
          ...paginateOptions,
          sort: query.ordenar,
          lean: true,
        }
      );
      res.status(200).json(secretaria);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async ListarSecretariaPorId(req, res) {
    try {
      const { id } = req.params;
      const secretaria = await Secretaria.findById(id);
      if (!secretaria) {
        throw new Error("Secretaria não encontrada!");
      }
      res.status(200).json(secretaria);
    } catch (error) {
      if (error.message === "Secretaria não encontrada!") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  };

  async criar(req, res) {
    try {
      const secretaria = req.body;

      const novaSecretaria = await Secretaria.create(secretaria)
        .then((secretaria) => secretaria);

      res.status(201).json({
        message: "Secretaria adicionada com sucesso!",
        secretaria: novaSecretaria,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const secretaria = req.body;
      const secretariaAtualizada = await Secretaria.findByIdAndUpdate(
        id,
        secretaria,
        { new: true }
      )

      if (!secretariaAtualizada) {
        throw new Error("Secretaria não encontrada!");
      }

      res.status(200).json({
        message: "Secretaria atualizada com sucesso!",
        secretaria: secretariaAtualizada,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const existe = await Secretaria.exists({ _id: id });
      if (!existe) {
        throw new Error("Secretaria não encontrada!");
      }
      await Secretaria.findByIdAndDelete(id);
      res.status(200).json({ message: "Secretaria deletada com sucesso!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
}

export default SecretariaController;
