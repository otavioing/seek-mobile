// Browser transport for the real mobile Axios client. The API already permits
// http://127.0.0.1:5501 through CORS. This does not proxy requests or change CORS.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const base = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4500';
let fixture;
if (process.env.SEEK_TEST_EMAIL && process.env.SEEK_TEST_PASSWORD) fixture = { email: process.env.SEEK_TEST_EMAIL, senha: process.env.SEEK_TEST_PASSWORD };
const sourceIndex = process.argv.indexOf('--insomnia');
if (sourceIndex !== -1) {
  const source = fs.readFileSync(path.resolve(process.argv[sourceIndex + 1]), 'utf8');
  const block = source.match(/- url: [^\r\n]*\/auth\/login\r?\n([\s\S]*?)(?=\r?\n\s*- url:|$)/)?.[1];
  const text = block?.match(/text: \|[-+]?\r?\n\s*(\{[\s\S]*?\})/)?.[1];
  if (text) {
    const value = JSON.parse(text);
    if (typeof value.email === 'string' && typeof value.senha === 'string') fixture = { email: value.email, senha: value.senha };
  }
}
const transpile = file => ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const client = `(() => {
  const mocks = { axios: window.axios, 'expo-constants': {}, 'react-native': { Platform: { OS: 'web' } }, 'expo-router': { router: { replace() {} } }, '@react-native-async-storage/async-storage': { async multiRemove() {} } };
  const apiModule = { exports: {} };
  ((module, exports, require, process) => { ${transpile('src/services/api.ts')} })(apiModule, apiModule.exports, name => mocks[name], { env: { EXPO_PUBLIC_API_URL: ${JSON.stringify(base)} } });
  const seekModule = { exports: {} };
  ((module, exports, require) => { ${transpile('src/services/seek.ts')} })(seekModule, seekModule.exports, () => apiModule.exports);
  window.seek = seekModule.exports; window.apiClient = apiModule.exports;
})();`;
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Seek — testes da API</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px;background:#f8fafc;color:#172554}button{padding:14px 22px;background:#322bf0;color:white;border:0;border-radius:8px;font:inherit;cursor:pointer}label{display:block;margin:16px 0}pre{white-space:pre-wrap;font-size:14px;line-height:1.6}.fail{color:#b91c1c}</style><h1>Seek — testes da API</h1><p>Cliente Axios e serviços usados pelo mobile. Somente leitura e validação por padrão.</p><label><input id="login" type="checkbox" ${fixture ? 'checked' : 'disabled'}> Testar sessão com a conta da coleção Insomnia (sem exibir credenciais)</label><label><input id="writes" type="checkbox"> Testar publicação, imagem, curtida, salvamento, comentário e resposta em um projeto temporário; excluí-lo ao terminar</label><button id="run">Executar testes</button><h2 id="summary">Aguardando execução</h2><pre id="results"></pre><script src="/axios.js"></script><script src="/client.js"></script><script src="/tests.js"></script></html>`;
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'POST' && req.url === '/report') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 500000) req.destroy(); });
    req.on('end', () => {
      try { const value = JSON.parse(body); fs.mkdirSync(path.join(root, '.expo/verification'), { recursive: true }); fs.writeFileSync(path.join(root, '.expo/verification/api-live.json'), JSON.stringify(value, null, 2)); res.end('ok'); }
      catch { res.writeHead(400).end('Invalid report'); }
    });
    return;
  }
  const files = { '/': ['text/html; charset=utf-8', html], '/axios.js': ['text/javascript', fs.readFileSync(path.join(root, 'node_modules/axios/dist/axios.min.js'))], '/client.js': ['text/javascript', client], '/tests.js': ['text/javascript; charset=utf-8', fs.readFileSync(path.join(root, 'tests/api-live.browser.js'))], '/routes.json': ['application/json', fs.readFileSync(path.join(root, 'tests/fixtures/api-routes.json'))], '/fixture.json': ['application/json', JSON.stringify(fixture || null)] };
  const item = files[req.url];
  if (!item) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', item[0]); res.end(item[1]);
});
server.listen(5501, '127.0.0.1', () => console.log('Testes: http://127.0.0.1:5501 — credenciais não são gravadas no relatório.'));
