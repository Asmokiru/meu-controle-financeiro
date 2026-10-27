import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function compileDir(srcDir: string, outDir: string): void {
  fs.mkdirSync(outDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const fullSrc = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      compileDir(fullSrc, path.join(outDir, entry.name));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const tsCode = fs.readFileSync(fullSrc, 'utf8');
      let jsCode = stripTypeScriptTypes(tsCode);
      // Reescreve imports relativos .ts para .mjs
      jsCode = jsCode.replace(
        /(from\s+['"]\.[^'"]+)\.ts(['"])/g,
        '$1.mjs$2'
      );
      const outPath = path.join(outDir, entry.name.replace(/\.ts$/, '.mjs'));
      fs.writeFileSync(outPath, jsCode, 'utf8');
    }
  }
}

compileDir(path.join(ROOT, 'src/lib'), path.join(ROOT, 'api/_dist/lib'));
compileDir(path.join(ROOT, 'src/server'), path.join(ROOT, 'api/_dist/server'));

const apiIndexMjs = `import { defaultStore } from './_dist/lib/store/database.mjs';
import { createAppController } from './_dist/server/app-server.mjs';
import {
  isSupabaseServerSyncEnabled,
  syncStoreToSupabase,
} from './_dist/lib/store/supabase-sync.mjs';

const controller = createAppController(defaultStore);

function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1000000) raw = raw.slice(0, 1000000);
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  const method = (req.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const body = isMutation ? await parseRequestBody(req) : {};

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const result = await controller.dispatch({
    method,
    url: req.url || '/',
    headers: req.headers,
    body,
    clientIp,
  });

  if (
    isMutation &&
    result.status >= 200 &&
    result.status < 300 &&
    isSupabaseServerSyncEnabled()
  ) {
    await syncStoreToSupabase(defaultStore, controller.demoUserId).catch(() => {});
  }

  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v);
  }
  res.statusCode = result.status;
  res.end(result.body);
}
`;

fs.writeFileSync(path.join(ROOT, 'api/index.mjs'), apiIndexMjs, 'utf8');
if (fs.existsSync(path.join(ROOT, 'api/index.ts'))) {
  fs.unlinkSync(path.join(ROOT, 'api/index.ts'));
}
console.log('✅ Bundle serverless api/index.mjs gerado com sucesso.');
