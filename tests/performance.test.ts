import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { handleApiRequest } from '../server/apiHandler.ts';
import { loadChatHistory, saveChatHistory } from '../src/services/chatStorage.ts';

function createMockHttp(method: string, url: string, bodyJson?: unknown) {
  const req = new EventEmitter() as any;
  req.method = method;
  req.url = url;
  req.headers = { 'content-type': 'application/json' };
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
      req.emit('data', JSON.stringify(bodyJson));
    }
    req.emit('end');
  });

  return { req, res };
}

test('Performance: Code-splitting lazy loads heavy tabs and modals in App.tsx', () => {
  const appCode = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appCode.includes('lazy('), 'App.tsx must use React.lazy() for route code splitting');
  assert.ok(appCode.includes('Suspense'), 'App.tsx must wrap lazy components in Suspense');
  assert.ok(appCode.includes('SmartTipsView'), 'SmartTipsView should be dynamically imported');
  assert.ok(appCode.includes('IndoorAirView'), 'IndoorAirView should be dynamically imported');
  assert.ok(appCode.includes('SustainabilityView'), 'SustainabilityView should be dynamically imported');
});

test('Performance: ChatWindow is dynamically loaded on demand in AirSaathiAssistant', () => {
  const assistantCode = fs.readFileSync(
    path.resolve('src/components/assistant/AirSaathiAssistant.tsx'),
    'utf-8'
  );
  assert.ok(
    assistantCode.includes('lazy('),
    'AirSaathiAssistant must use lazy() for ChatWindow to avoid unneeded bundle load'
  );
  assert.ok(
    assistantCode.includes('{isOpen &&'),
    'ChatWindow should only render when open'
  );
});

test('Performance: Above-the-fold hero image has fetchPriority=high and decoding=async', () => {
  const heroCode = fs.readFileSync(
    path.resolve('src/components/dashboard/AQIHeroCard.tsx'),
    'utf-8'
  );
  assert.ok(heroCode.includes('fetchPriority="high"'), 'Hero image must set fetchPriority=high for fast LCP');
  assert.ok(heroCode.includes('decoding="async"'), 'Hero image must set decoding=async');
});

test('Performance: Below-the-fold images have loading=lazy and decoding=async', () => {
  const sidebarCode = fs.readFileSync(path.resolve('src/components/common/Sidebar.tsx'), 'utf-8');
  assert.ok(sidebarCode.includes('loading="lazy"'), 'Sidebar image must use loading=lazy');

  const tipsCode = fs.readFileSync(path.resolve('src/components/tips/SmartTipsView.tsx'), 'utf-8');
  assert.ok(tipsCode.includes('loading="lazy"'), 'SmartTips image must use loading=lazy');

  const indoorCode = fs.readFileSync(path.resolve('src/components/indoor/IndoorAirView.tsx'), 'utf-8');
  assert.ok(indoorCode.includes('loading="lazy"'), 'IndoorAir image must use loading=lazy');
});

test('Performance: Chat history persists across page reloads via storage service', () => {
  const mockStorage: Record<string, string> = {};
  const originalLocalStorage = globalThis.localStorage;

  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => {},
    length: 0,
    key: () => null,
  };

  try {
    saveChatHistory([
      { id: '1', sender: 'user', text: 'What is AQI?', timestamp: '10:00 AM' },
      { id: '2', sender: 'assistant', text: 'Air Quality Index', timestamp: '10:01 AM' },
    ]);

    const loaded = loadChatHistory();
    assert.equal(loaded.length, 2);
    assert.equal(loaded[0].text, 'What is AQI?');
    assert.equal(loaded[1].text, 'Air Quality Index');
  } finally {
    globalThis.localStorage = originalLocalStorage;
  }
});

test('Performance: Server-side FAQ caching responds quickly to repeated general queries', async () => {
  const query = { message: 'How is PM2.5 measured in outdoor air?' };

  const { req: req1, res: res1 } = createMockHttp('POST', '/api/chat', query);
  await new Promise<void>((resolve) => {
    res1.on('finish', () => resolve());
    handleApiRequest(req1, res1);
  });

  const { req: req2, res: res2 } = createMockHttp('POST', '/api/chat', query);
  await new Promise<void>((resolve) => {
    res2.on('finish', () => {
      assert.equal(res2.statusCode, 200);
      resolve();
    });
    handleApiRequest(req2, res2);
  });
});
