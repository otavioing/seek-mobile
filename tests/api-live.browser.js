/* global apiClient, seek */
document.querySelector('#run').addEventListener('click', async () => {
  const button = document.querySelector('#run');
  const output = document.querySelector('#results');
  const summary = document.querySelector('#summary');
  button.disabled = true; output.textContent = ''; summary.textContent = 'Testando…';
  const results = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const check = async (name, action, expected = 200, inspect) => {
    let response;
    try {
      try { response = await action(); } catch (error) { if (!error.response) throw error; response = error.response; }
      assert([].concat(expected).includes(response.status), `HTTP ${response.status}; esperado ${expected}`);
      if (inspect) inspect(response.data);
      results.push({ name, result: 'pass', status: response.status });
    } catch (error) { results.push({ name, result: 'fail', status: response?.status, error: error.message }); }
    const last = results[results.length - 1];
    output.textContent += `${last.result.toUpperCase()} ${name}${last.status ? ` — HTTP ${last.status}` : ''}${last.error ? ` — ${last.error}` : ''}\n`;
    return response;
  };
  const skip = (name, reason) => { results.push({ name, result: 'skip', reason }); output.textContent += `SKIP ${name} — ${reason}\n`; };
  const list = value => assert(Array.isArray(value), 'Resposta deve ser uma lista após o interceptor do mobile');
  const { api } = apiClient;
  const raw = (method, url, body) => api.request({ method, url, data: ['GET', 'DELETE'].includes(method) ? undefined : body ?? {} });
  let temporaryPost;
  try {
    await check('Limpar somente a sessão do navegador de teste', () => seek.authApi.logout(), [200, 401]);
    const initial = await check('Sessão ausente', () => seek.authApi.me(), 401);
    assert(initial?.status === 401, 'Sessão não foi removida; testes sem autenticação interrompidos para preservar os dados.');
    const routes = await (await fetch('/routes.json')).json();
    for (const route of routes.filter(value => value.protected)) {
      const url = route.path.replace(/:[^/]+/g, '2147483647');
      await check(`Proteção ${route.method} ${route.path}`, () => raw(route.method, url), 401);
    }
    const posts = await check('Feed público', () => seek.postsApi.list(), 200, list);
    await check('Categorias populares de projetos', () => seek.postsApi.popularCategories(), 200, list);
    const jobs = await check('Vagas públicas', () => seek.jobsApi.list(), 200, list);
    await check('Categorias populares de vagas', () => seek.jobsApi.popularCategories(), 200, list);
    const userId = posts?.data?.[0]?.criador?.id || 1;
    await check('Página pública de usuário', () => seek.usersApi.page(userId), 200, value => assert(value.nome, 'Nome ausente'));
    await check('Projetos do usuário', () => seek.postsApi.byUser(userId), 200, list);
    await check('Projetos por categoria', () => seek.postsApi.byCategory(1), [200, 404]);
    await check('Seguidores', () => seek.followsApi.followers(userId), 200, list);
    await check('Seguindo', () => seek.followsApi.following(userId), 200, list);
    await check('Pesquisa sem gravar histórico', () => seek.usersApi.search('Seek teste inexistente 982543', false), 200, list);
    for (const [method, url] of [['POST', '/usuarios'], ['POST', '/usuarios/verificar-codigo'], ['POST', '/usuarios/reenviar-codigo'], ['POST', '/auth/login'], ['POST', '/auth/esqueci-senha'], ['POST', '/auth/redefinir-senha']]) await check(`Validação ${method} ${url}`, () => raw(method, url), 400);
    await check('Pesquisa vazia', () => seek.usersApi.search(''), 400);
    await check('Limite de categorias inválido', () => seek.jobsApi.popularCategories(100), 400);
    await check('Login inválido', () => seek.authApi.login('seek-test-does-not-exist@example.invalid', 'invalid-password'), 401);
    const includeLogin = document.querySelector('#login').checked;
    const fixture = includeLogin ? await (await fetch('/fixture.json')).json() : null;
    if (fixture) {
      const login = await check('Login com cookie HTTP-only', () => seek.authApi.login(fixture.email, fixture.senha), 200, value => assert(value.usuario?.id, 'ID da conta ausente'));
      if (login?.status === 200) {
        const me = await check('Restaurar sessão por /auth/me', () => seek.authApi.me(), 200, value => assert(value.usuario?.id, 'Sessão não restaurada'));
        const id = me.data.usuario.id;
        const identity = await check('ID autenticado', () => seek.authApi.id(), 200);
        assert(identity.data.id === id, 'IDs de sessão divergentes');
        const profile = await check('Perfis completos', () => seek.usersApi.profiles(), 200);
        await check('Primeiro login', () => seek.usersApi.firstLogin(), 200, value => assert(typeof value.primeiro_login === 'boolean', 'Flag inválida'));
        await check('Histórico de pesquisa', () => seek.usersApi.searchHistory(), 200, list);
        await check('Favoritos de vagas', () => seek.jobsApi.favorites(), 200, list);
        await check('Projetos curtidos', () => seek.postsApi.liked(), 200, list);
        await check('Projetos salvos', () => seek.postsApi.saved(), 200, list);
        await check('Vagas do usuário', () => seek.jobsApi.byUser(id), 200, list);
        await check('Vagas por categoria', () => seek.jobsApi.byCategory('Categoria inexistente 982543'), 200, list);
        await check('Vagas por data', () => seek.jobsApi.byDate('2000-01-01', '2099-12-31'), 200, list);
        await check('Preferências de notificações', () => seek.notificationsApi.preferences(), 200);
        await check('Notificações', () => seek.notificationsApi.list(), 200, list);
        await check('Status de seguimento', () => seek.followsApi.status(userId), 200);
        const conversations = await check('Conversas', () => seek.messagesApi.conversations(), 200, list);
        const conversationId = conversations?.data?.[0]?.id_conversa;
        if (conversationId) await check('Histórico de mensagens autorizado', () => seek.messagesApi.messages(conversationId), 200, list);
        else skip('Histórico de mensagens autorizado', 'Conta sem conversas existentes');
        const postId = posts?.data?.[0]?.id;
        if (postId) {
          const detail = await check('Detalhes do projeto', () => seek.postsApi.detail(postId), 200, value => assert(Array.isArray(value.comentarios), 'Comentários ausentes'));
          const commentId = detail?.data?.comentarios?.[0]?.id;
          if (commentId) await check('Respostas de comentário existente', () => seek.postsApi.replies(commentId), 200, list);
        }
        if (jobs?.data?.[0]?.id) await check('Detalhes da vaga', () => seek.jobsApi.detail(jobs.data[0].id), 200);
        else skip('Detalhes da vaga existente', 'Nenhuma vaga cadastrada');
        await check('Foto sem arquivo: validação', () => seek.usersApi.updatePhoto(new FormData()), 400);
        await check('Banner sem arquivo: validação', () => seek.usersApi.updateBanner(new FormData()), 400);
        const wrongProfile = profile?.data?.tipo_usuario === 'PF' ? '/usuarios/perfil-empresa' : '/usuarios/perfil-pessoa-fisica';
        await check('Restrição do tipo de perfil', () => api.put(wrongProfile, {}), 403);
        await check('Preferências sem objeto', () => api.put('/preferencias-notificacoes', {}), 400);
        await check('Datas invertidas', () => seek.jobsApi.byDate('2026-11-19', '2026-01-01'), 400);
        await check('Criação de vaga inválida', () => api.post('/vagas', { url: 'invalid', categorias: [] }), 400);
        await check('Nova conversa consigo mesmo bloqueada', () => seek.messagesApi.startConversation(id), 400);
        await check('Mensagens de conversa não autorizada', () => seek.messagesApi.messages(2147483647), 403);
        await check('Envio a conversa não autorizada', () => seek.messagesApi.send(2147483647, 'Teste sem destinatário'), 403);
        await check('Seguir a si mesmo bloqueado', () => seek.followsApi.follow(id), 400);
        await check('Remover seguimento inexistente', () => seek.followsApi.unfollow(2147483647), [400, 404]);
        await check('Excluir pesquisa inexistente', () => seek.usersApi.deleteSearch(2147483647), 404);
        await check('Ler notificação inexistente', () => seek.notificationsApi.read(2147483647), [200, 404]);
        await check('Excluir notificação inexistente', () => seek.notificationsApi.remove(2147483647), [200, 404]);
        // Missing fields are rejected before password/email changes or SMTP.
        await check('Alteração de senha sem dados', () => api.put('/auth/password', {}), 400);
        await check('Alteração de e-mail sem dados', () => api.put('/auth/email', {}), 400);
        await check('Confirmação de e-mail sem código', () => seek.authApi.confirmEmail(''), 400);
        if (document.querySelector('#writes').checked) {
          const form = new FormData();
          form.append('titulo', `Teste de integração Seek ${new Date().toISOString()}`);
          form.append('descricao', 'Registro temporário para testar a integração mobile. Excluído ao finalizar.');
          form.append('visibilidade', 'publico'); form.append('permissao_comentarios', 'todos'); form.append('categorias', '[]');
          const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4u8AAAAASUVORK5CYII='), c => c.charCodeAt(0));
          form.append('imagens', new Blob([bytes], { type: 'image/png' }), 'seek-integration.png');
          const created = await check('Criar projeto temporário com imagem multipart', () => seek.postsApi.create(form), 201, value => assert(value.id, 'ID do novo projeto ausente'));
          temporaryPost = created?.status === 201 ? created.data.id : null;
          if (temporaryPost) {
            const detail = await check('Imagem e autor do novo projeto', () => seek.postsApi.detail(temporaryPost), 200, value => assert(value.usuario_id === id && value.imagens.length === 1, 'Imagem ou autoria incorreta'));
            if (detail?.data?.imagens?.[0]) await check('Arquivo enviado acessível por HTTP', () => api.get(detail.data.imagens[0]), 200);
            await check('Curtir projeto temporário', () => seek.postsApi.like(temporaryPost), 200);
            await check('Curtida persistida', () => seek.postsApi.detail(temporaryPost), 200, value => assert(value.usuario_curtiu === true, 'Curtida não persistiu'));
            await check('Descurtir projeto temporário', () => seek.postsApi.unlike(temporaryPost), 200);
            await check('Salvar projeto temporário', () => seek.postsApi.save(temporaryPost), 200);
            await check('Salvamento persistido', () => seek.postsApi.saved(), 200, value => assert(value.some(item => item.id === temporaryPost), 'Projeto não está nos salvos'));
            await check('Remover salvamento temporário', () => seek.postsApi.unsave(temporaryPost), 200);
            const comment = await check('Comentar no projeto temporário', () => seek.postsApi.comment(temporaryPost, 'Comentário de teste'), 201);
            if (comment?.data?.id) {
              await check('Responder ao comentário temporário', () => seek.postsApi.reply(comment.data.id, 'Resposta de teste'), 201);
              await check('Ler resposta persistida', () => seek.postsApi.replies(comment.data.id), 200, value => assert(value.some(item => item.resposta === 'Resposta de teste'), 'Resposta não persistiu'));
            }
          }
        } else skip('Escritas em projeto temporário', 'Teste de escrita não selecionado');
      } else skip('Fluxos autenticados', 'Credenciais da coleção não foram aceitas');
    } else skip('Fluxos autenticados', 'Credenciais não configuradas');
  } catch (error) { results.push({ name: 'Execução', result: 'fail', error: error.message }); output.textContent += `FAIL Execução — ${error.message}\n`; }
  finally {
    if (temporaryPost) {
      await check('Excluir somente o projeto temporário', () => seek.postsApi.remove(temporaryPost), 200);
      await check('Projeto temporário ausente do feed', () => seek.postsApi.list(), 200, value => assert(!value.some(item => item.id === temporaryPost), 'Limpeza não concluiu'));
    }
    await check('Logout', () => seek.authApi.logout(), [200, 401]);
    await check('Sessão removida após logout', () => seek.authApi.me(), 401);
    const counts = Object.fromEntries(['pass', 'fail', 'skip'].map(key => [key, results.filter(value => value.result === key).length]));
    summary.textContent = `${counts.pass} passaram · ${counts.fail} falharam · ${counts.skip} não executados`;
    const report = { timestamp: new Date().toISOString(), transport: 'Browser / Axios real e serviços do mobile; Platform web e navegação simuladas', counts, results };
    await fetch('/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report) });
    button.disabled = false;
  }
});
