# Integração da API Seek com o mobile

Os 64 endpoints de nova_api_seek têm métodos no cliente mobile e foram conferidos contra os arquivos de rotas do servidor. Isso comprova o contrato de URL, método e payload; não comprova, sozinho, o funcionamento autenticado no aparelho.

## Alterações entregues

- Endereço da API acompanha o host do Expo; removido o IP fixo antigo de .env.local e do exemplo.
- Cliente por domínio em src/services/seek.ts: sessão, usuários, projetos, categorias, seguidores, mensagens, notificações, preferências e vagas.
- Pesquisa de usuários por nome/e-mail, histórico e remoção de pesquisas, com acesso ao perfil encontrado.
- Salvamento de projetos nos três feeds e listas de salvos/curtidos com abertura do projeto e remoção da marcação.
- Detalhes de vagas, filtros reais por categoria, data e autor, categorias populares e combinação dos filtros por interseção.
- Primeiro login com tela própria de boas-vindas para PF/empresa, seleção de foto e currículo PDF para PF; retoma o preenchimento ao restaurar uma sessão incompleta. Detalhes em [primeiro-login.md](primeiro-login.md).
- Edição dos campos de PF/empresa preserva os outros campos e o currículo existente. O primeiro acesso envia um novo PDF como FormData quando selecionado.
- Mensagens usam a identidade do cookie, sem enviar IDs de remetente como credencial. Preferências salvam somente a chave alterada.
- Nome e foto do remetente são resolvidos pelos participantes retornados na lista de conversas, pois as mensagens contêm somente ID, remetente, texto e data. Contatos sem nome/foto recebem uma identificação padrão; falhas no histórico apresentam erro e opção de tentar novamente.
- Normalização de posts também aceita id_usuario, usado nas listas de salvos/curtidos.
- Corrigidas as declarações das abas: o navegador de abas registra o grupo (home), e o navegador interno registra seus três feeds.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Contratos, primeiro login, navegação durante troca de sessão e conversas | 45 testes passaram |
| Validadores de autenticação da API, executados diretamente do repositório da API | 5 testes passaram |
| Consulta real às 10 rotas GET públicas pelo navegador | JSON de sucesso confirmado; listagens e pesquisa responderam |
| Consulta real às 19 rotas GET protegidas sem cookie | Todas recusaram acesso sem autenticação |
| TypeScript | Sem erros |
| Lint | Sem erros; 16 avisos remanescentes em telas existentes |
| Exportação Android | Gerada; compilação não equivale a execução em aparelho |
| Exportação web | 51 páginas geradas; avisos das abas inexistentes resolvidos |

As verificações pelo navegador observaram o JSON visível; não capturaram os códigos HTTP nos cabeçalhos. Os testes de contrato usam dependências simuladas. Nenhuma conta, postagem, mensagem, curtida ou preferência existente foi modificada durante esta revisão.

`tests/messaging.test.cjs` monta as telas com React DOM e componentes nativos/HTTP simulados. O primeiro teste reproduziu o erro de `slice` com os campos reais selecionados pelo repositório da API antes da correção. A suíte cobre nome/foto ausentes, identificação dos remetentes, URL da foto, conversa vazia, pesquisa e abertura pela lista, envio, preservação do rascunho após falha e nova tentativa de carregamento. Não envia mensagens reais.

## Limitações da execução

O processo de comandos recebeu EACCES ao conectar a localhost:4500. O navegador alcançou a API existente, mas não alcançou o servidor de testes iniciado pelo processo restrito. Por isso, não foi possível executar os testes HTTP autenticados, as gravações temporárias ou uma navegação completa do mobile nesta sessão. A suíte de integração foi preparada para execução em um terminal normal da máquina.

Login, manutenção da sessão no Expo Go, uploads reais de perfil/banner/PDF, ativação e recuperação por e-mail, publicação de vaga/LinkedIn, envio de mensagem e seguimento com outra conta ainda precisam da validação de ponta a ponta. Não há teste de entrega de e-mails ou de disponibilidade do LinkedIn.

A API está fora da pasta gravável deste projeto e não foi alterada. Ela permite CORS para http://127.0.0.1:5501; o aplicativo nativo não depende de CORS. Para testar a versão web do app, use essa origem, mantendo a porta livre.

## Reexecutar

1. API e banco devem continuar iniciados.
2. Execute npm test e npx tsc --noEmit.
3. Execute npm run check:api em um terminal normal. Testa leituras públicas, campos obrigatórios e proteção das 64 rotas; não realiza gravações autenticadas.
4. Para o teste autenticado, execute node scripts/serve-api-check.cjs --insomnia ../nova_api_seek/tests/Insomnia_2026-08-22-10-42-07.yaml e abra http://127.0.0.1:5501. Também aceita SEEK_TEST_EMAIL e SEEK_TEST_PASSWORD no ambiente. Não grava credenciais no relatório.
5. No painel, a opção de escrita cria um projeto temporário e testa publicação, imagem, curtida, salvamento, comentário e resposta. Exclui o projeto ao finalizar. A API faz exclusão lógica; o registro e o arquivo de teste podem permanecer no armazenamento do servidor. Não limpa notificações nem altera credenciais ou perfis existentes.
6. Relatórios JSON ficam em .expo/verification/api-check.json e .expo/verification/api-live.json após executar as respectivas suítes.
7. Reinicie o Expo com npm start -- --lan e valide os fluxos no celular, na mesma rede do computador.

## Matriz de cobertura

Todos os itens abaixo têm contrato do cliente validado. A coluna de execução descreve somente o que foi observado nesta sessão.

| Método | Rota | Execução real |
| --- | --- | --- |
| POST | /usuarios | HTTP pendente; contrato do cliente validado |
| POST | /usuarios/verificar-codigo | HTTP pendente; contrato do cliente validado |
| POST | /usuarios/reenviar-codigo | HTTP pendente; contrato do cliente validado |
| GET | /usuarios/verificar-primeiro-login | Sem sessão: acesso recusado; sucesso autenticado pendente |
| PATCH | /usuarios/completar-cadastro | HTTP pendente; contrato do cliente validado |
| GET | /usuarios/historico-pesquisas | Sem sessão: acesso recusado; sucesso autenticado pendente |
| DELETE | /usuarios/historico-pesquisas/:id | HTTP pendente; contrato do cliente validado |
| GET | /usuarios/pesquisar | Consulta pública: sucesso |
| GET | /usuarios/perfil | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /usuarios/:id | Consulta pública: sucesso |
| PUT | /usuarios/foto-perfil | HTTP pendente; contrato do cliente validado |
| PUT | /usuarios/banner-perfil | HTTP pendente; contrato do cliente validado |
| PUT | /usuarios/perfil-empresa | HTTP pendente; contrato do cliente validado |
| PUT | /usuarios/perfil-pessoa-fisica | HTTP pendente; contrato do cliente validado |
| GET | /categorias/populares | Consulta pública: sucesso |
| POST | /posts | HTTP pendente; contrato do cliente validado |
| POST | /posts/:id/like | HTTP pendente; contrato do cliente validado |
| DELETE | /posts/:id/like | HTTP pendente; contrato do cliente validado |
| GET | /posts/curtidos | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /posts/:id/salvar | HTTP pendente; contrato do cliente validado |
| DELETE | /posts/:id/salvar | HTTP pendente; contrato do cliente validado |
| GET | /posts/salvos | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /posts/:id/comentarios | HTTP pendente; contrato do cliente validado |
| POST | /posts/comentarios/:id/respostas | HTTP pendente; contrato do cliente validado |
| GET | /posts/comentarios/:id/respostas | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /posts | Consulta pública: sucesso |
| GET | /posts/categoria/:id_categoria | Consulta pública: sucesso |
| GET | /posts/usuario/:id_usuario | Consulta pública: sucesso |
| DELETE | /posts/:id | HTTP pendente; contrato do cliente validado |
| GET | /posts/:id | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /auth/login | HTTP pendente; contrato do cliente validado |
| POST | /auth/logout | HTTP pendente; contrato do cliente validado |
| GET | /auth/me | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /auth/id | Sem sessão: acesso recusado; sucesso autenticado pendente |
| PUT | /auth/password | HTTP pendente; contrato do cliente validado |
| PUT | /auth/email | HTTP pendente; contrato do cliente validado |
| POST | /auth/email/confirmar | HTTP pendente; contrato do cliente validado |
| POST | /auth/esqueci-senha | HTTP pendente; contrato do cliente validado |
| POST | /auth/redefinir-senha | HTTP pendente; contrato do cliente validado |
| POST | /seguidores/:id | HTTP pendente; contrato do cliente validado |
| DELETE | /seguidores/:id | HTTP pendente; contrato do cliente validado |
| GET | /seguidores/seguidores/:id | Consulta pública: sucesso |
| GET | /seguidores/seguindo/:id | Consulta pública: sucesso |
| GET | /seguidores/status/:id | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /notificacoes | Sem sessão: acesso recusado; sucesso autenticado pendente |
| DELETE | /notificacoes | HTTP pendente; contrato do cliente validado |
| PATCH | /notificacoes/:id/lida | HTTP pendente; contrato do cliente validado |
| DELETE | /notificacoes/:id | HTTP pendente; contrato do cliente validado |
| GET | /preferencias-notificacoes | Sem sessão: acesso recusado; sucesso autenticado pendente |
| PUT | /preferencias-notificacoes | HTTP pendente; contrato do cliente validado |
| POST | /mensagens/conversas | HTTP pendente; contrato do cliente validado |
| GET | /mensagens/conversas | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /mensagens/conversas/:id_conversa/mensagens | HTTP pendente; contrato do cliente validado |
| GET | /mensagens/conversas/:id_conversa/mensagens | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /vagas | HTTP pendente; contrato do cliente validado |
| GET | /vagas | Consulta pública: sucesso |
| GET | /vagas/categoria/:categoria | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /vagas/data | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /vagas/mais-utilizados | Consulta pública: sucesso |
| GET | /vagas/favoritas | Sem sessão: acesso recusado; sucesso autenticado pendente |
| GET | /vagas/usuario/:id | Sem sessão: acesso recusado; sucesso autenticado pendente |
| POST | /vagas/:id/favoritar | HTTP pendente; contrato do cliente validado |
| GET | /vagas/:id | Sem sessão: acesso recusado; sucesso autenticado pendente |
| DELETE | /vagas/:id/favoritar | HTTP pendente; contrato do cliente validado |
