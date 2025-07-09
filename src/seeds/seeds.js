import "dotenv/config";
import seedDemanda from "./seed_demanda.js";
import seedUsuario from "./seed_usuario.js";
import seedSecretaria from "./seed_secretaria.js";
import seedTipoDemanda from "./seed_tipoDemanda.js";
import seedGrupo from "./seed_grupo.js";
import seedRotas from "./seed_rota.js";
 
async function main() {
    try {
      await seedRotas();
      await seedGrupo();
      await seedSecretaria();
      await seedUsuario();
      await seedDemanda();
      await seedTipoDemanda();

      console.log(">>> SEED FINALIZADO COM SUCESSO! <<<");
    } catch (err) {
      console.error("Erro ao executar SEED:", err);

    } finally {
      mongoose.connection.close();
      process.exit(0);
    }
  }
  
  main();
  
