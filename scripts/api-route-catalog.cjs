const fs = require('node:fs');
const path = require('node:path');

function catalog(root = path.resolve(__dirname, '../../nova_api_seek')) {
  const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  const mounts = [...server.matchAll(/app\.use\("([^"]+)",\s*(\w+)\)/g)];
  const routes = [];
  for (const [, prefix, name] of mounts) {
    const imported = server.match(new RegExp('const\\s+' + name + '\\s*=\\s*require\\("([^"\\n]+)"\\)'));
    if (!imported) continue;
    const source = fs.readFileSync(path.join(root, imported[1] + '.js'), 'utf8');
    const matches = [...source.matchAll(/router\.(get|post|put|patch|delete)\(\s*"([^"]+)"/g)];
    const sharedAuth = /router\.use\((?:authMiddleware|auth)\)/.test(source);
    matches.forEach((match, i) => {
      const body = source.slice(match.index, matches[i + 1]?.index || source.length);
      const protectedRoute = sharedAuth || /[,\s](?:authMiddleware|auth)\s*[,)]/.test(body);
      routes.push({ method: match[1].toUpperCase(), path: prefix + (match[2] === '/' ? '' : match[2]), protected: protectedRoute || (prefix === '/auth' && match[2] === '/logout') });
    });
  }
  return routes;
}
module.exports = { catalog };
if (require.main === module) console.log(JSON.stringify(catalog(process.argv[2]), null, 2));
