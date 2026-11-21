import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'events';
import { resolveLocation } from '../server/geocodingService.ts';
import { handleApiRequest } from '../server/apiHandler.ts';

interface MockResponse extends EventEmitter {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  setHeader: (name: string, value: string) => void;
  end: (chunk?: string) => void;
}

function createMockHttp(method: string, url: string, bodyJson?: unknown) {
  const req = new EventEmitter() as unknown as {
    method: string;
    url: string;
    headers: Record<string, string>;
    emit: (ev: string, data?: unknown) => void;
  };
  req.method = method;
  req.url = url;
  req.headers = {
    'content-type': 'application/json',
  };

  const res = new EventEmitter() as unknown as MockResponse;
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
      req.emit('data', JSON.stringify(bodyJson));
    }
    req.emit('end');
  });

  return { req, res };
}

test('Location Resolution: Empty query throws INVALID_INPUT', async () => {
  await assert.rejects(
    async () => {
      await resolveLocation({ query: '   ' });
    },
    (err: unknown) => {
      const error = err as { code?: string };
      assert.equal(error.code, 'INVALID_INPUT');
      return true;
    }
  );
});

test('Location Precedence: Manual city query overrides stale background coordinates', async () => {
  const result = await resolveLocation({
    query: 'Nandura',
    latitude: 19.72,
    longitude: 77.15,
  });

  assert.equal(result.city, 'Nandura');
  assert.equal(result.state, 'Maharashtra');
  assert.equal(result.name, 'Nandura');
  assert.notEqual(result.city, 'Pardi');
});

test('Location Resolution: 6-digit PIN code 443404 resolves to Nandura, Maharashtra', async () => {
  const result = await resolveLocation({
    query: '443404',
  });

  assert.equal(result.city, 'Nandura');
  assert.equal(result.state, 'Maharashtra');
  assert.equal(result.postcode, '443404');
  assert.equal(result.source, 'pin');
  assert.equal(result.name, 'Nandura');
});

test('API Router: POST /api/onboarding/complete validates required fields', async () => {
  const { req, res } = createMockHttp('POST', '/api/onboarding/complete', {
    householdMembers: [],
  });

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 400);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'INVALID_INPUT');
      resolve();
    });
    handleApiRequest(req as any, res as any);
  });
});

test('API Router: POST /api/chat validates non-empty message', async () => {
  const { req, res } = createMockHttp('POST', '/api/chat', {
    message: '   ',
  });

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 400);
      const json = JSON.parse(res.body);
      assert.equal(json.error.code, 'INVALID_INPUT');
      resolve();
    });
    handleApiRequest(req as any, res as any);
  });
});

test('API Router: POST /api/chat returns helpful notice when GEMINI_API_KEY is unset', async () => {
  const origKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const { req, res } = createMockHttp('POST', '/api/chat', {
    message: 'What does today AQI mean?',
  });

  await new Promise<void>((resolve) => {
    res.on('finish', () => {
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.equal(json.status, 'notice');
      assert.equal(json.isFallback, true);
      assert.ok(json.reply.includes('GEMINI_API_KEY'));
      resolve();
    });
    handleApiRequest(req as any, res as any);
  });

  if (origKey !== undefined) {
    process.env.GEMINI_API_KEY = origKey;
  }
});
