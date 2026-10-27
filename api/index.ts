import type { IncomingMessage, ServerResponse } from 'node:http';
import { defaultStore } from '../src/lib/store/database.ts';
import { createAppController } from '../src/server/app-server.ts';
import {
  isSupabaseServerSyncEnabled,
  syncStoreToSupabase,
} from '../src/lib/store/supabase-sync.ts';

const controller = createAppController(defaultStore);

async function parseRequestBody(
  req: IncomingMessage & { body?: unknown }
): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) raw = raw.slice(0, 1_000_000);
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

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
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
    headers: req.headers as Record<string, string | undefined>,
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
