# Primeiro login no mobile

O mobile reproduz o fluxo do site atual em `C:/xampp/htdocs/seek`, sem modificar o site ou a API.

## Comportamento conferido no site

O script `js/conexao_com_api/completar_cadastro.js` aguarda a confirmação da sessão por `/auth/me`, consulta `/usuarios/verificar-primeiro-login` e abre o modal correspondente ao `tipo_usuario` quando `primeiro_login` é `true`.

| Pessoa física | Empresa |
| --- | --- |
| Foto de perfil | Foto de perfil |
| Nome de usuário | Nome fantasia |
| Descrição | Categoria de negócio |
| LinkedIn | Razão social |
| GitHub | Número de funcionários |
| Currículo PDF | Telefone, site e descrição |

O HTML do site tem um campo “Sua profissão”, mas o JavaScript não o envia e a API não tem uma coluna correspondente no perfil. No mobile, a descrição permite informar profissão e projetos, e esse texto é salvo em `sobre`.

## Implementação

- `app/completarCadastro.tsx`: boas-vindas com formulário por tipo de conta, prévia da foto, seleção de PDF, carregamento, mensagens de erro e opção de sair da conta.
- `src/services/onboarding.ts`: consulta da sessão/flag, decisão de navegação, preservação de campos fora do formulário, validações e sequência de gravação.
- `src/services/uploads.ts`: envio multipart com nome, URI e MIME corretos no nativo; Blob no navegador.
- `src/services/documentPicker.ts`: seletor PDF web e ponte para o módulo nativo ExpoDocumentPicker no Expo Go.
- `app/login.tsx` e `app/_layout.tsx`: encaminham à tela inicial apenas quando o cadastro está concluído. A restauração de sessão também consulta a flag do servidor; falhas de rede permitem tentar novamente, sem assumir cadastro concluído.
- A tela comum de edição do perfil permanece separada da conclusão do primeiro acesso.

O fluxo grava o perfil, envia a foto selecionada e só então chama `PATCH /usuarios/completar-cadastro`. Se qualquer etapa falhar, a tela mantém os dados para nova tentativa. Ao reabrir o app, um cadastro ainda incompleto é carregado novamente da API. Os dados de contato, endereço e currículo já existentes são preservados quando não estão sendo alterados.

Não há uma flag local que substitua `cadastro_completo` no banco. A conclusão realizada no site e a realizada no mobile usam a mesma API.

## PDF e instalação

O projeto é executado atualmente pelo Expo Go. O seletor usa `ExpoDocumentPicker`, módulo nativo do Expo Go, com um PDF por vez e cópia para o cache. A escolha de arquivos no navegador usa um input de arquivo próprio. Cancelar não remove o currículo existente.

Para gerar um aplicativo nativo próprio, instale `expo-document-picker` com `npx expo install expo-document-picker` e gere novamente o aplicativo, para que o módulo nativo seja incluído. O SDK 53 deste projeto recomenda `~13.1.6`. A instalação pelo ambiente automatizado foi tentada e falhou por indisponibilidade de DNS para o registro npm; nenhuma dependência ausente foi adicionada ao package.json ou ao lockfile. Caso o módulo não esteja presente no aplicativo em uso, a tela apresenta uma mensagem e ainda permite concluir sem anexo, como no site.

## Testes

Execute `npm test`, `npx tsc --noEmit` e `npm run lint`.

Nesta revisão, os 45 testes passaram, o TypeScript terminou sem erros e as exportações Android e web foram geradas. O lint terminou sem erros, com 16 avisos nas demais telas.

A suíte inclui PF e empresa, primeira entrada, conta já concluída, restauração de cadastro incompleto, resposta inválida da API, sessão expirada, preservação de dados, PDF multipart, foto, validações, cancelamento do seletor e falhas em cada etapa de gravação. Também executa a lógica do script real do site em um DOM simulado para conferir a abertura dos dois modais. Esse teste é omitido fora da máquina caso o arquivo do site não exista.

Os testes usam transporte e módulo nativo simulados. Não alteram usuários existentes. O teste final no Expo Go deve incluir uma conta PF e uma conta EMPRESA ainda incompletas, escolher foto/PDF, sair e retomar o cadastro, concluir e entrar novamente. Conexões autenticadas e a abertura do seletor no aparelho não puderam ser exercitadas pelo ambiente restrito desta sessão.

## Correção de navegação após o login

A propriedade `key` dependente do usuário em `PostsProvider` remontava também o navegador raiz. O Expo Router já tinha enfileirado uma ação `REPLACE` direcionada à chave antiga do navegador; ao executar essa ação, o React Navigation não encontrava o destino e exibia o aviso para `(tabs)` ou `completarCadastro`.

Os provedores agora recebem `sessionUserId` sem recriar seus filhos. Eles limpam posts, comentários e perfil quando a sessão muda, e ignoram respostas de requisições da conta anterior. O navegador mantém a mesma identidade durante login, restauração e logout. O botão de início usa uma ação de navegação compatível com abas.

`tests/navigation-lifecycle.test.cjs` monta o layout com React DOM e usa a criação de ações do Expo Router instalado e os redutores do React Navigation. Antes da correção, o teste reproduziu exatamente o payload de erro enviado; depois, login, primeiro acesso e saída passaram sem remontar o navegador. A suíte também verifica limpeza dos quatro contextos e descarte de respostas antigas.
