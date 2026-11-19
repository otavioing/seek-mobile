const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load({ platform = 'android', metro = '192.168.1.9:8081', url } = {}) {
  let onSuccess, onError, settings;
  const removed = [], routes = [];
  const api = { interceptors: { response: { use(ok, fail) { onSuccess = ok; onError = fail; } } } };
  const mocks = {
    axios: { create(config) { settings = config; return api; } },
    'expo-constants': { expoConfig: { hostUri: metro } },
    'react-native': { Platform: { OS: platform } },
    'expo-router': { router: { replace(route) { routes.push(route); } } },
    '@react-native-async-storage/async-storage': { async multiRemove(keys) { removed.push(...keys); } },
  };
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/services/api.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require(name) { if (!mocks[name]) throw Error(name); return mocks[name]; }, process: { env: { EXPO_PUBLIC_API_URL: url } } });
  return { ...module.exports, settings, onSuccess, onError, removed, routes };
}
test('Expo LAN, override and emulator addresses', () => {
  assert.equal(load().API_URL, 'http://192.168.1.9:4500');
  assert.equal(load({ url: 'https://seek.example/' }).API_URL, 'https://seek.example');
  assert.equal(load({ metro: undefined }).API_URL, 'http://192.168.1.9:4500');
  assert.equal(load({ metro: null }).API_URL, 'http://10.0.2.2:4500');
  assert.equal(load({ platform: 'ios', metro: null }).API_URL, 'http://localhost:4500');
});
test('cookie credentials and finite timeout', () => {
  const { settings } = load();
  assert.equal(settings.withCredentials, true);
  assert.equal(settings.timeout, 15000);
  assert.equal(settings.headers, undefined);
});
test('unwrap data but preserve mutation message', () => {
  const { onSuccess } = load();
  assert.deepEqual(onSuccess({ data: { success: true, data: [{ id: 1 }] } }).data, [{ id: 1 }]);
  assert.equal(onSuccess({ data: { success: true, data: false } }).data, false);
  assert.equal(onSuccess({ data: { success: true, message: 'Salvo' } }).data.message, 'Salvo');
});
test('normalize list and detail post contracts', () => {
  const { normalizePost } = load();
  const post = normalizePost({ id: 7, criador: { id: 2, nome: 'Teste', foto_perfil: '/uploads/perfil/a.jpg' }, descricao: 'Projeto', likes: '3', imagens: ['/uploads/posts/a.jpg'], data_postagem: '2026-11-02' });
  assert.equal(post.user.id, 2); assert.equal(post.user.nome, 'Teste');
  assert.equal(post.legenda, 'Projeto'); assert.equal(post.total_likes, 3);
  assert.equal(post.imagens[0], 'http://192.168.1.9:4500/uploads/posts/a.jpg');
  const detail = normalizePost({ usuario_id: 2, nome: 'Teste', capa: '/uploads/posts/capa.jpg', imagens: [] });
  assert.equal(detail.user.id, 2); assert.equal(detail.imagens.length, 1);
});
test('expired session clears only authentication state and redirects', async () => {
  const client = load();
  const error = { response: { status: 401 }, config: { url: '/posts/7' } };
  await assert.rejects(client.onError(error), e => e === error);
  assert.equal(client.removed.join(','), 'session,userId,token');
  assert.equal(client.routes[0], '/login');
});
test('bad login and network failures preserve existing state', async () => {
  const client = load();
  for (const error of [{ response: { status: 401 }, config: { url: '/auth/login' } }, { code: 'ERR_NETWORK' }]) await assert.rejects(client.onError(error), e => e === error);
  assert.equal(client.removed.length, 0);
});

test('native loopback configuration reaches the API computer', () => {
  assert.equal(load({ url: 'http://127.0.0.1:4500' }).API_URL, 'http://192.168.1.9:4500');
  assert.equal(load({ url: 'http://localhost:4500', metro: 'localhost:8081' }).API_URL, 'http://10.0.2.2:4500');
  assert.equal(load({ platform: 'web', url: 'http://127.0.0.1:4500' }).API_URL, 'http://127.0.0.1:4500');
});
test('root layout contains no raw text children or same-line spaces', () => {
  const source = ts.createSourceFile('app/_layout.tsx', fs.readFileSync('app/_layout.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const invalid = [];
  function visit(node) {
    const parent = node.parent;
    const insideText = parent && ts.isJsxElement(parent) && parent.openingElement.tagName.getText(source) === 'Text';
    if (ts.isJsxText(node) && !insideText && (node.text.trim() || (node.text.length && !node.text.includes('\n')))) invalid.push(node.text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(invalid.length, 0, 'Native views cannot render raw strings, including a single space');
});
