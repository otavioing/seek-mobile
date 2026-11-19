const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/services/onboarding.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const pickerSource = ts.transpileModule(fs.readFileSync('src/services/documentPicker.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const uploadSource = ts.transpileModule(fs.readFileSync('src/services/uploads.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const user = { id: 7, nome: 'Usuário de teste', tipo_usuario: 'PF' };
const personal = { id: 7, tipo_usuario: 'PF', perfil_empresa: null, perfil_pessoa_fisica: { nome_usuario: 'milly', sobre: 'Designer', linkedin: null, github: null, telefone: '16999999999', cidade: 'Matão', estado: 'SP', curriculo: '/uploads/curriculo/existente.pdf' } };
const company = { id: 9, tipo_usuario: 'EMPRESA', perfil_pessoa_fisica: null, perfil_empresa: { razao_social: 'Empresa Ltda.', nome_fantasia: 'Empresa', numero_funcionarios: 12, categoria_negocio: 'Design', telefone_comercial: '1633333333', descricao: 'Estúdio', site: 'https://example.com', endereco_completo: 'Endereço que deve permanecer' } };
const pdf = { uri: 'file:///cache/curriculo.pdf', name: 'curriculo.pdf', mimeType: 'application/pdf' };
const photo = { uri: 'file:///cache/foto.png', name: 'perfil.png', mimeType: 'image/png' };

function load(options = {}) {
  const { identity = user, failure } = options;
  const firstLogin = Object.prototype.hasOwnProperty.call(options, 'firstLogin') ? options.firstLogin : true;
  const calls = [];
  const action = (name, value) => async body => { calls.push({ name, body }); if (failure === name) throw new Error(`Failure: ${name}`); return { data: value }; };
  const mocks = {
    './seek': { authApi: { me: action('me', { usuario: identity }) }, usersApi: { firstLogin: action('firstLogin', { primeiro_login: firstLogin }), updatePerson: action('person'), updateCompany: action('company'), updatePhoto: action('photo'), completeRegistration: action('complete') } },
    './uploads': { async appendUpload(form, key, file) { if (failure === 'file') throw new Error('Unreadable file'); form.append(key, new Blob(['fixture'], { type: file.mimeType }), file.name); } },
  };
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: name => mocks[name], FormData, URL });
  return { ...module.exports, calls };
}

test('first-login check confirms identity and reads the server flag', async () => {
  const client = load();
  const state = await client.loadFirstLoginState();
  assert.equal(state.user.id, 7); assert.equal(state.needsOnboarding, true);
  assert.equal(client.calls.map(item => item.name).join(','), 'me,firstLogin');
  assert.equal(client.sessionDestination(state, 'login'), '/completarCadastro');
});

test('completed accounts open the feed without repeating onboarding', async () => {
  const client = load({ firstLogin: false });
  const state = await client.loadFirstLoginState();
  assert.equal(client.sessionDestination(state, 'login'), '/principal');
  assert.equal(client.sessionDestination(state, 'completarCadastro'), '/principal');
  assert.equal(client.sessionDestination(state, '(tabs)'), null);
});

test('reopening an incomplete session or navigating back to login resumes onboarding', () => {
  const client = load();
  const state = { user, needsOnboarding: true };
  for (const route of [undefined, 'login', '(tabs)', 'configuracoes', 'cadastro']) assert.equal(client.sessionDestination(state, route), '/completarCadastro');
  assert.equal(client.sessionDestination(state, 'completarCadastro'), null);
  for (const route of ['login', 'cadastro', 'verificarConta']) assert.equal(client.sessionDestination(null, route), null);
  assert.equal(client.sessionDestination(null, 'completarCadastro'), '/login');
});

test('invalid account data, expired sessions and malformed flags never bypass the welcome screen', async () => {
  for (const identity of [null, { id: 7 }, { id: 0, tipo_usuario: 'PF' }, { id: 7, tipo_usuario: 'OUTRO' }]) {
    const client = load({ identity });
    await assert.rejects(client.loadFirstLoginState());
    assert.equal(client.calls.length, 1);
  }
  for (const firstLogin of [undefined, null, 1, 'false']) {
    const client = load({ firstLogin });
    await assert.rejects(client.loadFirstLoginState());
  }
  const expired = load({ failure: 'me' });
  await assert.rejects(expired.loadFirstLoginState());
  assert.equal(expired.calls.length, 1);
});

test('partially saved profiles prefill the form, including zero employees', () => {
  const client = load();
  assert.equal(client.welcomeFields(personal).nome_usuario, 'milly');
  assert.equal(client.welcomeFields(personal).linkedin, '');
  assert.equal(client.welcomeFields({ ...company, perfil_empresa: { numero_funcionarios: 0 } }).numero_funcionarios, '0');
  assert.equal('cnpj' in client.welcomeFields(company), false);
});

test('PF save preserves existing contact fields and resume when no PDF is selected', async () => {
  const client = load();
  await client.completeFirstLogin({ profile: personal, fields: { nome_usuario: '  nova-milly  ', sobre: ' Nova descrição ', github: '', linkedin: 'https://linkedin.com/in/teste' } });
  assert.equal(client.calls.map(item => item.name).join(','), 'person,complete');
  const body = client.calls[0].body;
  assert.equal(body.nome_usuario, 'nova-milly'); assert.equal(body.sobre, 'Nova descrição');
  for (const key of ['telefone', 'cidade', 'estado', 'curriculo']) assert.equal(body[key], personal.perfil_pessoa_fisica[key]);
  assert.equal(body.github, null);
});

test('PDF multipart, photo upload and completion are sent in order using real FormData', async () => {
  const client = load();
  await client.completeFirstLogin({ profile: personal, fields: client.welcomeFields(personal), photo, curriculum: pdf });
  assert.equal(client.calls.map(item => item.name).join(','), 'person,photo,complete');
  const form = client.calls[0].body;
  assert.ok(form instanceof FormData); assert.equal(form.get('nome_usuario'), 'milly');
  assert.equal(form.get('cidade'), 'Matão');
  assert.equal(form.getAll('curriculo').length, 1);
  assert.equal(form.get('curriculo').name, 'curriculo.pdf'); assert.equal(form.get('curriculo').type, 'application/pdf');
  assert.equal(client.calls[1].body.get('foto').name, 'perfil.png');
  assert.equal(client.calls[1].body.get('foto').type, 'image/png');
});

test('EMPRESA uses the company endpoint and retains the address outside the welcome form', async () => {
  const client = load();
  await client.completeFirstLogin({ profile: company, fields: { ...client.welcomeFields(company), nome_fantasia: ' Nova empresa ', numero_funcionarios: '25' }, photo });
  assert.equal(client.calls.map(item => item.name).join(','), 'company,photo,complete');
  const body = client.calls[0].body;
  assert.equal(body.nome_fantasia, 'Nova empresa'); assert.equal(body.numero_funcionarios, 25);
  assert.equal(body.endereco_completo, company.perfil_empresa.endereco_completo);
  assert.equal('cnpj' in body, false); assert.equal('usuario_id' in body, false);
});

test('optional fields may remain empty as on the website, with zero employees', async () => {
  const client = load();
  await client.completeFirstLogin({ profile: company, fields: { nome_fantasia: '', numero_funcionarios: '' } });
  assert.equal(client.calls[0].body.numero_funcionarios, 0);
  assert.equal(client.calls.at(-1).name, 'complete');
});

test('new company profiles never send null for the required razao_social database column', async () => {
  const client = load();
  const emptyProfile = { ...company, perfil_empresa: null };
  await client.completeFirstLogin({ profile: emptyProfile, fields: client.welcomeFields(emptyProfile) });
  assert.equal(client.calls[0].body.razao_social, '');
  assert.equal(client.calls[0].body.numero_funcionarios, 0);
  assert.equal(client.calls.at(-1).name, 'complete');
});

test('failed profile or photo upload cannot mark a registration complete', async () => {
  for (const failure of ['person', 'photo', 'file']) {
    const client = load({ failure });
    await assert.rejects(client.completeFirstLogin({ profile: personal, fields: client.welcomeFields(personal), photo, curriculum: pdf }));
    assert.equal(client.calls.some(item => item.name === 'complete'), false, failure);
  }
  const client = load({ failure: 'complete' });
  await assert.rejects(client.completeFirstLogin({ profile: personal, fields: client.welcomeFields(personal) }));
  assert.equal(client.calls.at(-1).name, 'complete');
});

test('invalid links, employee counts and non-PDF resumes fail before any writes', async () => {
  for (const fields of [{ site: 'javascript:alert(1)' }, { site: 'example.com' }, { numero_funcionarios: '-1' }, { numero_funcionarios: '1.5' }, { numero_funcionarios: 'Infinity' }]) {
    const client = load();
    await assert.rejects(client.completeFirstLogin({ profile: company, fields }));
    assert.equal(client.calls.length, 0);
  }
  const client = load();
  await assert.rejects(client.completeFirstLogin({ profile: personal, fields: {}, curriculum: { ...pdf, name: 'resume.jpg', mimeType: 'image/jpeg' } }));
  assert.equal(client.calls.length, 0);
});

test('Expo Go PDF bridge requests one cached PDF and cancellation changes nothing', async () => {
  let options;
  const module = { exports: {} };
  const native = { async getDocumentAsync(value) { options = value; return { canceled: false, assets: [pdf] }; } };
  vm.runInNewContext(pickerSource, { module, exports: module.exports, require: name => name === 'react-native' ? { Platform: { OS: 'android' } } : { requireOptionalNativeModule: value => { assert.equal(value, 'ExpoDocumentPicker'); return native; } } });
  assert.equal((await module.exports.pickPdf()).uri, pdf.uri);
  assert.equal(JSON.stringify(options), '{"type":["application/pdf"],"multiple":false,"copyToCacheDirectory":true}');
  native.getDocumentAsync = async () => ({ canceled: true });
  assert.equal(await module.exports.pickPdf(), null);
});

test('native multipart keeps a readable file URI, filename and MIME type', async () => {
  const entries = [];
  const module = { exports: {} };
  vm.runInNewContext(uploadSource, { module, exports: module.exports, require: () => ({ Platform: { OS: 'android' } }) });
  await module.exports.appendUpload({ append: (...args) => entries.push(args) }, 'curriculo', pdf);
  assert.equal(JSON.stringify(entries), '[["curriculo",{"uri":"file:///cache/curriculo.pdf","name":"curriculo.pdf","type":"application/pdf"}]]');
});

const webFile = 'C:/xampp/htdocs/seek/js/conexao_com_api/completar_cadastro.js';
test('the current website opens the matching PF/EMPRESA welcome modal only while incomplete', { skip: !fs.existsSync(webFile) }, async () => {
  const siteSource = fs.readFileSync(webFile, 'utf8');
  for (const role of ['PF', 'EMPRESA']) for (const incomplete of [true, false]) {
    const modals = { modalPessoa: { style: { display: 'none' } }, modalEmpresa: { style: { display: 'none' } } };
    let called = 0;
    const context = vm.createContext({ document: { addEventListener() {}, getElementById: id => modals[id] }, window: { seekSessaoAutenticada: Promise.resolve({ tipo_usuario: role }) }, ip_api: 'http://api.test', fetch: async url => { assert.equal(url, 'http://api.test/usuarios/verificar-primeiro-login'); called++; return { ok: true, json: async () => ({ success: true, data: { primeiro_login: incomplete } }) }; }, console: { warn() {}, error() {} } });
    vm.runInContext(siteSource, context);
    await context.verificarPrimeiroLogin();
    assert.equal(called, 1);
    assert.equal(modals.modalPessoa.style.display, incomplete && role === 'PF' ? 'block' : 'none');
    assert.equal(modals.modalEmpresa.style.display, incomplete && role === 'EMPRESA' ? 'block' : 'none');
  }
});
