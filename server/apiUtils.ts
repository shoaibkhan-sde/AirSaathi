import type { IncomingMessage, ServerResponse } from 'http';
import type { ApiErrorResponse, ApiErrorCode } from './types.ts';

export const MAX_BODY_SIZE_BYTES = 50_000; // 50 KB strict cap

export function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function sendError(
  res: ServerResponse,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): void {
  const errPayload: ApiErrorResponse = {
    error: {
      code: code as ApiErrorCode,
      message,
      details,
    },
  };
  sendJson(res, statusCode, errPayload);
}

export function parseBody(req: IncomingMessage): Promise<any> {
  const anyReq = req as any;
  if (anyReq.body !== undefined && anyReq.body !== null) {
    if (typeof anyReq.body === 'string') {
      if (!anyReq.body.trim()) return Promise.resolve({});
      try {
        return Promise.resolve(JSON.parse(anyReq.body));
      } catch {
        return Promise.reject({
          statusCode: 400,
          code: 'INVALID_JSON',
          message: 'Malformed JSON payload in request body.',
        });
      }
    }
    return Promise.resolve(anyReq.body);
  }

  return new Promise((resolve, reject) => {
    const method = req.method?.toUpperCase();
    if (method === 'POST' || method === 'PUT') {
      const rawContentType = req.headers?.['content-type'];
      const contentType = Array.isArray(rawContentType)
        ? rawContentType[0] || ''
        : rawContentType || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        reject({
          statusCode: 415,
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
        });
        return;
      }
    }

    let body = '';
    let totalBytes = 0;

    req.on('data', (chunk: Buffer | string) => {
      totalBytes += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
      if (totalBytes > MAX_BODY_SIZE_BYTES) {
        if (typeof req.destroy === 'function') req.destroy();
        reject({
          statusCode: 413,
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request payload exceeds strict limit of ${MAX_BODY_SIZE_BYTES} bytes.`,
        });
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject({
          statusCode: 400,
          code: 'INVALID_JSON',
          message: 'Malformed JSON payload in request body.',
        });
      }
    });

    req.on('error', (err: unknown) => reject(err));
  });
}

export function mapErrorStatus(err: { statusCode?: number; code?: string }): number {
  if (err.statusCode) return err.statusCode;
  if (err.code === 'INVALID_INPUT' || err.code === 'INVALID_JSON') return 400;
  if (err.code === 'FORBIDDEN_ORIGIN') return 403;
  if (err.code === 'LOCATION_NOT_FOUND') return 404;
  if (err.code === 'PAYLOAD_TOO_LARGE') return 413;
  if (err.code === 'INVALID_CONTENT_TYPE') return 415;
  if (err.code === 'RATE_LIMIT_EXCEEDED') return 429;
  if (err.code === 'UPSTREAM_TIMEOUT') return 504;
  return 502;
}
