import type { IncomingMessage, ServerResponse } from 'http';
import { resolveLocation } from './geocodingService.ts';
import { fetchCurrentAirQuality } from './airQualityService.ts';
import { generatePersonalizedRecommendations } from './recommendationService.ts';
import { handleChatRequest } from './geminiChatService.ts';
import { sendJson, sendError, parseBody, mapErrorStatus } from './apiUtils.ts';
import { applySecurityHeaders } from './securityHeaders.ts';
import { extractClientIp, checkRateLimit } from './clientRateLimiter.ts';
import {
  LocationResolveSchema,
  AirQualityCurrentSchema,
  OnboardingCompleteSchema,
} from './validationSchemas.ts';

async function handleLocationResolve(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await parseBody(req);
  const parsed = LocationResolveSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, 'INVALID_INPUT', parsed.error.issues[0]?.message || 'Invalid location request');
    return;
  }
  const location = await resolveLocation(parsed.data);
  sendJson(res, 200, { status: 'success', location });
}

async function handleAirQualityCurrent(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await parseBody(req);
  const parsed = AirQualityCurrentSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, 'INVALID_INPUT', 'latitude and longitude are required coordinates.');
    return;
  }
  const airQuality = await fetchCurrentAirQuality(
    parsed.data.latitude,
    parsed.data.longitude,
    parsed.data.countryCode
  );
  sendJson(res, 200, { status: 'success', airQuality });
}

async function handleOnboardingComplete(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await parseBody(req);
  const parsed = OnboardingCompleteSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, 'INVALID_INPUT', parsed.error.issues[0]?.message || 'Invalid onboarding fields.');
    return;
  }

  const { location, ...profileFields } = parsed.data;
  const resolvedLocation = await resolveLocation({
    query: location.query || location.name,
    countryCode: location.countryCode,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const airQuality = await fetchCurrentAirQuality(
    resolvedLocation.latitude,
    resolvedLocation.longitude,
    resolvedLocation.countryCode
  );

  const recommendations = generatePersonalizedRecommendations(airQuality, {
    location,
    ...profileFields,
  } as any);

  sendJson(res, 200, {
    status: 'success',
    location: resolvedLocation,
    airQuality,
    recommendations,
  });
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url?.split('?')[0] || '';
  if (!url.startsWith('/api/')) return false;

  const isOriginAllowed = applySecurityHeaders(req, res);
  if (!isOriginAllowed) {
    sendError(res, 403, 'FORBIDDEN_ORIGIN', 'Cross-origin request rejected.');
    return true;
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.end();
    return true;
  }

  const clientIp = extractClientIp(req);
  const apiLimit = await checkRateLimit(clientIp, 'api', 60);
  if (!apiLimit.allowed) {
    res.setHeader('Retry-After', apiLimit.resetSec.toString());
    sendError(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.');
    return true;
  }

  if (url === '/api/chat') {
    const chatLimit = await checkRateLimit(clientIp, 'chat', 20);
    if (!chatLimit.allowed) {
      res.setHeader('Retry-After', chatLimit.resetSec.toString());
      sendError(res, 429, 'RATE_LIMIT_EXCEEDED', 'Chat rate limit exceeded. Please wait a moment.');
      return true;
    }
  }

  try {
    if (url === '/api/location/resolve' && req.method === 'POST') {
      await handleLocationResolve(req, res);
      return true;
    }
    if (url === '/api/air-quality/current' && req.method === 'POST') {
      await handleAirQualityCurrent(req, res);
      return true;
    }
    if (url === '/api/onboarding/complete' && req.method === 'POST') {
      await handleOnboardingComplete(req, res);
      return true;
    }
    if (url === '/api/chat' && req.method === 'POST') {
      await handleChatRequest(req, res);
      return true;
    }

    sendError(res, 404, 'INVALID_INPUT', `API endpoint ${req.method} ${url} does not exist.`);
    return true;
  } catch (err: any) {
    const status = mapErrorStatus(err);
    sendError(
      res,
      status,
      err.code || 'INTERNAL_ERROR',
      err.message || 'An unexpected backend processing error occurred.'
    );
    return true;
  }
}
