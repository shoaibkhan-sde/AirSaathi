import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { handleApiRequest } from '../server/apiHandler.ts';

function createMockHttp(
  method: string,
  url: string,
  bodyJson?: unknown,
  headers: Record<string, string> = { 'content-type': 'application/json' }
) {
  const req = new EventEmitter() as any;
  req.method = method;
  req.url = url;
  req.headers = { ...headers };
  req.socket = { remoteAddress: '127.0.0.1' };
  req.destroy = function () {};

  const res = new EventEmitter() as any;
  res.statusCode = 200;
  res.headers = {};
  res.body = '';
  res.setHeader = function (name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
  };
  res.end = function (chunk?: string) {
    if (chunk) this.body += chunk;
    this.emit('finish');
  };

  process.nextTick(() => {
    if (bodyJson !== undefined) {
      req.emit('data', typeof bodyJson === 'string' ? bodyJson : JSON.stringify(bodyJson));
    }
    req.emit('end');
  });

  return { req, res };
}

test('Security 1: API keys and secrets are never exposed in client src/', () => {
  const srcDir = path.resolve('src');
  const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

  for (const rel of files) {
    if (!rel.endsWith('.ts') && !rel.endsWith('.tsx')) continue;
    const full = path.join(srcDir, rel);
    const code = fs.readFileSync(full, 'utf-8');

    assert.equal(
      code.includes('process.env.GEMINI_API_KEY'),
      false,
      `Exposed process.env.GEMINI_API_KEY in client file: ${rel}`
    );
    assert.equal(
      /AIza[0-9A-Za-z-_]{35}/.test(code),
      false,
      `Hardcoded Google API key pattern in client file: ${rel}`
    );
  }
});

test('Security 2: Server-only modules and Node built-ins are not imported in client code', () => {
  const srcDir = path.resolve('src');
  const files = fs.readdirSync(srcDir, { recursive: true }) as string[];
  const forbidden = ['../server', '../../server', 'ioredis', 'node:crypto', 'node:http', 'node:fs'];

  for (const rel of files) {
    if (!rel.endsWith('.ts') && !rel.endsWith('.tsx')) continue;
    const code = fs.readFileSync(path.join(srcDir, rel), 'utf-8');
    for (const mod of forbidden) {
      assert.equal(
        code.includes(`'${mod}`) || code.includes(`"${mod}`),
        false,
        `Client file ${rel} illegally imports ${mod}`
      );
    }
  }
});

test('Security 3: Invalid input is rejected with strict Zod validation', async () => {
  const { req, res } = createMockHttp('POST', '/api/air-quality/current', {
    latitude: 999,
    longitude: 45,
  });

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 400);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'INVALID_INPUT');
      resolve();
    });
    handleApiRequest(req, res);
  });
});

test('Security 4: Unknown fields are strictly rejected', async () => {
  const { req, res } = createMockHttp('POST', '/api/location/resolve', {
    query: 'Mumbai',
    unknownInjectedField: 'malicious',
  });

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 400);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'INVALID_INPUT');
      resolve();
    });
    handleApiRequest(req, res);
  });
});

test('Security 5: Cross-origin requests from untrusted origins are rejected with 403', async () => {
  const { req, res } = createMockHttp(
    'POST',
    '/api/chat',
    { message: 'Hello' },
    {
      'content-type': 'application/json',
      origin: 'https://malicious-website.com',
    }
  );

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 403);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'FORBIDDEN_ORIGIN');
      resolve();
    });
    handleApiRequest(req, res);
  });
});

test('Security 6: Oversized requests (> 50KB) are rejected with 413 Payload Too Large', async () => {
  const hugeData = { message: 'A'.repeat(60_000) };
  const { req, res } = createMockHttp('POST', '/api/chat', hugeData);

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 413);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'PAYLOAD_TOO_LARGE');
      resolve();
    });
    handleApiRequest(req, res);
  });
});
