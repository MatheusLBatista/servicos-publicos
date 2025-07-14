# Plano de Teste

**Serviços Públicos - Vilhena+ Pública**

*versão 1.1*

## Histórico das alterações

| Data       | Versão | Descrição                         | Autor(a)    |
| ---------- | ------ | --------------------------------- | ----------- |
| 01/06/2025 | 1.0    | Primeira versão do plano de teste | Giullia e Matheus Lucas |
| 08/07/2025 | 1.1    | SEgunda versão do plano de teste  | Giullia e Matheus Lucas |

## 1 - Introdução

O nosso sistema tem como objetivo possibilitar uma comunicação eficiente entre a prefeitura de Vilhena-RO e seus munícipes, facilitando o acesso aos serviços públicos. O site permite o cadastro e gerenciamento de usuários e demandas, oferecendo funcionalidades para diferentes perfis: munícipes, operadores, secretarias e administradores.

Este plano de teste descreve os cenários, critérios de aceitação e verificações que serão aplicados às funcionalidades principais do sistema, visando assegurar o funcionamento correto, a integridade dos dados e a experiência do usuário.

## 2 - Arquitetura da API

A aplicação é construída em uma arquitetura modular em camadas, utilizando Node.js, Express, MongoDB com Mongoose, Zod para validação dos dados, JWT para autenticação e Swagger para documentação da API.

### Camadas:

* **Routes**: Definem os endpoints da API e direcionam as requisições para os controllers.
* **Controllers**: Recebem e validam as requisições, chamando os serviços correspondentes.
* **Services**: Contêm as regras de negócio e controlam os fluxos das operações.
* **Repositories**: Acessam os dados no banco MongoDB, isolando a lógica de persistência.
* **Models**: Definem os schemas das entidades do banco.
* **Validations**: Implementam as regras de validação com Zod.
* **Middlewares**: Gerenciam autenticação, tratamento de erros e permissões.

## 3 - Categorização dos Requisitos Funcionais e Não Funcionais

### Requisitos Funcionais

| Código | Nome                          | Descrição                                                                                                        | Prioridade    |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| RF-001 | Cadastro de Usuários          | O sistema deve permitir que o munícipe insira seus dados para cadastro. O login só será permitido após cadastro. | Essencial     |
| RF-002 | Login do Usuário              | Permitir acesso ao sistema por perfis: Munícipe, Operador, Administrador e Secretaria, apenas se cadastrado.     | Essencial     |
| RF-003 | Solicitação de Demandas       | Munícipes podem solicitar serviços das secretarias, organizados por categorias.                                  | Essencial     |
| RF-004 | Atualização de Cadastro       | Permitir que o munícipe atualize seus dados pessoais e foto de perfil.                                           | Não Essencial |
| RF-005 | Análise e Repasse de Demandas | Colaboradores (secretarias) analisam demandas, aceitam ou recusam, e delegam operadores.                         | Essencial     |
| RF-006 | Resolução de Demandas         | Operadores podem enviar foto e descrição do serviço prestado para resolver a demanda.                            | Essencial     |
| RF-007 | Histórico de Demandas         | Exibir demandas do munícipe categorizadas como concluídas, em andamento ou recusadas.                            | Essencial     |
| RF-008 | Devolução de Demandas         | Operadores podem devolver demandas atribuídas a eles.                                                            | Essencial     |

### Requisitos Não Funcionais

| Código  | Nome        | Descrição                                                                                                             |
| ------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| RNF-001 | Segurança   | Implementar mecanismos de segurança e autenticação alinhados ao processo WAF, garantindo proteção e integridade.      |
| RNF-002 | Desempenho  | Responder às solicitações em até 2 segundos para garantir boa experiência do usuário.                                 |
| RNF-003 | Usabilidade | Apresentar interface simples, intuitiva e acessível para usuários com diferentes níveis de familiaridade tecnológica. |
| RNF-004 | Backup      | Implementar rotina de backup incremental para garantir integridade e disponibilidade dos dados.                       |

## 4 - Casos de Teste
Os casos de teste serão implementados ao longo do desenvolvimento, organizados em arquivos complementares. De forma geral, serão considerados cenários de sucesso, cenários de falha e as regras de negócio associadas a cada funcionalidade.


## 5 - Estratégia de Teste

A estratégia de teste adotada neste projeto busca garantir a qualidade funcional e estrutural do sistema da biblioteca por meio da aplicação de testes em múltiplos níveis, alinhados ao ciclo de desenvolvimento.

Serão executados testes em todos os níveis conforme a descrição abaixo.

**Testes Unitários**: Focados em verificar o comportamento isolado das funções, serviços e regras de negócio, o código terá uma cobertura de 70% de testes unitários, que são de responsabilidade dos desenvolvedores.

**Testes de Integração**: Verificarão a interação entre diferentes camadas (ex: controller + service + repository) e a integração com o banco de dados, serão executados testes de integração em todos os endpoints, e esses testes serão dos desenvolvedores.

**Testes Manuais**: Realizados pontualmente na API por meio do Swagger ou Postman, com o objetivo de validar diferentes fluxos de uso e identificar comportamentos inesperados durante o desenvolvimento. A execução desses testes é de responsabilidade dos desenvolvedores, tanto durante quanto após a implementação das funcionalidades.

Os testes serão implementados de forma incremental, acompanhando o desenvolvimento das funcionalidades. Cada funcionalidade terá seu próprio plano de teste específico, com os casos detalhados, critérios de aceitação e cenários de sucesso e falha.

## 6 -	Ambiente e Ferramentas

Os testes serão feitos do ambiente de desenvolvimento, e contém as mesmas configurações do ambiente de produção.

As seguintes ferramentas serão utilizadas no teste:

Ferramenta | 	Time |	Descrição 
-----------|--------|--------
POSTMAN, Swagger UI 	| Desenvolvimento|	Ferramenta para realização de testes manuais de API
Jest|	Desenvolvimento |Framework utilizada para testes unitários e integração
Supertest|	Desenvolvimento|	Framework utilizada para testes de endpoints REST
MongoDB Memory Server|	Desenvolvimento|	Para testes com banco em memória, garantindo isolamento dos dados


## 7 - Classificação de Bugs

Os Bugs serão classificados com as seguintes severidades:

ID 	|Nivel de Severidade |	Descrição 
-----------|--------|--------
1	|Blocker |	●	Bug que bloqueia o teste de uma função ou feature causa crash na aplicação. <br>●	Botão não funciona impedindo o uso completo da funcionalidade. <br>●	Bloqueia a entrega. 
2	|Grave |	●	Funcionalidade não funciona como o esperado <br>●	Input incomum causa efeitos irreversíveis
3	|Moderada |	●	Funcionalidade não atinge certos critérios de aceitação, mas sua funcionalidade em geral não é afetada <br>●	Mensagem de erro ou sucesso não é exibida
4	|Pequena |	●	Quase nenhum impacto na funcionalidade porém atrapalha a experiência  <br>●	Erro ortográfico<br>● Pequenos erros de UI


### 8 - Definição de Pronto 
Será considerada pronta as funcionalidades que passarem pelas verificações e testes descritas nos casos de teste, não apresentarem bugs com a severidade acima de moderada, e passarem por uma validação da equipe.