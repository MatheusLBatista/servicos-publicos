# Plano de Teste para Model de Usuário (Sprint 5)

| Funcionalidade           | Comportamento Esperado                                                         | Verificações                                 | Critérios de Aceite                                                |
| ------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------ |
| Cadastro válido          | Deve criar um usuário com todos os dados obrigatórios preenchidos corretamente | Salvar um usuário com dados completos        | O usuário é salvo e retorna com `_id` definido e os dados corretos |
| Validação de email único | Não deve permitir criar um usuário com email já cadastrado                     | Tentar salvar um usuário com email duplicado | A operação falha com erro de duplicidade (`unique`)                |
| Validação de CPF único   | Não deve permitir criar um usuário com CPF já cadastrado                       | Tentar salvar um usuário com CPF duplicado   | A operação falha com erro de duplicidade (`unique`)                |
| Validação de CNH única   | Não deve permitir criar um usuário com CNH já cadastrada                       | Tentar salvar um usuário com CNH duplicada   | A operação falha com erro de duplicidade (`unique`)                |

---

# Plano de Teste para Controller de Usuário (Sprint 5)

| Funcionalidade         | Comportamento Esperado                                                                  | Verificações                                                                | Critérios de Aceite                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Listagem de usuários   | Deve listar usuários retornando status 200 com dados e mensagem de sucesso              | Chamar método listar e verificar status 200 e corpo com dados esperados     | Resposta com status 200 e JSON com mensagem, dados e array vazio de erros                  |
| Validação de ID        | Deve validar o formato do ID do usuário na rota                                         | Tentar listar com ID inválido                                               | Deve lançar erro de validação com mensagem "ID inválido"                                   |
| Validação de query     | Deve validar os parâmetros de query para nome, email, nível de acesso, cargo e formação | Enviar queries inválidas para nome, email, nível\_acesso, cargo, formação   | Deve lançar erro de validação com mensagens específicas para cada campo                    |
| Criação de usuário     | Deve criar usuário com dados válidos e retornar status 201                              | Enviar dados válidos e verificar status 201 e dados retornados              | Usuário criado com sucesso, retorno com status 201 e dados do novo usuário                 |
| Atualização de usuário | Deve atualizar usuário existente com dados válidos e retornar status 200                | Enviar id válido e dados para atualização, verificar resposta               | Usuário atualizado, retorno com status 200 e dados atualizados                             |
| Exclusão de usuário    | Deve excluir usuário pelo ID e retornar status 200 com mensagem de sucesso              | Enviar id válido para exclusão e verificar resposta                         | Usuário excluído, retorno com status 200 e mensagem de confirmação                         |
| Exclusão - erro ID     | Deve lançar erro customizado se ID não for fornecido para exclusão                      | Chamar método excluir sem ID                                                | Lançar `CustomError` com status 400 e mensagem "ID do usuário é obrigatório para deletar." |
| Upload de foto         | Deve processar upload de foto para usuário e retornar sucesso                           | Enviar id e arquivo válido, verificar chamada para processarFoto e resposta | Retorno 200 com mensagem de sucesso, link da foto e metadados                              |
| Upload de foto - erro  | Deve chamar next com erro se nenhum arquivo for enviado                                 | Chamar upload de foto sem arquivo                                           | Chamar next com `CustomError` e mensagem "Nenhum arquivo foi enviado."                     |
| Obter foto             | Deve enviar arquivo de foto se existir                                                  | Chamar método para obter foto com id válido e usuário com link\_foto        | Chamar setHeader e sendFile para enviar foto                                               |
| Obter foto - erro      | Deve chamar next com erro se foto não existir                                           | Chamar método para obter foto com usuário sem link\_foto                    | Chamar next com `CustomError` e mensagem "Foto do usuário não encontrada."                 |

---

# Plano de Teste para UsuarioService (Sprint 5)

| Funcionalidade                     | Comportamento Esperado                                          | Verificações                                                         | Critérios de Aceite                                      |
| ---------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Listagem de usuários               | Deve retornar lista de usuários                                 | Verificar retorno da lista e se método repository.listar foi chamado | Retorna array de usuários esperado                       |
| Criação de usuário (sucesso)       | Deve criar usuário se email for único                           | Verificar busca por email, criação no repository e retorno dos dados | Usuário criado com dados corretos e método criar chamado |
| Criação com email duplicado        | Deve lançar erro ao tentar criar usuário com email já existente | Verificar rejeição lançando `CustomError`                            | Lança erro customizado que impede criação                |
| Atualização de usuário             | Deve atualizar usuário existente                                | Verificar busca por ID, atualização e retorno dos dados              | Usuário atualizado e dados retornados corretamente       |
| Atualização de usuário inexistente | Deve lançar erro ao tentar atualizar usuário não existente      | Verificar rejeição com `CustomError`                                 | Lança erro customizado por usuário não existir           |
| Exclusão de usuário                | Deve deletar usuário existente                                  | Verificar busca por ID, exclusão e retorno de confirmação            | Usuário deletado e retorno esperado do repository        |
| Exclusão de usuário inexistente    | Deve lançar erro ao tentar deletar usuário não existente        | Verificar rejeição com `CustomError`                                 | Lança erro customizado por usuário não existir           |

---

# Plano de Teste para UsuarioRepository (Sprint 5)

| Método         | Comportamento esperado                   | Verificações                                           | Critérios de Aceite                                                         |
| -------------- | ---------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| buscarPorID    | Retorna usuário ao buscar por ID         | Retorno correto, lança erro se não encontrado          | Retorna objeto usuário ou lança `CustomError`                               |
| buscarPorEmail | Retorna usuário pelo email               | Retorna objeto correto, chama findOne                  | Retorna usuário esperado                                                    |
| listar         | Retorna usuário por ID ou lista paginada | Retorna usuário se ID informado, lista paginada se não | Retorna usuário ou lista paginada corretamente; lança erro se ID não existe |
| criar          | Cria um novo usuário                     | Chama construtor e save do model                       | Retorna usuário criado                                                      |
| atualizar      | Atualiza usuário existente               | Retorna usuário atualizado ou erro se não encontrado   | Retorna usuário atualizado ou lança erro                                    |
| deletar        | Deleta usuário                           | Retorna usuário deletado                               | Retorna usuário deletado                                                    |

---
