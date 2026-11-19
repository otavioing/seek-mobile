const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const routes = require('../tests/fixtures/api-routes.json');
const base = (process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4500').replace(/\/$/, '');
const results = [];
async function check(route, url, expected, array = false) {
  let status;
  try {
    const res = await fetch(base + url, { method: route.method, headers: { 'Content-Type': 'application/json' }, body: ['POST', 'PUT', 'PATCH'].includes(route.method) ? '{}' : undefined, signal: AbortSignal.timeout(15000) });
    status = res.status;
    const body = await res.json();
    assert.ok(expected.includes(res.status), `HTTP ${res.status}; esperado ${expected.join('/')}`);
    assert.equal(typeof body.success, 'boolean', 'Envelope success ausente');
    assert.equal(body.success, res.ok);
    if (array && res.ok) assert.ok(Array.isArray(body.data), 'data deve ser uma lista');
    results.push({ method: route.method, route: route.path, result: 'pass', status, items: Array.isArray(body.data) ? body.data.length : undefined });
    console.log('PASS', route.method, route.path, status);
    return body;
  } catch (error) {
    const reason = error.cause?.code || error.code || error.message;
    results.push({ method: route.method, route: route.path, result: 'fail', status, error: reason });
    console.error('FAIL', route.method, route.path, reason);
    if (['EACCES', 'EPERM', 'ECONNREFUSED'].includes(reason)) throw new Error(`API inacessível em ${base}: ${reason}`);
  }
}
(async () => {
  // Fetch in Node has no persistent cookie jar. An explicit assertion also
  // prevents any protected mutation if the transport unexpectedly has a session.
  const guard = await check({ method: 'GET', path: '/auth/me' }, '/auth/me', [401]);
  assert.equal(guard?.success, false, 'Testes interrompidos: sessão não está isolada.');
  const feed = await check({ method: 'GET', path: '/posts' }, '/posts', [200], true);
  const categories = await check({ method: 'GET', path: '/categorias/populares' }, '/categorias/populares', [200], true);
  const userId = feed?.data?.[0]?.criador?.id || 2147483647;
  const categoryId = categories?.data?.[0]?.id || 2147483647;
  for (const route of routes) {
    if (['GET /auth/me', 'GET /posts', 'GET /categorias/populares'].includes(route.method + ' ' + route.path)) continue;
    if (route.protected) {
      await check(route, route.path.replace(/:[^/]+/g, '2147483647'), [401]);
    } else if (route.method !== 'GET') {
      await check(route, route.path, [400]);
    } else {
      let url = route.path.replace(':id_categoria', String(categoryId)).replace(/:[^/]+/g, String(userId));
      if (url === '/usuarios/pesquisar') url += '?termo=seek-integracao-inexistente-982543&historico=false';
      const mayBeMissing = route.path === '/usuarios/:id' || route.path === '/posts/categoria/:id_categoria';
      await check(route, url, mayBeMissing ? [200, 404] : [200], route.path !== '/usuarios/:id');
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => {
  const counts = { pass: results.filter(value => value.result === 'pass').length, fail: results.filter(value => value.result === 'fail').length };
  fs.mkdirSync(path.resolve(__dirname, '../.expo/verification'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '../.expo/verification/api-check.json'), JSON.stringify({ timestamp: new Date().toISOString(), base, counts, results, note: 'Leituras públicas, validação de campos e proteção das rotas. Não comprova sucesso autenticado nem gravações.' }, null, 2));
  console.log(`${counts.pass} passaram, ${counts.fail} falharam; ${routes.length} rotas no catálogo.`);
  if (counts.fail) process.exitCode = 1;
});
