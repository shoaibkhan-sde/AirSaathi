import type { IncomingMessage, ServerResponse } from 'http';
import { serverConfig } from './config.ts';

export const CSP_HEADER_VALUE = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://generativelanguage.googleapis.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_HEADER_VALUE,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function isAllowedOrigin(
  origin?: string,
  host?: string
): boolean {
  if (!origin) return true; // Direct/same-origin navigation or server-to-server

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;

    if (host && originHost.toLowerCase() === host.toLowerCase()) {
      return true;
    }

    const normalized = `${originUrl.protocol}//${originHost}`.toLowerCase();
    return serverConfig.ALLOWED_ORIGINS.some(
      (allowed) => allowed.toLowerCase() === normalized
    );
  } catch {
    return false;
  }
}

export function applySecurityHeaders(
  req: IncomingMessage,
  res: ServerResponse
): boolean {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }

  const rawOrigin = req.headers.origin;
  const rawHost = req.headers.host;
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;

  if (origin) {
    if (!isAllowedOrigin(origin, host)) {
      return false; // Cross-origin rejection
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  return true;
}
