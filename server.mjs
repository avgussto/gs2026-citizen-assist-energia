import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!['/', '/index.html', '/styles.css'].includes(pathname) && !/^\/(src|data)\/[\w.-]+\.(js|json)$/.test(pathname)) {
      response.writeHead(404).end('Arquivo não encontrado');
      return;
    }
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('Acesso negado');
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(contents);
  } catch {
    response.writeHead(404).end('Arquivo não encontrado');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Citizen Assist AI: http://127.0.0.1:${port}`);
});
