const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const routes = require('./fixtures/api-routes.json');

function load(responses = {}) {
  const calls = [];
  const api = Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [method, (url, body, config) => {
    calls.push({ method: method.toUpperCase(), path: url, body, config });
    return Promise.resolve({ data: responses[url] || [] });
  }]));
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/services/seek.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require: () => ({ api }), FormData });
  return { ...module.exports, calls };
}
const args = {
  authApi: { login: [' seek@example.invalid ', 'password'], logout: [], me: [], id: [], changePassword: ['current', 'new'], changeEmail: [' new@example.invalid ', 'password'], confirmEmail: ['123456'], forgotPassword: [' seek@example.invalid '], resetPassword: [' seek@example.invalid ', '123456', 'new'] },
  usersApi: { create: [{}], verify: ['seek@example.invalid', '123456'], resendCode: ['seek@example.invalid'], firstLogin: [], completeRegistration: [], search: [' café & vagas ', false], searchHistory: [], deleteSearch: [1], profiles: [], page: [1], updatePhoto: [new FormData()], updateBanner: [new FormData()], updateCompany: [{}], updatePerson: [{}] },
  postsApi: { list: [], detail: [1], create: [new FormData()], remove: [1], byCategory: [1], byUser: [1], popularCategories: [], like: [1], unlike: [1], liked: [], save: [1], unsave: [1], saved: [], comment: [1, ' Comentário '], reply: [1, ' Resposta '], replies: [1] },
  followsApi: { follow: [1], unfollow: [1], followers: [1], following: [1], status: [1] },
  messagesApi: { startConversation: [1], conversations: [], send: [1, ' Olá '], messages: [1] },
  notificationsApi: { list: [], clear: [], read: [1], remove: [1], preferences: [], updatePreferences: [{ email_login: false }] },
  jobsApi: { list: [], create: [{ titulo: 'Vaga', descricao: 'Descrição', url: 'https://example.invalid/job', categorias: ['Design'] }], byCategory: [1], byDate: ['2026-11-01', '2026-11-19'], popularCategories: [], favorites: [], byUser: [1], favorite: [1], detail: [1], unfavorite: [1] },
};
const matches = (route, method, url) => route.method === method && new RegExp('^' + route.path.replace(/:[^/]+/g, '[^/]+') + '$').test(url);

test('every one of the 64 API routes has an executable mobile client method', async () => {
  const client = load();
  for (const [group, methods] of Object.entries(args)) {
    assert.deepEqual(Object.keys(client[group]).sort(), Object.keys(methods).sort(), group);
    for (const [name, parameters] of Object.entries(methods)) await client[group][name](...parameters);
  }
  const found = new Set(client.calls.map(call => {
    const candidates = routes.filter(route => matches(route, call.method, call.path)).sort((a, b) => Number(a.path.includes(':')) - Number(b.path.includes(':')));
    assert.ok(candidates.length, `${call.method} ${call.path} does not exist in the API`);
    return candidates[0].method + ' ' + candidates[0].path;
  }));
  assert.deepEqual([...found].sort(), routes.map(route => route.method + ' ' + route.path).sort());
});

test('checked route inventory agrees with the locally running API source', { skip: !fs.existsSync('../nova_api_seek/server.js') }, () => {
  const { catalog } = require('../scripts/api-route-catalog.cjs');
  assert.deepEqual(routes, catalog(), 'API changed: refresh and review tests/fixtures/api-routes.json');
});

test('query values stay out of GET bodies; authenticated mutations use documented fields', async () => {
  const client = load();
  await client.usersApi.search(' café & vagas ', false);
  assert.equal(client.calls[0].body.params.termo, 'café & vagas');
  assert.equal(client.calls[0].body.params.historico, false);
  await client.messagesApi.startConversation('42');
  assert.equal(JSON.stringify(client.calls[1].body), '{"id_destinatario":42}');
  await client.postsApi.comment(7, ' Comment ');
  assert.equal(JSON.stringify(client.calls[2].body), '{"comentario":"Comment"}');
  const form = new FormData(); form.append('curriculo', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'curriculo.pdf');
  await client.usersApi.updatePerson(form);
  assert.equal(client.calls[3].body, form);
  assert.equal(client.calls[3].config.headers['Content-Type'], 'multipart/form-data');
  await client.jobsApi.byCategory('UI/UX & Design');
  assert.equal(client.calls[4].path, '/vagas/categoria/UI%2FUX%20%26%20Design');
});

test('combined vacancy filters intersect API results and handle IDs of either type', async () => {
  const client = load({ '/vagas/categoria/Design': [{ id: 1 }, { id: 2 }], '/vagas/data': [{ id: '2' }, { id: 3 }], '/vagas/usuario/7': [{ id: 2 }] });
  const result = await client.listFilteredJobs({ categoria: 'Design', inicio: '2026-11-01', fim: '2026-11-19', userId: '7' });
  assert.equal(JSON.stringify(result), '[{"id":2}]');
  assert.equal(client.calls.length, 3);
  await assert.rejects(client.listFilteredJobs({ categoria: 'Design', inicio: '2026-11-19', fim: '2026-11-01' }));
  assert.equal(client.calls.length, 3, 'Invalid dates must not start a partial category request');
});

test('invalid calendar dates are rejected without crashing or sending requests', () => {
  const { isValidDate } = load();
  for (const date of ['', '2026-13-01', '2026-02-30', '2026-11-31', '2026-1-1', 'abcd']) assert.equal(isValidDate(date), false, date);
  for (const date of ['2026-11-19', '2024-02-29']) assert.equal(isValidDate(date), true, date);
});

test('existing screen requests only target routes that exist in the API', () => {
  const files = folder => fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(folder, entry.name)) : /\.tsx?$/.test(entry.name) ? [path.join(folder, entry.name)] : []);
  let checked = 0;
  for (const file of [...files('app'), ...files('src/context')]) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = node => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(source) === 'api') {
        const method = node.expression.name.text.toUpperCase();
        const arg = node.arguments[0];
        const url = ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) ? arg.text : ts.isTemplateExpression(arg) ? arg.head.text + arg.templateSpans.map(span => '1' + span.literal.text).join('') : null;
        if (url) { assert.ok(routes.some(route => matches(route, method, url)), `${file}: ${method} ${url}`); checked++; }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  assert.ok(checked > 30);
});
