
# Plano de Teste

**Projeto Sistema de Demandas - Prefeitura de Vilhena-RO**
*versão 1.0*

## Histórico das alterações

| Data       | Versão | Descrição                  | Autor(a)                                            |
| ---------- | ------ | -------------------------- | --------------------------------------------------- |
| 27/05/2025 | 1.0    | Primeira versão da API     | \[Matheus Lucas Batista e Giullia Beatriz Charotti] |

## 1 - Introdução

Este projeto tem como objetivo criar a API do site para a prefeitura da cidade de Vilhena-RO, tendo em vista conectar o munícipe com sua cidade, solucionando problemas relacionados com a comunicação de ambos e facilitando a solução de problemas do município.

Este plano de teste descreve os cenários, critérios de aceitação e verificações que serão aplicados sobre as principais funcionalidades do sistema, visando garantir o correto funcionamento das regras de negócio, a integridade dos dados e a experiência do usuário.

## 2 - Arquitetura da API

A aplicação adota uma arquitetura modular em camadas, implementada com as tecnologias Node.js, Express, MongoDB (via Mongoose), Zod para validação de dados, JWT para autenticação e Swagger para documentação interativa da API. O objetivo é garantir uma estrutura clara, escalável e de fácil manutenção, com separação de responsabilidades e aderência a boas práticas de desenvolvimento backend.

### Camadas

**Routes**: Responsável por definir os endpoints da aplicação e encaminhar as requisições para os controllers correspondentes. Cada recurso do sistema possui um arquivo de rotas dedicado.

**Controllers**: Gerenciam a entrada das requisições HTTP, realizam a validação de dados com Zod e invocam os serviços adequados. Também são responsáveis por formatar e retornar as respostas.

**Services**: Esta camada centraliza as regras de negócio do sistema. Ela abstrai a lógica do domínio, orquestra operações e valida fluxos antes de interagir com a base de dados.

**Repositories**: Encapsulam o acesso aos dados por meio dos modelos do Mongoose, garantindo que a manipulação do banco esteja isolada da lógica de negócio.

**Models**: Definem os esquemas das coleções do MongoDB, com o uso de Mongoose, representando as entidades principais do sistema.

**Validations**: Utiliza Zod para garantir que os dados recebidos nas requisições estejam no formato esperado, aplicando validações personalizadas e mensagens de erro claras.

**Middlewares**: Implementam funcionalidades transversais, como autenticação de usuários com JWT, tratamento global de erros, e controle de permissões por tipo de perfil.

Existe um documento demonstrando quando e como aplicar as validações:
[Link para documentação de validações](https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing)

## 3 - Categorização dos Requisitos em Funcionais x Não Funcionais

### Requisitos Funcionais

| Código | Requisito Funcional                                                                                  | Regra de Negócio Associada                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RF-001 | Cadastro de Usuários: O sistema deve permitir que o munícipe insira seus dados para cadastro.        | Apenas após o cadastro o usuário poderá fazer login e acessar o sistema. **(Essencial)**                 |
| RF-002 | Login do Usuário: O sistema deve permitir o acesso com perfis distintos.                             | O login só será realizado com sucesso caso o usuário já esteja cadastrado. **(Essencial)**               |
| RF-003 | Solicitação de Demandas: O sistema deve possibilitar que o munícipe solicite serviços por categoria. | As demandas serão organizadas por tipos e direcionadas às secretarias responsáveis. **(Essencial)** |
| RF-004 | Atualização de Cadastro: O sistema deve permitir que o munícipe atualize seus dados pessoais e foto. | Os dados poderão ser alterados somente pelo próprio usuário autenticado. **(Não Essencial)**             |
| RF-005 | Análise e Repasse de Demandas: Colaboradores podem aceitar/recusar e delegar demandas a operadores.  | Somente secretarias podem designar operadores para demandas aceitas. **(Essencial)**                     |
| RF-006 | Resolução de Demandas: Operadores devem enviar foto e descrição da solução prestada.                 | A demanda só será considerada concluída após envio de evidência da solução. **(Essencial)**              |
| RF-007 | Histórico de Demandas: O sistema deve exibir os pedidos realizados pelo munícipe com status.         | As demandas serão categorizadas como concluídas, em andamento ou recusadas. **(Essencial)**              |
| RF-008 | Devolução de Demandas: Operadores podem devolver demandas com justificativa.                         | A devolução requer um motivo registrado e será reavaliada pela secretaria. **(Essencial)**               |

### Requisitos Não Funcionais

| Código  | Requisito Não Funcional                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------- |
| RNF-001 | Segurança: O sistema deve implementar mecanismos de segurança e autenticação conforme práticas WAF.     |
| RNF-002 | Desempenho: O sistema deve responder às solicitações em até 2 segundos.                                 |
| RNF-003 | Usabilidade: Interface simples e intuitiva, mesmo para usuários com pouca familiaridade com tecnologia. |
| RNF-004 | Backup: O sistema deve possuir rotina de backup incremental dos dados atualizados.                      |

## 4 - Casos de Teste

Os casos de teste serão implementados ao longo do desenvolvimento, organizados em arquivos complementares. De forma geral, serão considerados cenários de sucesso, cenários de falha e as regras de negócio associadas a cada funcionalidade.

## 5 - Estratégia de Teste

A estratégia de teste adotada neste projeto busca garantir a qualidade funcional e estrutural do sistema por meio da aplicação de testes em múltiplos níveis, alinhados ao ciclo de desenvolvimento.

**Testes Unitários**: Cobertura de 70%, focando no comportamento isolado das funções e regras de negócio.
**Testes de Integração**: Verificam a interação entre as camadas e a integração com banco de dados.
**Testes Manuais**: Utilizam Swagger ou Postman para validar fluxos principais durante o desenvolvimento.

Cada funcionalidade terá seu plano de teste específico, com critérios de aceitação, cenários de sucesso e de falha.

## 6 - Ambiente e Ferramentas

Os testes serão feitos no ambiente de desenvolvimento, com as mesmas configurações do ambiente de produção.

| Ferramenta            | Time            | Descrição                                                      |
| --------------------- | --------------- | -------------------------------------------------------------- |
| POSTMAN, Swagger UI   | Desenvolvimento | Ferramentas para testes manuais de API                         |
| Jest                  | Desenvolvimento | Framework para testes unitários e de integração                |
| Supertest             | Desenvolvimento | Framework para testes de endpoints REST                        |
| MongoDB Memory Server | Desenvolvimento | Banco em memória para testes isolados de persistência de dados |

## 7 - Classificação de Bugs

| ID | Nível de Severidade | Descrição                                                                                      |
| -- | ------------------- | ---------------------------------------------------------------------------------------------- |
| 1  | Blocker             | Bug que bloqueia funcionalidades principais ou impede a entrega; crash ou botão não funcional. |
| 2  | Grave               | Funcionalidade não funciona como esperado; efeitos irreversíveis.                              |
| 3  | Moderada            | Não atende certos critérios de aceitação, mas a funcionalidade geral é preservada.             |
| 4  | Pequena             | Erros de UI, ortografia, ou pequenas falhas que não comprometem a funcionalidade.              |

## 8 - Definição de Pronto

Uma funcionalidade será considerada **pronta** quando:

* Passar por todos os testes definidos;
* Não apresentar bugs com severidade maior que moderada;
* Estiver validada pela equipe.

