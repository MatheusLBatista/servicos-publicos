
# Documentação da API - Serviços Públicos - Vilhena+ Pública

O nosso sistema tem como objetivo, possibilitar uma comunicação entre a prefeitura de Vilhena-RO e seus munícipes, facilitando o acesso aos serviços públicos, onde o site irá permitir cadastro e gerenciamento de usuários e demandas.

---

## 1. Autenticação

### 1.1 POST /login *(millestone 3)*

#### Caso de Uso
- Permitir que os usuários (ou sistemas externos) entrem no sistema e obtenham acesso às funcionalidades internas.

#### Regras de Negócio
- Verificação de Credenciais: Validar login/senha.
- Bloqueio de Usuários:  Impedir o acesso de usuários desativados ou não confirmados.
- Gestão de Tokens: Gerar e armazenar tokens de acesso e refresh de forma segura, permitindo revogação futura.

#### Resultado Esperado
- Retorno dos tokens de acesso e refresh.
- Retorno da página principal de acordo com o tipo de usuário que fizer o login no sistema.
- Em caso de erro, mensagem de erro: "E-mail já cadastrado" ou "Dados inválidos".

### 1.2 POST  /register

#### Caso de Uso
- Permitir que novos usuários se cadastrem no sistema para acessar as funcionalidades do aplicativo, criando uma conta com suas informações pessoais.

#### Regras de Negócio
- Validação de Dados: Verificar se os campos obrigatórios (nome, e-mail, senha, telefone) 
- Exclusividade de Identificadores: Verificar que campos únicos, como e-mail ou CPF/CNPJ, não estejam já cadastrados.
- Status Inicial: Definir um status inicial para o novo usuári
- Criptografia de Senha: Armazenar a senha de forma segura.

#### Resultado Esperado
- Criação bem-sucedida de uma nova conta de usuário, armazenando todos os dados fornecidos com segurança.
- Retorno da página inicial logada com todas as funcionalidades do sistema disponíveis ao usuário.
- Em caso de falha, retorno de mensagens de erro específicas (ex.: "E-mail já cadastrado", "Senha fora do padrão").


## 2. Demandas

### 2.1 GET /demandas 

#### Caso de Uso
- O sistema deve retornar todas as demandas registradas, podendo aplicar filtros por query string (como status, secretariaId, etc).

#### Regras de Negócio
- Se houver query, será validada por DemandaQuerySchema.
- Se não houver query, lista tudo.
- Pode ser usado por secretarias, operadores ou administradores para visualizar o fluxo de demandas.

#### Resultado Esperado
-O sistema retorna uma lista com todas as demandas existentes, contendo informações como título, descrição, status, data de criação, etc.

### 2.2 GET /demandas/:id

#### Caso de Uso
- Obter os detalhes completos de uma demanda específica a partir do seu ID.

#### Regras de Negócio
- O ID da demanda é validado por DemandaIdSchema.
- Caso o ID não seja válido, o sistema retorna um erro 400.
- Deve retornar apenas uma demanda correspondente ao ID fornecido.

#### Resultado Esperado
- O sistema retorna todas as informações da demanda solicitada, como título, descrição, status atual, data de criação e a secretaria vinculada.
- Em caso de não encontrar, retorna "Recurso não encontrado em demanda.".

### 2.3 POST /demandas

#### Caso de Uso
- Permitir que um usuario, do tipo munícipe crie uma nova demanda, informando os dados necessários.

#### Regras de Negócio
- Os dados da requisição (body) e deve conter os dados válidos.
- Caso algum campo obrigatório esteja ausente ou inválido, a validação Zod impedirá a criação e retornará um erro 400.
- A demanda é criada com status inicial ("pendente") e *vinculada a uma secretaria (Millestone 3)*.

#### Resultado Esperado
- O sistema registra a nova demanda e retorna uma confirmação de criação com os dados fornecidos, além do ID gerado automaticamente.

### 2.4 PATCH /demandas/:id e PUT /demandas/:id

#### Caso de Uso
- Atualizar informações de uma demanda existente. Pode ser uma atualização parcial (PATCH) ou total (PUT).

#### Regras de Negócio
- O ID da demanda é validado (DemandaIdSchema).
- Os dados enviados devem seguir ser válidos (DemandaUpdateSchema).
- Campos internos como tipo e data são excluídos da resposta por segurança ou consistência.
- A atualização só é realizada se a demanda existir.

#### Resultado Esperado
- O sistema atualiza os campos da demanda e retorna uma mensagem de sucesso junto com os novos dados modificados, exceto os campos ocultados.

### 2.5 DELETE /demandas/:id

#### Caso de Uso
- Excluir uma demanda registrada no sistema, geralmente por decisão administrativa ou erro de criação.

#### Regras de Negócio
- O ID informado na URL é validado pelo DemandaIdSchema.
- Caso o ID não seja fornecido ou seja inválido, o sistema retorna um erro personalizado informando a necessidade do ID.
- Se a demanda existir, ela será excluída do banco de dados.

#### Resultado Esperado
- O sistema remove a demanda e retorna uma mensagem de confirmação informando que a exclusão foi concluída com sucesso, junto com os dados da demanda que foi excluída.

### 2.6 PATCH /demandas/:id/atribuir *(Millestone 3)*

#### Caso de Uso
- Permitir que um usuario do tipo operador responsável por uma secretaria atribua uma demanda a um operador para execução.

#### Regras de Negócio
- O ID da demanda é validado (DemandaIdSchema).
- O corpo da requisição deve conter o ID do operador que irá executar a demanda.
- Apenas usuários com permissão (secretaria ou administrador) podem atribuir.
- A demanda deve estar em status "pendente" para ser atribuída.
- Atribuir uma demanda muda o status para "em andamento".

#### Resultado Esperado
- O sistema atualiza a demanda com o operador designado e retorna uma mensagem confirmando a atribuição com sucesso, incluindo o nome ou ID do operador.

### 2.7 PATCH /demandas/:id/resolver *(Millestone 3)*

#### Caso de Uso
- Permitir que o operador responsável pela demanda marque-a como concluída, indicando que a execução foi finalizada.

#### Regras de Negócio
- O ID da demanda é validado (DemandaIdSchema).
- A demanda deve estar atribuída ao operador que está tentando resolvê-la.
- O operador deve enviar uma imagem de comprovação e descrição da execução.
- A mudança de status vai de “em andamento” para “concluída”.

#### Resultado Esperado
- A demanda é atualizada com o status “concluída”, salvando a imagem e a descrição do serviço realizado. O sistema retorna uma mensagem de sucesso com os dados atualizados da demanda.

### 2.8 PATCH /demandas/:id/devolver *(Millestone 3)*

#### Caso de Uso
- Permitir que o operador devolva uma demanda que foi atribuída a ele, caso não possa executar por algum motivo.

#### Regras de Negócio
- O ID da demanda é validado (DemandaIdSchema).
- A devolução só pode ser feita se o operador estiver vinculado à demanda.
- A demanda deve estar em status "em andamento".
- Após a devolução, o status volta para “pendente” e o campo operador é removido.

#### Resultado Esperado
- A demanda é desatribuída do operador, o status volta para “pendente” e o sistema retorna uma mensagem confirmando a devolução da demanda.

## 3. Secretarias

### 3.1 GET /secretaria

#### Caso de Uso
- Permitir que o sistema ou um usuário autorizado liste todas as secretarias cadastradas, com possibilidade de filtro via query.

#### Regras de Negócio
- Pode ou não conter filtros por nome e/ou sigla.
- As queries devem ser validadas por SecretariaQuerySchema.

#### Resultado Esperado
- Retorna um array com todas as secretarias cadastradas, contendo dados como nome, sigla, e-mail, e telefone.

### 3.2 GET /secretaria/:id

#### Caso de Uso
- Permitir que o sistema ou um usuário autorizado recupere os dados completos de uma secretaria específica pelo ID.

#### Regras de Negócio
- O ID fornecido na rota deve ser válido conforme o SecretariaIDSchema.
- Caso não exista secretaria com esse ID, retorna erro 404.

#### Resultado Esperado
- Retorna os dados detalhados da secretaria correspondente ao ID fornecido, como nome, e-mail e telefone.

### 3.3 POST /secretaria

#### Caso de Uso
- Permitir que o administrador do sistema cadastre uma nova secretaria no banco de dados.

#### Regras de Negócio
- O corpo da requisição deve seguir as validações definidas no SecretariaSchema.
- Todos os campos obrigatórios devem ser enviados.
- Não pode haver outra secretaria com o mesmo nome ou sigla.

#### Resultado Esperado
- A nova secretaria é criada com sucesso no banco e retorna os dados da secretaria recém-criada, incluindo seu ID.

### 3.4 PATCH /secretaria/:id e PUT /secretaria/:id

#### Caso de Uso
- Permitir que o administrador do sistema atualize parcialmente ou totalmente os dados de uma secretaria existente.

#### Regras de Negócio
- O ID da secretaria deve ser válido (SecretariaIDSchema).
- O corpo da requisição deve respeitar o SecretariaUpdateSchema.
- O nome ou sigla não pode ser duplicado em relação a outra secretaria.

#### Resultado Esperado
- A secretaria é atualizada com os novos dados fornecidos e o sistema retorna a confirmação da atualização com os dados atualizados.

### 3.5 DELETE /secretaria/:id

#### Caso de Uso
- Permitir que o administrador delete uma secretaria do sistema, caso ela não esteja vinculada a demandas ativas.

#### Regras de Negócio
- O ID deve ser válido (SecretariaIDSchema).
- Caso a secretaria tenha demandas ativas vinculadas, não pode ser deletada(*Millestone 3*).
- O sistema deve validar a existência da secretaria antes da exclusão.

#### Resultado Esperado
- A secretaria é excluída do banco de dados e o sistema retorna uma mensagem de sucesso confirmando a exclusão e os dados da secretraia excluída.

### 3.6 GET /secretaria/:id/demandas *(Millestone 3)*

#### Caso de Uso
- Permitir que uma secretaria visualize todas as demandas vinculadas a ela, independentemente do status (pendente, em andamento, concluída).

#### Regras de Negócio
- O ID da secretaria informado deve ser válido.
- A listagem retorna apenas demandas que possuem o campo secretaria igual ao ID fornecido.

#### Resultado Esperado
- O sistema retorna uma lista com todas as demandas atribuídas à secretaria informada, podendo incluir informações como status, título, descrição, operador responsável (se houver), e datas de criação e conclusão.

## 4. Tipos de Demanda

### 4.1 GET /tipoDemanda

#### Caso de Uso
- Permitir que o sistema ou um usuário autorizado liste todos os tipos de demanda disponíveis no sistema.

#### Regras de Negócio
- As queries são validadas via Zod.
- A listagem ocorre mesmo se nenhuma query for enviada.

#### Resultado Esperado
- Retorna um array com todos os tipos de demanda cadastrados, contendo dados como nome, descrição e status.

### 4.2 GET /tipoDemanda/:id

#### Caso de Uso
- Permitir que o sistema ou um usuário autorizado recupere os dados de um tipo de demanda específico, utilizando o ID como parâmetro.

#### Regras de Negócio
- O ID da rota deve ser validado pelo TipoDemandaIDSchema.
- Caso o ID não exista no banco, deve retornar erro 404.

#### Resultado Esperado
- Retorna os dados do tipo de demanda correspondente ao ID fornecido, como titulo, descrição, icone, etc.

### 4.3 `POST /tipoDemanda

#### Caso de Uso
- Permitir que o administrador cadastre um novo tipo de demanda no sistema.

#### Regras de Negócio
- O corpo da requisição deve seguir o TipoDemandaSchema.
- Campos obrigatórios como nome e descrição devem ser enviados.
- Não deve permitir a criação de tipos de demanda com nomes duplicados.

#### Resultado Esperado
- O tipo de demanda é criado com sucesso e retorna os dados do registro recém-criado, incluindo seu ID.

### 4.4 PATCH /tipoDemanda/:id e PUT /tipoDemanda/:id

#### Caso de Uso
- Permitir que o administrador atualize parcialmente ou totalmente os dados de um tipo de demanda existente.

#### Regras de Negócio
- O ID deve ser validado com o TipoDemandaIDSchema.
- Os dados enviados devem seguir o TipoDemandaUpdateSchema.
- Não pode haver duplicação de nomes com outros tipos de demanda.

#### Resultado Esperado
- Os dados do tipo de demanda são atualizados com sucesso e o sistema retorna os novos dados com uma mensagem de confirmação.

### 4.5 DELETE /tipoDemanda/:id

#### Caso de Uso
- Permitir que o administrador exclua um tipo de demanda do sistema, caso ele não esteja vinculado a nenhuma demanda ativa.

#### Regras de Negócio
- O ID deve ser válido e validado com TipoDemandaIDSchema.
- Caso o tipo de demanda esteja associado a demandas existentes, a exclusão deve ser impedida (verificado no service).
- A existência do tipo de demanda deve ser verificada antes de excluí-lo.

#### Resultado Esperado
- O tipo de demanda é removido com sucesso do banco de dados e o sistema retorna uma mensagem de sucesso e os dados do TipoDemanda excluído.

## 5. Usuários

### 5.1 GET /usuarios e GET /usuarios/:id

#### Caso de Uso
- Listar todos os usuários ou consultar um usuário específico pelo ID.

#### Regras de Negócio
- Se o parâmetro id for passado, deve ser validado.
- A consulta pode aceitar filtros via query string, validados pelo UsuarioQuerySchema.
- Se o usuário solicitado não existir, retorna erro 404.

#### Resultado Esperado
- Retorna uma lista de usuários (ou um usuário específico) com os dados públicos, exceto os campos ocultados.

### 5.2 POST /usuarios

#### Caso de Uso
- Criar um novo usuário no sistema.

#### Regras de Negócio
- Os dados recebidos devem obedecer ao UsuarioSchema.
- Campos obrigatórios, como nome, email e senha, devem ser fornecidos.
- Campos internos como senha são excluídos da resposta por segurança.
- Deve garantir que o email seja único.

#### Resultado Esperado
- Usuário criado com sucesso, retornando os dados do usuário criado, sem a senha.

### 5.3 PATCH /usuarios/:id e PUT /usuarios/:id

#### Caso de Uso
- Atualizar os dados de um usuário existente.

#### Regras de Negócio
- O ID do usuário deve ser validado.
- Os dados atualizados devem estar no formato do UsuarioUpdateSchema.
- Campos internos como senha e email são excluídos da resposta por segurança.
- A atualização só é realizada se o usuario existir.

#### Resultado Esperado
- O sistema atualiza os campos de usuario e retorna uma mensagem de sucesso junto com os novos dados modificados, exceto os campos ocultados.

### 5.4 DELETE /usuarios/:id

#### Caso de Uso
- Excluir um usuário do sistema.

#### Regras de Negócio
- O ID deve ser validado.
- O usuário deve existir para ser excluído, caso contrário erro 404.
- Se o ID não for fornecido, retorna erro 400.

#### Resultado Esperado
- Usuário excluído com sucesso, com mensagem confirmando a exclusão.

### 5.5 POST /usuarios/:id/foto

#### Caso de Uso
- Permitir que o usuário faça upload de uma foto de perfil.

#### Regras de Negócio
- O ID do usuário deve ser validado.
- Um arquivo de imagem deve ser enviado; caso contrário, retorna erro 400.
- O serviço processa e salva a imagem, atualizando o usuário com o link da foto.

#### Resultado Esperado
- Upload realizado com sucesso, retornando mensagem de sucesso, link para a foto e metadados do arquivo.

### 5.6 GET /usuarios/:id/foto

#### Caso de Uso
- Permitir download ou visualização da foto de perfil do usuário.

#### Regras de Negócio
- O ID deve ser validado.
- Se o usuário não possuir foto, retorna erro 404.
- O arquivo é enviado com o content-type adequado conforme extensão.

#### Resultado Esperado
- Imagem da foto do usuário é enviada no response com o cabeçalho correto.
