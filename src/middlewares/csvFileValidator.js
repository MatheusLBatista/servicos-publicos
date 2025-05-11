import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import getFirstLine from "../utils/getFirstLine.js";

export default async (req, res, next) => {
  try {
    //Verificar se foi enviado algum arquivo
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum Arquivo Enviado!" });
    }

    // Pegar o local do arquivo
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      `${req.file.filename}`
    );
    
    // Verificar se o arquivo é um CSV
    if (req.file.mimetype !== "text/csv") {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "O arquivo enviado não é um CSV!" });
    }

    // Verificar se o cabeçalho do arquivo está correto
    const cabecalho = await getFirstLine(filePath);

    if(!(cabecalho.includes("aluno") && cabecalho.includes("matricula") && cabecalho.includes("turma"))){
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "O cabeçalho do arquivo CSV está incorreto!\nVerifique se tem os campos necessários(turma,aluno,matricula) e se os campos do cabeçalho estão todos em minusculo e sem acentos." });
    }


    return next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ocorreu um erro no sistema!" + error.message });
  }
};
