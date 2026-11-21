export const ALLOWED_UPSTREAM_HOSTS = new Set<string>([
  'generativelanguage.googleapis.com',
  'air-quality-api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'customer-api.open-meteo.com',
  'nominatim.openstreetmap.org',
]);

export interface SafeFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export function validateUpstreamUrl(urlStr: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid upstream URL format: ${urlStr}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`Upstream request blocked: only HTTPS is permitted (got ${parsed.protocol})`);
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_UPSTREAM_HOSTS.has(host)) {
    throw new Error(`Upstream request blocked: host "${host}" is not in the security allowlist.`);
  }

  return parsed;
}

export async function safeFetch(
  urlStr: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  validateUpstreamUrl(urlStr);

  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const cleanHeaders: Record<string, string> = {};
  if (options.headers) {
    for (const [key, val] of Object.entries(options.headers)) {
      const lower = key.toLowerCase();
      // Never forward client authorization, cookies, or caller identity
      if (
        lower === 'cookie' ||
        lower === 'authorization' ||
        lower === 'proxy-authorization' ||
        lower === 'x-forwarded-for'
      ) {
        continue;
      }
      cleanHeaders[key] = val;
    }
  }

  try {
    const response = await fetch(urlStr, {
      method: options.method || 'GET',
      headers: cleanHeaders,
      body: options.body,
      signal: controller.signal,
      redirect: 'error', // Disallow redirects to prevent SSRF
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw {
        code: 'UPSTREAM_TIMEOUT',
        message: `Upstream request timed out after ${timeoutMs}ms.`,
      };
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
