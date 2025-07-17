# Serviços Públicos

## Objetivo do Projeto
O projeto **Serviços Públicos** tem como principal objetivo oferecer uma solução tecnológica para atender às necessidades da população, permitindo que cidadãos registrem demandas diretamente às secretarias responsáveis. A plataforma possui uma interface simples e acessível, possibilitando que qualquer munícipe cadastrado envie solicitações relacionadas a diversas áreas, como coleta de lixo, saneamento, iluminação pública, animais abandonados, entre outras. O foco é promover a participação cidadã e contribuir para a boa manutenção e desenvolvimento do município.

## Funcionalidades
* Cadastro e login de usuários;
* Envio de demandas públicas;
* Acompanhamento do status da demanda;
* Painel administrativo por tipo de usuário;
* Histórico de demandas;
* Controle de acesso de usuários de acordo com nível de acesso;
* Atribuição de demandas por parte dos secretários;
* Resolução de demandas por parte dos operadores;
* Devolução de demandas por parte dos operadores;
* Upload de imagens nas demandas.

## Tecnologias Utilizadas

* Node.js
* Express
* Nodemailer
* Zod
* MongoDB
* Mongoose
* JWT
* Bcrypt
* Swagger
* Docker
* Jest
* ESLint
* Nodemon

## Requisitos
Para executar o projeto localmente ou em ambiente de produção, siga as instruções abaixo. Antes de iniciar, certifique-se de configurar corretamente as variáveis de ambiente, utilizando como referência o arquivo .env.example localizado na raiz do projeto.

<br/>

      #clone este repositório
      git clone <https://gitlab.fslab.dev/f-brica-de-software-ii-2025-1/servicos-publicos.git>

      # Acesse a pasta do projeto no terminal/cmd
      cd servicos-publicos

      # Instale as dependências com o comando
      npm install

      # Executar seeds para popular o banco
      npm run seed

      # Execute a aplicação em modo de desenvolvimento
      npm run dev

## Para executar o docker
* É necessário docker baixado em sua máquina

        # Subir o container
        docker-compose up -d

        # Parar o container
        docker-compose down

        # Reconstruir o container e subir
        docker-compose up --build

## Execução dos testes

    # Para executar os testes rode:
    npm run test


## Equipe

| NOME                | Função   | E-MAIL                 |
| :------------------ | :------ | :--------------------- |
| Matheus Lucas Batista | Analista e Scrum Master | matheusifro2020@gmail.com |
| Giullia Beatriz Chiarotti | Analista | giulliachiarotti@gmail.com |
