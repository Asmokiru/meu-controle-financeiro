import { defaultStore } from './_dist/lib/store/database.mjs';
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
