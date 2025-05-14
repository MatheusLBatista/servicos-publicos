import app from './src/app.js'
import "dotenv/config";
import routes from './src/routes/index.js';

const port = process.env.PORT || 5015; 

routes(app)

app.listen(port, () => {
    console.log(`Servidor escutando em http://localhost:${port}`)
  })


  ///mudei aqui