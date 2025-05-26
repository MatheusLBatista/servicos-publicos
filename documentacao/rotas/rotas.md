# Endpoints com Foco em Casos de Uso

## 1. `/login` (Endpoint de Autenticação)

#### Função de Negócio
Permitir que os usuários (ou sistemas externos) entrem no sistema e obtenham acesso às funcionalidades internas.

#### Regras de Negócio Envolvidas
- **Verificação de Credenciais**: Validar login/senha ou outro método de autenticação.
- **Bloqueio de Usuários**: Impedir o acesso de usuários inativos ou sem autorização específica.
- **Gestão de Tokens**: Gerar e armazenar tokens de acesso e refresh (se aplicável) de forma segura, permitindo revogação futura.

#### Resultado Esperado
- Retorno dos tokens de acesso e refresh (se aplicável).
- Retorno da página principal de acordo com o tipo de usuário que fizer o login no sistema.

---

## 2. `/registro` (Endpoint de Cadastro)

#### Função de Negócio
Permitir que novos usuários (ou sistemas externos) se cadastrem na plataforma, criando uma conta para acesso futuro aos serviços internos.

#### Regras de Negócio Envolvidas
- **Validação de Dados Obrigatórios**: Garantir que informações essenciais (nome, e-mail, senha) sejam fornecidas corretamente.
- **Exclusividade de Identificadores**: Verificar que campos únicos, como e-mail ou CPF/CNPJ, não estejam já cadastrados.
- **Segurança na Senha**: Aplicar critérios de complexidade mínima (ex.: tamanho mínimo, caracteres especiais).
- **Status Inicial**: Definir um status inicial para o novo usuário (ex.: ativo, pendente de verificação de e-mail).
- **Envio de Confirmação**: Enviar um e-mail ou SMS de verificação para confirmação da identidade.

#### Resultado Esperado
- Criação bem-sucedida de uma nova conta de usuário, armazenando todos os dados fornecidos com segurança.
- Retorno da página inicial logada com todas as funcionalidades do sistema disponíveis ao usuário.
- Em caso de falha, retorno de mensagens de erro específicas (ex.: "E-mail já cadastrado", "Senha fora do padrão").

---

## 3. CRUD Principal

### 3.1 `GET /`
#### Caso de Uso
Carregar a página inicial com categorias de demandas e informações do sistema.

#### Regras de Negócio
- Exibir categorias disponíveis (Coleta, Animais, Árvores, etc.).
- Mostrar um resumo textual sobre o sistema.

#### Resultado
Página carregada com sucesso mostrando categorias e informações básicas do sistema.

---

### 3.2 `GET /coleta/`
#### Caso de Uso
Listar subtipos da demanda de coleta disponíveis para seleção.

#### Regras de Negócio
- Disponibilizar apenas subtipos ativos ou permitidos no sistema.
- Retornar uma breve descrição de cada subtipo.

#### Resultado
Lista de subtipos retornada com sucesso. Em caso de falha, mensagem de erro adequada.

---

### 3.3 `POST /coleta/criar`
#### Caso de Uso
Enviar informações iniciais da demanda (tipo de serviço, tipo de pedido, descrição e imagem).

#### Regras de Negócio
- Validação dos campos obrigatórios.
- Validação do formato e tamanho da imagem.
- Status inicial da demanda como "pendente".
- Não permitir criação sem seleção de serviço.

#### Resultado
Demanda preliminar criada (sem endereço), retornando o ID da demanda.

---

### 3.4 `POST /coleta/criar/endereco`
#### Caso de Uso
Adicionar endereço a uma demanda já criada.

#### Regras de Negócio
- Campos obrigatórios: número, bairro, logradouro e tipo de logradouro.
- Verificar existência da demanda antes de adicionar o endereço.

#### Resultado
Endereço vinculado com sucesso à demanda. Em caso de falha, mensagem de erro.

---

## 4. `/operador` (Endpoints de Gerenciamento de Demandas)

### 4.1 `GET /operador/demandas/recebidas`
#### Caso de Uso
Listar todas as demandas recebidas atribuídas ao operador.

#### Regras de Negócio
- Validar existência da demanda.
- Ordenar demandas mais recentes primeiro.

#### Resultado
Listar demandas atribuídas ao operador.

---

### 4.2 `POST /operador/demandas/recebidas/{id}/concluir`
#### Caso de Uso
Concluir uma demanda atribuída.

#### Regras de Negócio
- Garantir que dados essenciais sejam fornecidos.
- Atualizar status para "em andamento" e depois "concluído".

#### Resultado
Demanda concluída com sucesso.

---

### 4.3 `POST /operador/demandas/recebidas/{id}/devolver`
#### Caso de Uso
Devolver uma demanda à secretaria.

#### Regras de Negócio
- Garantir que motivo da devolução seja informado.
- Apenas o operador atribuído pode devolver.

#### Resultado
Operador removido e status atualizado para "aberto".

---

### 4.4 `GET /operador/demandas/historico`
#### Caso de Uso
Listar o histórico de demandas concluídas pelo operador.

#### Regras de Negócio
- Validar existência da demanda.

#### Resultado
Histórico de demandas concluídas exibido.

---

### 4.5 `GET /operador/demandas/historico/:id`
#### Caso de Uso
Detalhar uma demanda concluída específica.

#### Regras de Negócio
- Confirmar se a demanda pertence ao operador e está concluída.

#### Resultado
Detalhamento completo da demanda.

---

## 5. `/pedidos` e `/perfil`

### 5.1 `GET /pedidos`
#### Caso de Uso
Listar todas as demandas existentes com opção de filtros e paginação.

#### Regras de Negócio
- Implementar paginação.
- Permitir filtragem por tipo, status e data.

#### Resultado
Lista de demandas com metadados de paginação.

---

### 5.2 `GET /pedidos/:id`
#### Caso de Uso
Obter detalhes de uma demanda específica.

#### Regras de Negócio
- Confirmar existência da demanda.
- Só aceitar avaliação se a demanda estiver concluída.

#### Resultado
Detalhamento completo da demanda.

---

### 5.3 `POST /pedidos/:id/avaliar`
#### Caso de Uso
Enviar avaliação da conclusão da demanda.

#### Regras de Negócio
- Confirmar status de conclusão.

#### Resultado
Avaliação enviada com sucesso.

---

### 5.4 `GET /perfil`
#### Caso de Uso
Obter dados do perfil do usuário.

#### Regras de Negócio
- Confirmar existência dos dados.

#### Resultado
Dados do usuário retornados.

---

### 5.5 `POST /perfil/atualizar`
#### Caso de Uso
Atualizar informações do perfil do usuário.

#### Regras de Negócio
- Validar dados antes da atualização.

#### Resultado
Mensagem de sucesso ou erro conforme a operação.

---

## 6. `/secretaria` (Endpoints de Gerenciamento de Demandas)

### 6.1 `GET /secretaria/demandas`
#### Caso de Uso
A secretaria pode visualizar todas as demandas enviadas pelos munícipes.

#### Regras de Negócio
- Exibir demandas com filtros para status (pendente, em andamento, concluída) e tipo de demanda.
- Mostrar progresso das demandas e informações de quem foi designado.

#### Resultado
Lista de demandas com seus respectivos status, tipo e operador atribuído (se aceito).

---

### 6.2 `GET /secretaria/demandas/{id}`
#### Caso de Uso
A secretaria pode visualizar o detalhamento de uma demanda específica.

#### Regras de Negócio
- Exibir todas as informações da demanda (status, tipo, data de criação, histórico de movimentações).
- Incluir informações sobre o operador designado.

#### Resultado
Detalhamento completo da demanda.

---

### 6.3 `POST /secretaria/demandas/{id}/atribuir`
#### Caso de Uso
A secretaria pode atribuir um operador a uma demanda específica.

#### Regras de Negócio
- A secretaria escolhe o operador responsável pela demanda.

#### Resultado
Atribuição de operador à demanda com sucesso.

---

### 6.4 `POST /secretaria/demandas/{id}/rejeitar`
#### Caso de Uso
A secretaria pode rejeitar uma demanda enviada pelo munícipe, fornecendo um motivo para a rejeição.

#### Regras de Negócio
- Fornecer motivo válido para rejeitar.
- Demanda rejeitada terá status alterado para "recusado".
- Motivo da rejeição visível para secretaria e munícipe.

#### Resultado
Demanda rejeitada com sucesso.

---

### 6.5 `GET /secretaria/demandas/{id}/devolucao`
#### Caso de Uso
A secretaria pode visualizar o motivo da rejeição de uma demanda.

#### Regras de Negócio
- Exibir o motivo apenas para demandas com status "recusado".
- Incluir tipo, data e operador que rejeitou.

#### Resultado
Motivo da rejeição exibido.

---

## 7. `/administrador` (Endpoints de Administração)

### 7.1 `POST /admin/colaboradores`
#### Caso de Uso
Cadastrar novos colaboradores (operadores e funcionários).

#### Regras de Negócio
- Preencher informações obrigatórias: CPF e e-mail.
- Enviar e-mail automático com instruções de acesso.
- Verificar duplicidade de CPF e e-mail.

#### Resultado
Novo colaborador cadastrado no sistema.

---

### 7.2 `POST /admin/empresas`
#### Caso de Uso
Cadastrar novas empresas terceirizadas.

#### Regras de Negócio
- Informar dados obrigatórios: CNPJ e e-mail.
- Validar CNPJ para evitar duplicidade.

#### Resultado
Empresa cadastrada.

---

### 7.3 `GET /admin/grafico-demandas`
#### Caso de Uso
Visualizar gráficos analíticos das demandas.

#### Regras de Negócio
- Exibir quantidade de demandas por tipo, status e período.

#### Resultado
Exibição de gráficos analíticos.

---

### 7.4 `GET /admin/mapa-demandas`
#### Caso de Uso
Visualizar no mapa a localização das demandas.

#### Regras de Negócio
- Exibir tipo da demanda com ícones.
- Indicar status com cores diferentes.

#### Resultado
Mapa interativo com distribuição das demandas.

---

## Considerações Finais

- **Segurança**: Implementar autenticação, autorização e registro de logs.
- **Validação e Tratamento de Erros**: Mensagens claras e específicas.
- **Escalabilidade e Performance**: Aplicar filtros, paginação e caching.
- **Documentação e Monitoramento**: Manter a documentação atualizada e monitorar o sistema.
