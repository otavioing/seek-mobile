const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

// Same fields selected by mensagem.repository.js, without sender name/photo.
const received = { id: 11, id_remetente: 2, mensagem: 'Olá, tudo bem?', data_envio: '2026-11-18T18:30:00Z' };
const sent = { id: 12, id_remetente: 1, mensagem: 'Tudo sim!', data_envio: '2026-11-18T18:31:00Z' };
const conversation = { id_conversa: 7, id_destinatario: 2, nome_destinatario: 'Ana', foto_perfil: null, ultima_mensagem: sent.mensagem, data_ultima_mensagem: sent.data_envio };

function harness({ messages = [received, sent], conversations = [conversation], metadataError = false, messagesError = false, sendError = false } = {}) {
  const calls = [], errors = [], alerts = [], routes = [];
  const controls = { inputs: new Map(), buttons: [], rows: [] };
  const api = {
    async get(url) {
      calls.push({ method: 'GET', url });
      if (url === '/mensagens/conversas') {
        if (metadataError) throw new Error('Falha ao consultar contatos');
        return { data: conversations };
      }
      if (messagesError) throw new Error('Acesso à conversa recusado');
      return { data: messages };
    },
    async post(url, body) {
      calls.push({ method: 'POST', url, body });
      if (sendError) throw new Error('Falha ao enviar');
      messages.push({ id: 13, id_remetente: 1, mensagem: body.mensagem, data_envio: sent.data_envio });
      return { data: { id_mensagem: 13, id_conversa: 7, ...body, id_remetente: 1 } };
    },
  };
  const passthrough = ({ children }) => React.createElement('div', null, children);
  const native = {
    View: passthrough, Text: passthrough, SafeAreaView: passthrough, KeyboardAvoidingView: passthrough,
    StatusBar: () => null, ActivityIndicator: () => null,
    StyleSheet: { create: value => value }, Platform: { OS: 'android' },
    Alert: { alert: (...args) => alerts.push(args) },
    Image: ({ source }) => React.createElement('img', { src: source.uri }),
    TextInput(props) {
      controls.inputs.set(props.placeholder, props);
      return React.createElement('input', { value: props.value, placeholder: props.placeholder, onChange: event => props.onChangeText(event.target.value) });
    },
    TouchableOpacity(props) {
      controls.buttons.push(props);
      return React.createElement('button', { disabled: props.disabled, onClick: props.onPress }, props.children);
    },
    FlatList: React.forwardRef(function FlatList(props, ref) {
      React.useImperativeHandle(ref, () => ({ scrollToEnd() {} }));
      controls.rows = props.data;
      return React.createElement('div', null, props.data.map((item, index) => React.createElement(React.Fragment, { key: props.keyExtractor(item) }, props.renderItem({ item, index }))));
    }),
  };
  const mocks = {
    '@/src/services/api': { api, apiErrorMessage: error => error.message, fileUrl: value => value ? new URL(value, 'http://localhost:4500').href : null },
    '@react-native-async-storage/async-storage': { getItem: async key => key === 'userId' ? '1' : 'escuro', setItem: async () => {} },
    '@react-navigation/native': { useIsFocused: () => true, useFocusEffect: callback => React.useEffect(callback, [callback]) },
    'expo-router': { useRouter: () => ({ back() {}, push: route => routes.push(route) }), useLocalSearchParams: () => ({ id: '7' }) },
    'react-native': native,
    'react-native-vector-icons/Ionicons': () => null,
    '@expo/vector-icons': { Ionicons: () => null },
  };
  const cache = new Map();
  function load(file) {
    const fullPath = path.resolve(file);
    if (cache.has(fullPath)) return cache.get(fullPath);
    const source = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const module = { exports: {} };
    cache.set(fullPath, module.exports);
    vm.runInNewContext(source, {
      module, exports: module.exports, console: { log() {} }, requestAnimationFrame: callback => callback(),
      require(dependency) {
        if (dependency in mocks) return mocks[dependency];
        if (dependency.startsWith('@/') || dependency.startsWith('.')) {
          const location = dependency.startsWith('@/') ? path.resolve(dependency.slice(2)) : path.resolve(path.dirname(fullPath), dependency);
          if (location === path.resolve('src/services/api')) return mocks['@/src/services/api'];
          return load(location + (fs.existsSync(location + '.ts') ? '.ts' : '.tsx'));
        }
        return require(dependency);
      },
    });
    return module.exports;
  }
  const element = document.createElement('div'); document.body.appendChild(element);
  const root = createRoot(element, { onUncaughtError: error => errors.push(error) });
  return {
    calls, errors, alerts, routes, controls, element, load,
    async render(file = 'app/configuracoes/conversa/[id].tsx') { await act(async () => root.render(React.createElement(load(file).default))); },
    async change(placeholder, value) { await act(async () => controls.inputs.get(placeholder).onChangeText(value)); },
    async send() { await act(async () => controls.buttons.at(-1).onPress()); },
    async press(label) {
      const button = [...element.querySelectorAll('button')].find(item => item.textContent.includes(label));
      assert.ok(button, `Missing button: ${label}`);
      await act(async () => button.click());
    },
    setMessagesError(value) { messagesError = value; },
    async close() { await act(async () => root.unmount()); element.remove(); },
  };
}

test('opening messages with the actual API fields renders both senders without crashing', async () => {
  const ui = harness();
  try {
    await ui.render();
    assert.equal(ui.errors.length, 0, ui.errors.map(error => error.stack).join('\n'));
    assert.match(ui.element.textContent, /Olá, tudo bem\?/);
    assert.match(ui.element.textContent, /Tudo sim!/);
    assert.match(ui.element.textContent, /Ana/);
    assert.equal(ui.controls.rows[0].minha, false);
    assert.equal(ui.controls.rows[1].minha, true);
  } finally { await ui.close(); }
});

test('sender name and photo come from the matching conversation, including string IDs', async () => {
  const ui = harness({ conversations: [
    { ...conversation, id_conversa: 8, nome_destinatario: 'Outro contato', foto_perfil: '/wrong.jpg' },
    { ...conversation, id_conversa: '7', id_destinatario: '2', foto_perfil: '/uploads/perfil/ana.jpg' },
  ] });
  try {
    await ui.render();
    assert.equal(ui.errors.length, 0);
    assert.match(ui.element.textContent, /Ana/);
    assert.doesNotMatch(ui.element.textContent, /Outro contato/);
    assert.equal(ui.element.querySelector('img').src, 'http://localhost:4500/uploads/perfil/ana.jpg');
    assert.equal(ui.controls.rows[0].remetenteNome, 'Ana');
    assert.equal(ui.controls.rows[1].remetenteNome, 'Você');
    assert.equal(ui.controls.rows[1].remetenteFoto, null);
    assert.equal(ui.calls.filter(call => call.url === '/mensagens/conversas').length, 1);
  } finally { await ui.close(); }
});

test('missing contact names, photos and metadata never prevent messages from rendering', async () => {
  for (const options of [
    { conversations: [{ ...conversation, nome_destinatario: null }] },
    { conversations: [{ ...conversation, nome_destinatario: '   ' }] },
    { conversations: [] },
    { metadataError: true },
  ]) {
    const ui = harness(options);
    try {
      await ui.render();
      assert.equal(ui.errors.length, 0);
      assert.match(ui.element.textContent, /Contato/);
      assert.match(ui.element.textContent, /Olá, tudo bem\?/);
      assert.equal(ui.element.querySelector('img'), null);
    } finally { await ui.close(); }
  }
});

test('avatar initials accept absent values, whitespace and complete Unicode code points', async () => {
  const ui = harness();
  try {
    const { contactInitial } = ui.load('src/services/messaging.ts');
    for (const name of [undefined, null, '', '   ']) assert.equal(contactInitial(name), 'C');
    assert.equal(contactInitial('  ana'), 'A');
    assert.equal(contactInitial('Érica'), 'É');
    assert.equal(contactInitial('🙂 Contato'), '🙂');
  } finally { await ui.close(); }
});

test('a new conversation and an empty inbox render their empty states', async () => {
  const detail = harness({ messages: [] });
  const inbox = harness({ conversations: [] });
  try {
    await detail.render();
    assert.equal(detail.errors.length, 0);
    assert.match(detail.element.textContent, /Sem mensagens/);
    await inbox.render('app/configuracoes/mensagens.tsx');
    assert.equal(inbox.errors.length, 0);
    assert.match(inbox.element.textContent, /Nenhuma conversa/);
  } finally { await detail.close(); await inbox.close(); }
});

test('sending through the screen posts only the trimmed message and refreshes the conversation', async () => {
  const ui = harness();
  try {
    await ui.render();
    await ui.change('Digite sua mensagem', '  Mensagem de teste  ');
    await ui.send();
    assert.equal(ui.errors.length, 0);
    assert.equal(ui.alerts.length, 0);
    const posted = ui.calls.filter(call => call.method === 'POST');
    assert.equal(posted.length, 1);
    assert.equal(posted[0].url, '/mensagens/conversas/7/mensagens');
    assert.equal(JSON.stringify(posted[0].body), '{"mensagem":"Mensagem de teste"}');
    assert.match(ui.element.textContent, /Mensagem de teste/);
    assert.equal(ui.controls.rows.at(-1).minha, true);
    assert.equal(ui.controls.inputs.get('Digite sua mensagem').value, '');
  } finally { await ui.close(); }
});

test('a failed send keeps the draft and explains the error', async () => {
  const ui = harness({ sendError: true });
  try {
    await ui.render();
    await ui.change('Digite sua mensagem', 'Manter rascunho');
    await ui.send();
    assert.equal(ui.errors.length, 0);
    assert.equal(ui.alerts.length, 1);
    assert.equal(ui.alerts[0][1], 'Falha ao enviar');
    assert.equal(ui.controls.inputs.get('Digite sua mensagem').value, 'Manter rascunho');
    assert.equal(ui.controls.rows.length, 2);
  } finally { await ui.close(); }
});

test('the inbox searches and opens the actual conversation ID for an unnamed contact', async () => {
  const ui = harness({ conversations: [{ ...conversation, nome_destinatario: null, ultima_mensagem: null, data_ultima_mensagem: null }] });
  try {
    await ui.render('app/configuracoes/mensagens.tsx');
    assert.equal(ui.errors.length, 0);
    assert.match(ui.element.textContent, /Contato/);
    assert.match(ui.element.textContent, /Nenhuma mensagem ainda/);
    await ui.change('Buscar conversa', 'contato');
    await ui.press('Contato');
    assert.equal(JSON.stringify(ui.routes[0]), '{"pathname":"/configuracoes/conversa/[id]","params":{"id":"7","usuario_id":"1"}}');
    await ui.change('Buscar conversa', 'inexistente');
    assert.doesNotMatch(ui.element.textContent, /Contato/);
  } finally { await ui.close(); }
});

test('a message request failure shows an error and retry instead of an empty conversation', async () => {
  const ui = harness({ messagesError: true });
  try {
    await ui.render();
    assert.equal(ui.errors.length, 0);
    assert.match(ui.element.textContent, /Não foi possível carregar a conversa/);
    assert.match(ui.element.textContent, /Acesso à conversa recusado/);
    assert.doesNotMatch(ui.element.textContent, /Sem mensagens/);
    ui.setMessagesError(false);
    await ui.press('Tentar novamente');
    assert.match(ui.element.textContent, /Olá, tudo bem\?/);
    assert.doesNotMatch(ui.element.textContent, /Tentar novamente/);
  } finally { await ui.close(); }
});
