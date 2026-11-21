import { z } from 'zod';

const ServerConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  OPEN_METEO_API_KEY: z.string().min(1).optional(),
  OPEN_METEO_API_BASE_URL: z.string().url().default('https://air-quality-api.open-meteo.com'),
  NOMINATIM_USER_AGENT: z.string().min(1).default('AirSaathi-Web/1.0'),
  REDIS_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.array(z.string()).default([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ]),
  RATE_LIMIT_SALT: z.string().default('airsaathi-secure-salt-2025'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

function parseAllowedOrigins(raw?: string): string[] {
  if (!raw) {
    return [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ];
  }
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

function loadServerConfig(): ServerConfig {
  const parsed = ServerConfigSchema.safeParse({
    PORT: process.env.PORT,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || undefined,
    GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || undefined,
    OPEN_METEO_API_KEY: process.env.OPEN_METEO_API_KEY?.trim() || undefined,
    OPEN_METEO_API_BASE_URL: process.env.OPEN_METEO_API_BASE_URL?.trim() || undefined,
    NOMINATIM_USER_AGENT: process.env.NOMINATIM_USER_AGENT?.trim() || undefined,
    REDIS_URL: process.env.REDIS_URL?.trim() || undefined,
    ALLOWED_ORIGINS: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
    RATE_LIMIT_SALT: process.env.RATE_LIMIT_SALT?.trim() || undefined,
    NODE_ENV: process.env.NODE_ENV || 'development',
  });

  if (!parsed.success) {
    console.error('[ServerConfig] Invalid server environment config:', parsed.error.format());
    throw new Error('Server environment configuration failed validation.');
  }

  return Object.freeze(parsed.data);
}

export const serverConfig = loadServerConfig();
