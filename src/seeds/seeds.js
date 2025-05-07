import "dotenv/config";
import seedDemanda from "./seed_demanda";
import seedUsuario from "./seed_usuario";
 
async function main() {
    try {
      await seedDemanda();
      await seedUsuario();

      console.log(">>> SEED FINALIZADO COM SUCESSO! <<<");
    } catch (err) {
      console.error("Erro ao executar SEED:", err);

    } finally {
      mongoose.connection.close();
      process.exit(0);
    }
  }
  
  // Executa tudo
  main();
  
