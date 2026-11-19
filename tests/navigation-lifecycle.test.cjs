const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const React = require('react');
const { act } = React;
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = require('react-dom/client');
const source = ts.transpileModule(fs.readFileSync('app/_layout.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
const expoRoutingSource = ts.createSourceFile('routing.js', fs.readFileSync('node_modules/expo-router/build/global-state/routing.js', 'utf8'), ts.ScriptTarget.Latest, true);
const actionFunction = expoRoutingSource.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'getNavigateAction');
const actionContext = vm.createContext({ matchers_1: { matchDynamicName: () => undefined } });
vm.runInContext(actionFunction.getText(expoRoutingSource), actionContext);

async function scenario(needsOnboarding) {
  const { StackRouter } = await import('@react-navigation/routers');
  const config = { routeNames: ['login', 'completarCadastro', '(tabs)'], routeParamList: {}, routeGetIdList: {} };
  const stackRouter = StackRouter({ initialRouteName: 'login' });
  let currentState, mounts = 0, segments = ['login'];
  const listeners = new Set();
  const queued = [], unhandled = [], history = [];
  const storage = new Map([['session', 'cookie'], ['userId', '7']]);
  let release;
  let firstCheck = true;
  const session = { user: { id: 7, tipo_usuario: 'PF' }, needsOnboarding };
  const router = {
    replace(path) {
      const actionState = { routes: [path === '/principal' ? { name: '(tabs)', state: { routes: [{ name: '(home)', state: { routes: [{ name: 'principal' }] } }] } } : { name: path.slice(1) }] };
      const action = actionContext.getNavigateAction(actionState, currentState, 'REPLACE');
      queued.push(action);
    },
  };
  const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);
  function Stack() {
    React.useLayoutEffect(() => {
      mounts++;
      currentState = stackRouter.getInitialState(config);
    }, []);
    return React.createElement('div', { 'data-navigator': true });
  }
  const mocks = {
    '@/src/services/api': { api: { post: async () => ({}) }, apiErrorMessage: e => e.message },
    '@/src/services/onboarding': {
      async loadFirstLoginState() {
        if (firstCheck) { firstCheck = false; await new Promise(resolve => { release = resolve; }); }
        return session;
      },
      sessionDestination(value, route) {
        if (!value) return ['login', 'cadastro', 'verificarConta'].includes(route) ? null : '/login';
        if (value.needsOnboarding) return route === 'completarCadastro' ? null : '/completarCadastro';
        return route === 'login' || route === 'completarCadastro' ? '/principal' : null;
      },
    },
    '@react-native-async-storage/async-storage': { getItem: async key => storage.get(key) || null, setItem: async (key, value) => storage.set(key, value), multiRemove: async keys => keys.forEach(key => storage.delete(key)) },
    '@react-navigation/native': { ThemeProvider: passthrough, DarkTheme: {}, DefaultTheme: {} },
    'expo-font': { useFonts: () => [true] },
    'expo-router': { Stack, useRouter: () => router, useSegments: () => React.useSyncExternalStore(callback => { listeners.add(callback); return () => listeners.delete(callback); }, () => segments) },
    'expo-status-bar': { StatusBar: () => null },
    'react-native': Object.fromEntries(['ActivityIndicator', 'Text', 'TouchableOpacity', 'View'].map(name => [name, passthrough])),
    'react-native-safe-area-context': { SafeAreaProvider: passthrough, SafeAreaView: passthrough },
    '@/hooks/useColorScheme': { useColorScheme: () => 'light' },
    '../src/context/CommentsContext': { CommentsProvider: passthrough },
    '../src/context/FollowedPostsContext': { FollowedPostsProvider: passthrough },
    '../src/context/PostsContext': { PostsProvider: passthrough },
    '../src/context/StoriesContext': { StoriesProvider: passthrough },
  };
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require(name) { if (name.startsWith('react')) return mocks[name] || require(name); if (name in mocks) return mocks[name]; if (name.includes('/assets/')) return {}; throw new Error(name); } });
  const element = document.createElement('div'); document.body.appendChild(element);
  const root = createRoot(element);
  const flushNavigation = async () => {
    await act(async () => {
      while (queued.length) {
        const action = queued.shift();
        // useOnAction rejects actions that target a navigator which no longer exists.
        const next = action.target === currentState.key ? stackRouter.getStateForAction(currentState, action, config) : null;
        if (!next) { unhandled.push(action); continue; }
        currentState = next;
        const name = next.routes[next.index].name;
        history.push(name);
        segments = name === '(tabs)' ? ['(tabs)', '(home)', 'principal'] : [name];
        listeners.forEach(callback => callback());
      }
    });
  };
  try {
    await act(async () => { root.render(React.createElement(module.exports.default)); });
    assert.equal(mounts, 1);
    await act(async () => { release(); });
    await flushNavigation();
    assert.equal(unhandled.length, 0, `REPLACE used a stale navigator: ${JSON.stringify(unhandled.map(action => action.payload))}`);
    assert.equal(mounts, 1, 'Recognizing a session must preserve the root navigator instance');
    assert.equal(history[0], needsOnboarding ? 'completarCadastro' : '(tabs)');
    storage.clear();
    await act(async () => { router.replace('/login'); });
    await flushNavigation();
    assert.equal(unhandled.length, 0);
    assert.equal(mounts, 1, 'Logout must preserve the root navigator instance');
    assert.equal(history.at(-1), 'login');
  } finally {
    await act(async () => root.unmount());
    element.remove();
  }
}

test('session restoration can replace login with the home tabs without a stale navigator', () => scenario(false));
test('first-login and logout redirects preserve the root navigator', () => scenario(true));

function contextModule(name, api) {
  const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const scope = { exports: {} };
  vm.runInNewContext(compile('src/context/useSessionScope.ts'), { module: scope, exports: scope.exports, require });
  const module = { exports: {} };
  vm.runInNewContext(compile(`src/context/${name}.tsx`), {
    module, exports: module.exports,
    require(dependency) {
      if (dependency === './useSessionScope') return scope.exports;
      if (dependency === '@/src/services/api') return { api, normalizePost: value => value, fileUrl: value => value || null };
      if (dependency === '@react-native-async-storage/async-storage') return { getItem: async () => null, setItem: async () => {} };
      if (dependency.includes('assets/images')) return 1;
      return require(dependency);
    },
  });
  return module.exports;
}

async function contextHarness(Provider, useContextValue) {
  const element = document.createElement('div'); document.body.appendChild(element);
  const root = createRoot(element);
  let value, mounts = 0;
  function Consumer() {
    value = useContextValue();
    React.useEffect(() => { mounts++; }, []);
    return null;
  }
  return {
    get value() { return value; }, get mounts() { return mounts; },
    async render(id) { await act(async () => root.render(React.createElement(Provider, { sessionUserId: id }, React.createElement(Consumer)))); },
    async close() { await act(async () => root.unmount()); element.remove(); },
  };
}

test('switching sessions clears posts and ignores old responses without remounting consumers', async () => {
  const requests = [];
  const { PostsProvider, usePosts } = contextModule('PostsContext', { get: () => new Promise(resolve => requests.push(resolve)) });
  const harness = await contextHarness(PostsProvider, usePosts);
  const post = id => ({ id, user: { id, nome: `User ${id}` }, imagens: [], descricao: 'Fixture' });
  try {
    await harness.render('1');
    await act(async () => requests[0]({ data: [post(1)] }));
    assert.equal(harness.value.posts[0].id, '1');
    let stale;
    await act(async () => { stale = harness.value.refreshPosts(); });
    await harness.render('2');
    assert.equal(harness.value.posts.length, 0);
    await act(async () => requests[2]({ data: [post(2)] }));
    await act(async () => { requests[1]({ data: [post(1)] }); await stale; });
    assert.equal(harness.value.posts[0].id, '2');
    await harness.render(null);
    assert.equal(harness.value.posts.length, 0);
    assert.equal(harness.mounts, 1);
  } finally { await harness.close(); }
});

test('comments from a previous account cannot repopulate the new session cache', async () => {
  const requests = [];
  const { CommentsProvider, useComments } = contextModule('CommentsContext', { get: () => new Promise(resolve => requests.push(resolve)) });
  const harness = await contextHarness(CommentsProvider, useComments);
  try {
    await harness.render('1');
    let stale;
    await act(async () => { stale = harness.value.fetchComments('10'); });
    await harness.render('2');
    await act(async () => { requests[0]({ data: { comentarios: [{ id: 1, comentario: 'Old session', usuario: { id: 1, nome: 'User 1' } }] } }); await stale; });
    assert.equal(JSON.stringify(harness.value.commentsByPost), '{}');
    let fresh;
    await act(async () => { fresh = harness.value.fetchComments('20'); });
    await act(async () => { requests[1]({ data: { comentarios: [{ id: 2, comentario: 'New session', usuario: { id: 2, nome: 'User 2' } }] } }); await fresh; });
    assert.equal(harness.value.commentsByPost['20'][0].text, 'New session');
    await harness.render(null);
    assert.equal(JSON.stringify(harness.value.commentsByPost), '{}');
    assert.equal(harness.mounts, 1);
  } finally { await harness.close(); }
});

test('profile requests and viewer state reset when the account changes', async () => {
  const requests = [];
  const { StoriesProvider, useStories } = contextModule('StoriesContext', { get: () => new Promise(resolve => requests.push(resolve)) });
  const harness = await contextHarness(StoriesProvider, useStories);
  try {
    await harness.render('1');
    await act(async () => harness.value.setStoryViewerOpen(true));
    await harness.render('2');
    assert.equal(harness.value.isStoryViewerOpen, false);
    await act(async () => requests[1]({ data: { nome: 'User 2', foto: '/new.png' } }));
    await act(async () => requests[0]({ data: { nome: 'User 1', foto: '/old.png' } }));
    assert.equal(harness.value.myProfile.userId, '2');
    assert.equal(harness.value.myProfile.userAvatarUri, '/new.png');
    await harness.render(null);
    assert.equal(harness.value.myProfile.userId, null);
    assert.equal(harness.mounts, 1);
  } finally { await harness.close(); }
});

test('followed feeds ignore the previous account while preserving the mounted navigator', async () => {
  let resolveOld;
  const called = [];
  const { FollowedPostsProvider, useFollowedPosts } = contextModule('FollowedPostsContext', { async get(path) {
    called.push(path);
    if (path === '/seguidores/seguindo/1') return new Promise(resolve => { resolveOld = resolve; });
    if (path === '/seguidores/seguindo/2') return { data: [{ id: 22 }] };
    return { data: [{ id: 222, user: { id: 22, nome: 'User 22' }, imagens: [] }] };
  } });
  const harness = await contextHarness(FollowedPostsProvider, useFollowedPosts);
  try {
    await harness.render('1');
    await harness.render('2');
    assert.equal(harness.value.posts[0].id, '222');
    await act(async () => resolveOld({ data: [{ id: 11 }] }));
    assert.equal(called.includes('/posts/usuario/11'), false);
    assert.equal(harness.value.posts[0].id, '222');
    await harness.render(null);
    assert.equal(harness.value.posts.length, 0);
    assert.equal(harness.mounts, 1);
  } finally { await harness.close(); }
});

test('home tab button dispatches a tab-compatible action', async () => {
  const { TabRouter } = await import('@react-navigation/routers');
  const source = ts.createSourceFile('tabs.tsx', fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let handler;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'refreshHome') handler = node.initializer.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  const config = { routeNames: ['principal', 'tendencias', 'seguindo'], routeParamList: {}, routeGetIdList: {} };
  const tabRouter = TabRouter({ initialRouteName: 'tendencias' });
  const state = tabRouter.getInitialState(config);
  let action;
  const capture = event => path => {
    assert.ok(path.startsWith('/(tabs)/(home)/principal?refresh='));
    action = actionContext.getNavigateAction({ routes: [{ name: 'principal', params: { refresh: '1' } }] }, state, event);
  };
  const executable = ts.transpileModule(`(${handler})()`, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(executable, { router: { replace: capture('REPLACE'), navigate: capture('NAVIGATE') }, Date });
  const next = tabRouter.getStateForAction(state, action, config);
  assert.ok(next, 'The tab router cannot handle a stack REPLACE action');
  assert.equal(next.routes[next.index].name, 'principal');
});
