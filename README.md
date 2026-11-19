# Seek Mobile

Aplicativo Expo integrado à API Seek local. O celular acessa a API; somente a API acessa o banco MySQL/MariaDB.

## Executar no celular

1. Mantenha o banco iniciado.
2. Na pasta da API, execute `node server.js` (porta configurada por `APP_PORT`, atualmente 4500).
3. Nesta pasta, execute `npm start -- --lan` e abra o QR Code no Expo Go. PC e celular devem estar na mesma rede Wi-Fi.
Se o Expo falhar na consulta externa de versões, execute `npm start -- --offline` (a conexão local com a API continua funcionando).

4. Entre com uma conta ativa. Novos cadastros precisam do código de ativação recebido por e-mail. A configuração SMTP da API é necessária para ativação e recuperação de senha.

Por padrão, o mobile usa o host do Expo na porta 4500 e acompanha mudanças de IP. Deixe `EXPO_PUBLIC_API_URL` vazio em `.env.local` para usar esse comportamento. Para informar outro endereço, copie `.env.example` para `.env.local`, ajuste `EXPO_PUBLIC_API_URL` e reinicie o Expo. Em emulador Android, `10.0.2.2` acessa o PC; `localhost` no celular é o próprio aparelho. Modo tunnel do Expo não publica a API; informe uma URL acessível ao aparelho nesse caso. Se a API responder no PC e não no aparelho, confira se o firewall permite a porta 4500 na rede privada.

A versão web exige CORS compatível na API. O servidor atual permite apenas `http://127.0.0.1:5501`; essa configuração não foi alterada. O alvo desta integração é o mobile Android/iOS.

## Integração

- Sessão via cookie HTTP-only, `withCredentials`, login/logout e consulta `/auth/me`. Nenhum JWT é armazenado no aplicativo. O indicador local de sessão não substitui a validação pela API.
- A troca de sessão limpa os contextos e descarta respostas antigas sem desmontar o navegador, preservando os redirecionamentos de login e primeiro acesso.
- Cadastro PF/EMPRESA com CNPJ, ativação/reenvio de código, recuperação de senha, alteração de senha e confirmação de novo e-mail.
- Feed, categorias populares, posts de usuário, pessoas seguidas, perfis, seguidores, likes, comentários e respostas.
- Publicações multipart com os campos documentados; edição de informações do perfil, foto e banner com rotas separadas.
- Conversas e mensagens por HTTP; atualização ao abrir/recarregar, sem WebSocket ou confirmação de leitura (inexistentes na API).
- Vagas cadastradas na API, publicação por empresas, detalhes, favoritos, categorias populares e filtros por categoria, intervalo de datas e autor. Filtros simultâneos combinam os resultados retornados pela API.
- Pesquisa de pessoas/empresas por nome ou e-mail, histórico e remoção de pesquisas.
- Projetos salvos, curtidos e remoção de salvamento/curtida; botão de salvar nos três feeds.
- Primeiro login com tela própria de boas-vindas, baseada no site atual: formulário PF/empresa, foto e currículo PDF para PF. A verificação também ocorre ao restaurar a sessão; a conclusão só é gravada depois de salvar o perfil e os arquivos selecionados. Contas já concluídas seguem para o feed.
- Edição dos campos PF/empresa preservando os demais dados e o currículo existente.
- Preferências de e-mail de notificações atualizadas por chave, sem sobrescrever as demais.

Cursos, stories, edição de posts, alteração do nome cadastrado e silenciamento temporário não têm rotas correspondentes na API atual. O app informa a indisponibilidade e não simula gravação local bem-sucedida. Preferências sem suporte também não são gravadas. Os filtros antigos de projetos/cursos ainda são protótipos; o filtro de vagas está conectado.

## Verificar

- `npx tsc --noEmit`
- `npm run lint`
- `npm test` (contratos, cobertura das 64 rotas, payloads, multipart, sessão e combinação de filtros, com transporte simulado; não grava no banco).
- `npm run check:api` (64 rotas: leituras públicas, validações e exigência de sessão; API precisa estar rodando). Aceita `EXPO_PUBLIC_API_URL`, com padrão `http://127.0.0.1:4500`. Relatório em `.expo/verification/api-check.json`.
- `npm run check:api:browser` e abra `http://127.0.0.1:5501`: testes HTTP usando Axios e os serviços reais do mobile. A porta 5501 precisa estar livre. Credenciais opcionais por `SEEK_TEST_EMAIL` / `SEEK_TEST_PASSWORD`, ou `node scripts/serve-api-check.cjs --insomnia ../nova_api_seek/tests/Insomnia_2026-08-22-10-42-07.yaml`. Credenciais permanecem em memória e não aparecem no relatório. Selecione o teste de escrita para criar um projeto temporário, enviar uma imagem, curtir, salvar, comentar, responder e excluir o projeto ao finalizar; a API faz exclusão lógica. Não envia mensagens a outros usuários nem modifica senhas, e-mails ou perfis existentes. Relatório em `.expo/verification/api-live.json`.
- `npx expo export --platform android --output-dir .expo/verification-android`

A validação no dispositivo deve incluir login, reabertura do app, logout, ativação por e-mail, upload, comentário/resposta, seguir/deixar de seguir e envio de mensagem. Os testes automáticos não substituem esses passos nem comprovam a entrega de e-mail/LinkedIn. Nenhuma migração ou importação de dados é necessária para esta integração.

O inventário está em `tests/fixtures/api-routes.json`; os serviços correspondentes estão em `src/services/seek.ts`. O teste compara o inventário com `../nova_api_seek/src/routes` quando essa pasta existe. Resultados e limitações desta revisão: [docs/integracao-api.md](docs/integracao-api.md).

O fluxo de boas-vindas, os testes e a configuração do seletor PDF para Expo Go/builds próprios estão em [docs/primeiro-login.md](docs/primeiro-login.md).
