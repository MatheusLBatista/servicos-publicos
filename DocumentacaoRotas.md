# Endpoints com Foco em Casos de Uso

## 3.1 `/login` (Endpoint de Autenticação)

### 1. Função de Negócio
Permitir que os usuários (ou sistemas externos) entrem no sistema e obtenham acesso às funcionalidades internas.

### 2. Regras de Negócio Envolvidas
- **Verificação de Credenciais**: Validar login/senha ou outro método de autenticação.
- **Bloqueio de Usuários**: Impedir o acesso de usuários inativos ou sem autorização específica.
- **Gestão de Tokens**: Gerar e armazenar tokens de acesso e refresh (se aplicável) de forma segura, permitindo revogação futura.

### 3. Resultado Esperado
- Retorno dos tokens de acesso e refresh (se aplicável).
- Retorno da página principal de acordo com o tipo de usuário que fizer o login no sistema.

---

## 3.2 `/registro` (Endpoint de Cadastro)

### 1. Função de Negócio
Permitir que novos usuários (ou sistemas externos) se cadastrem na plataforma, criando uma conta para acesso futuro aos serviços internos.

### 2. Regras de Negócio Envolvidas
- **Validação de Dados Obrigatórios**: Garantir que informações essenciais (nome, e-mail, senha) sejam fornecidas corretamente.
- **Exclusividade de Identificadores**: Verificar que campos únicos, como e-mail ou CPF/CNPJ, não estejam já cadastrados.
- **Segurança na Senha**: Aplicar critérios de complexidade mínima (ex.: tamanho mínimo, caracteres especiais).
- **Status Inicial**: Definir um status inicial para o novo usuário (ex.: ativo, pendente de verificação de e-mail).
- **Envio de Confirmação**: Enviar um e-mail ou SMS de verificação para confirmação da identidade.

### 3. Resultado Esperado
- Criação bem-sucedida de uma nova conta de usuário, armazenando todos os dados fornecidos com segurança.
- Retorno da página inicial logada com todas as funcionalidades do sistema disponíveis ao usuário.
- Em caso de falha, retorno de mensagens de erro específicas (ex.: "E-mail já cadastrado", "Senha fora do padrão").

---

## 3.3 CRUD Principal

### 3.3.1 `GET /`
#### Caso de Uso
Carregar a página inicial com categorias de demandas e informações do sistema.

#### Regras de Negócio
- Exibir categorias disponíveis (Coleta, Animais, Árvores, etc.).
- Mostrar um resumo textual sobre o sistema.

#### Resultado
Página carregada com sucesso mostrando categorias e informações básicas do sistema.

---

### 3.3.2 `GET /coleta/`
#### Caso de Uso
Listar subtipos da demanda de coleta disponíveis para seleção.

#### Regras de Negócio
- Disponibilizar apenas subtipos ativos ou permitidos no sistema.
- Retornar uma breve descrição de cada subtipo.

#### Resultado
Lista de subtipos retornada com sucesso. Em caso de falha, mensagem de erro adequada.

---

### 3.3.3 `POST /coleta/criar`
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

### 3.3.4 `POST /coleta/criar/endereco`
#### Caso de Uso
Adicionar endereço a uma demanda já criada.

#### Regras de Negócio
- Campos obrigatórios: número, bairro, logradouro e tipo de logradouro.
- Verificar existência da demanda antes de adicionar o endereço.

#### Resultado
Endereço vinculado com sucesso à demanda. Em caso de falha, mensagem de erro.

---

(Repete o mesmo padrão para os endpoints de **iluminação**, **animais**, **árvores**, **pavimentação**, **saneamento**, adaptando o título e caminho do endpoint conforme abaixo)

---

## 3.4 `/operador` (Endpoints de Gerenciamento de Demandas)

### 3.4.1 `GET /operador/demandas/recebidas`
#### Caso de Uso
Listar todas as demandas recebidas atribuídas ao operador.

#### Regras de Negócio
- Validar existência da demanda.
- Ordenar demandas mais recentes primeiro.

#### Resultado
Listar demandas atribuídas ao operador.

---

### 3.4.2 `POST /operador/demandas/recebidas/{id}/concluir`
#### Caso de Uso
Concluir uma demanda atribuída.

#### Regras de Negócio
- Garantir que dados essenciais sejam fornecidos.
- Atualizar status para "em andamento" e depois "concluído".

#### Resultado
Demanda concluída com sucesso.

---

### 3.4.3 `POST /operador/demandas/recebidas/{id}/devolver`
#### Caso de Uso
Devolver uma demanda à secretaria.

#### Regras de Negócio
- Garantir que motivo da devolução seja informado.
- Apenas o operador atribuído pode devolver.

#### Resultado
Operador removido e status atualizado para "aberto".

---

### 3.4.4 `GET /operador/demandas/historico`
#### Caso de Uso
Listar o histórico de demandas concluídas pelo operador.

#### Regras de Negócio
- Validar existência da demanda.

#### Resultado
Histórico de demandas concluídas exibido.

---

## 3.5 `/pedidos` e `/perfil`

### 3.5.1 `GET /pedidos`
#### Caso de Uso
Listar todas as demandas existentes com opção de filtros e paginação.

#### Regras de Negócio
- Implementar paginação.
- Permitir filtragem por tipo, status e data.

#### Resultado
Lista de demandas com metadados de paginação.

---

### 3.5.2 `GET /pedidos/:id`
#### Caso de Uso
Obter detalhes de uma demanda específica.

#### Regras de Negócio
- Confirmar existência da demanda.
- Só aceitar avaliação se a demanda estiver concluída.

#### Resultado
Detalhamento completo da demanda.

---

### 3.5.3 `POST /pedidos/:id/avaliar`
#### Caso de Uso
Enviar avaliação da conclusão da demanda.

#### Regras de Negócio
- Confirmar status de conclusão.

#### Resultado
Avaliação enviada com sucesso.

---

### 3.5.4 `GET /perfil`
#### Caso de Uso
Obter dados do perfil do usuário.

#### Regras de Negócio
- Confirmar existência dos dados.

#### Resultado
Dados do usuário retornados.

---

### 3.5.5 `POST /perfil/atualizar`
#### Caso de Uso
Atualizar informações do perfil do usuário.

#### Regras de Negócio
- Validar dados antes da atualização.

#### Resultado
Mensagem de sucesso ou erro conforme a operação.

---

## 3.4 `/operador` (Endpoints de Gerenciamento de Demandas)

### 3.4.1 `GET /operador/demandas/recebidas`
#### 1. Caso de Uso
Listar todas as demandas recebidas atribuídas ao operador.

#### 2. Regras de Negócio
- **Validação de Existência**: Confirmar se a demanda existe.
- **Ordenação**: Exibir demandas mais recentes primeiro.

#### 3. Resultado
Listar demandas atribuídas ao operador com opção de concluir ou devolver.

---

### 3.4.2 `POST /operador/demandas/recebidas/{id}/concluir`
#### 1. Caso de Uso
Concluir uma demanda atribuída.

#### 2. Regras de Negócio
- **Validação de Atributos Obrigatórios**: Garantir que dados essenciais sejam fornecidos.
- **Status Atual**: Adicionar o status “em andamento” antes da conclusão.
- **Definição de Status**: Alterar para status “concluído”.

#### 3. Resultado
Status "concluído" adicionado e mensagem de sucesso.  
Em caso de falha, mensagem de erro.

---

### 3.4.3 `POST /operador/demandas/recebidas/{id}/devolver`
#### 1. Caso de Uso
Devolver uma demanda à secretaria.

#### 2. Regras de Negócio
- **Validação de Atributos Obrigatórios**: Garantir que motivo da devolução seja informado.
- **Validação de Status da Demanda**: Garantir que a demanda esteja “em andamento” ou “aberta”.
- **Regra de Segurança**: Apenas o operador atribuído pode devolver.

#### 3. Resultado
Remover o operadorID e manter ou atualizar o status para “aberto”.  
Exibir mensagem de sucesso.  
Em caso de falha, mensagem de erro.

---

### 3.4.4 `GET /operador/demandas/historico`
#### 1. Caso de Uso
Listar o histórico de demandas concluídas pelo operador.

#### 2. Regras de Negócio
- **Validação de Existência**: Confirmar se a demanda existe.

#### 3. Resultado
Listar o histórico de demandas concluídas.

---

### 3.4.5 `GET /operador/demandas/historico/:id`
#### 1. Caso de Uso
Detalhar uma demanda concluída específica.

#### 2. Regras de Negócio
- **Validação de Existência**: Confirmar se a demanda pertence ao operador e está concluída.

#### 3. Resultado
Detalhamento completo da demanda.  
Retorno de mensagem de erro caso a demanda não seja encontrada.

---

## 3.5 `/secretaria` (Endpoints de Gerenciamento de Demandas)

### 3.5.1 `GET /secretaria/demandas`
#### Caso de Uso
A secretaria pode visualizar todas as demandas enviadas pelos munícipes.

#### Regras de Negócio
- Exibir demandas com filtros para status (pendente, em andamento, concluída) e tipo de demanda.
- Mostrar progresso das demandas e informações de quem foi designado.

#### Resultado
Lista de demandas com seus respectivos status, tipo e operador atribuído (se aceito).

---

### 3.5.2 `GET /demandas/{id}`
#### Caso de Uso
A secretaria pode visualizar o detalhamento de uma demanda específica.

#### Regras de Negócio
- Exibir todas as informações da demanda (status, tipo, data de criação, histórico de movimentações).
- Incluir informações sobre o operador designado.

#### Resultado
Detalhamento completo da demanda, incluindo histórico de movimentação e status.

---

### 3.5.3 `POST /secretaria/demandas/{id}/atribuir`
#### Caso de Uso
A secretaria pode atribuir um operador a uma demanda específica.

#### Regras de Negócio
- A secretaria escolhe o operador responsável pela demanda.

#### Resultado
Atribuição de operador à demanda com sucesso.  
O operador recebe notificação (via app ou sistema).

---

### 3.5.4 `POST /secretaria/demandas/{id}/rejeitar`
#### Caso de Uso
A secretaria pode rejeitar uma demanda enviada pelo munícipe, fornecendo um motivo para a rejeição.

#### Regras de Negócio
- Fornecer motivo válido para rejeitar.
- Demanda rejeitada terá status alterado para "recusado" e ficará invisível para operadores.
- Motivo da rejeição registrado e visível para secretaria e munícipe.

#### Resultado
Demanda rejeitada com sucesso e motivo exibido na listagem.

---

### 3.5.5 `GET /secretaria/demandas/{id}/devolucao`
#### Caso de Uso
A secretaria pode visualizar o motivo da rejeição de uma demanda.

#### Regras de Negócio
- Exibir o motivo apenas para demandas com status "recusado".
- Resposta deve incluir tipo, data e operador que rejeitou.

#### Resultado
Motivo da rejeição e detalhes da demanda exibidos.

---

## 3.6 `/administrador` (Endpoints de Administração)

### 3.6.1 `POST /admin/colaboradores`
#### Caso de Uso
Cadastrar novos colaboradores (operadores e funcionários).

#### Regras de Negócio
- Preencher informações obrigatórias: CPF e e-mail.
- Enviar e-mail automático com instruções de acesso.
- Verificar duplicidade de CPF e e-mail.

#### Resultado
Novo colaborador cadastrado no sistema.

---

### 3.6.2 `POST /admin/empresas`
#### Caso de Uso
Cadastrar novas empresas terceirizadas.

#### Regras de Negócio
- Informar dados obrigatórios: CNPJ e e-mail.
- Validar CNPJ para evitar duplicidade.

#### Resultado
Empresa cadastrada e disponível para associações futuras.

---

### 3.6.3 `GET /admin/grafico-demandas`
#### Caso de Uso
Visualizar gráficos analíticos das demandas.

#### Regras de Negócio
- Exibir quantidade de demandas por tipo, status e período.
- Atualização em tempo real conforme movimentações.

#### Resultado
Exibição de gráficos de barras ou pizza para apoio à decisão.

---

### 3.6.4 `GET /admin/mapa-demandas`
#### Caso de Uso
Visualizar no mapa a localização das demandas.

#### Regras de Negócio
- Exibir tipo da demanda com ícones.
- Indicar status com cores diferentes.
- Clusterizar múltiplas demandas em uma região.
- Mostrar resumo ao clicar em um marcador.

#### Resultado
Mapa interativo com a distribuição das demandas.

---

## Considerações Finais

## Considerações Finais

- **Segurança**: Implementar autenticação, autorização e registro de logs para proteger o sistema e os dados dos usuários.
- **Validação e Tratamento de Erros**: Validar todas as entradas e retornar mensagens de erro claras e específicas para auxiliar na resolução de problemas.
- **Escalabilidade e Performance**: Aplicar filtros, paginação e técnicas de caching para garantir a performance e escalabilidade da aplicação, mesmo com grande volume de dados.
- **Documentação e Monitoramento**: Manter uma documentação atualizada dos endpoints e realizar o monitoramento constante das requisições para garantir integridade e alta disponibilidade do sistema.
