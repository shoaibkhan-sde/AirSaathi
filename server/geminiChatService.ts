import type { IncomingMessage, ServerResponse } from 'http';
import { parseBody, sendJson, sendError } from './apiUtils.ts';
import { serverConfig } from './config.ts';
import { ChatRequestSchema } from './validationSchemas.ts';
import { sanitizeUserPrompt } from './promptSanitizer.ts';
import {
  getActiveGeminiModel,
  queryGeminiCandidateModels,
  type GeminiPayload,
  type GeminiContentMessage,
} from './geminiModelProvider.ts';

interface AICacheEntry {
  reply: string;
  model: string;
  timestamp: number;
}

interface ContextCity {
  name?: string;
  aqi?: number;
  category?: string;
  pm2_5?: number;
}

interface ContextProfile {
  homeType?: string;
  cookingFuel?: string;
  hasAirPurifier?: boolean;
}

const aiResponseCache = new Map<string, AICacheEntry>();
export const AI_FAQ_CACHE_TTL_MS = 60 * 60 * 1000;

function formatContextDescription(context?: Record<string, unknown>): { loc: string; prof: string; page: string } {
  const city = context?.city as ContextCity | undefined;
  const profile = context?.profile as ContextProfile | undefined;
  const page = (context?.activePage as string) || 'home';

  const loc = city?.name
    ? `Location: ${city.name} | US AQI: ${city.aqi ?? 'N/A'} (${city.category ?? 'Unknown'}) | PM2.5: ${city.pm2_5 ?? 'N/A'} µg/m³`
    : 'Location: Not selected';

  const prof = profile
    ? `Profile: Home: ${profile.homeType || 'standard'}, Cooking: ${profile.cookingFuel || 'standard'}, Purifier: ${profile.hasAirPurifier ? 'Yes' : 'No'}`
    : 'Profile: Standard default';

  return { loc, prof, page };
}

function buildSystemInstruction(context?: Record<string, unknown>): string {
  const { loc, prof, page } = formatContextDescription(context);
  return `You are "AirSaathi Assistant", an intelligent air-quality companion for the AirSaathi web app.
App sections: Home, Smart Tips, Indoor Air (never fabricate indoor AQI), Sustainability, Settings.
Context: Tab: ${page} | ${loc} | ${prof}
Guidance: Friendly, clear, concise English with bullet points using the bullet character (•). Do not use raw asterisks (*) or asterisk-wrapped bolding (**). General exposure reduction only, no medical prescribing.`;
}

function buildChatPayload(
  systemPrompt: string,
  sanitizedUserMessage: string,
  history?: Array<{ role: string; content: string }>
): GeminiPayload {
  const contents: GeminiContentMessage[] = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-8)) {
      if (item.content?.trim()) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: sanitizeUserPrompt(item.content) }],
        });
      }
    }
  }
  contents.push({ role: 'user', parts: [{ text: sanitizedUserMessage }] });

  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };
}

function resolveApiKey(): string | undefined {
  const envKey = process.env.GEMINI_API_KEY;
  return (envKey !== undefined ? envKey.trim() : serverConfig.GEMINI_API_KEY) || undefined;
}

function checkFaqCache(
  key: string,
  canCache: boolean
): { reply: string; model: string } | null {
  if (!canCache) return null;
  const cached = aiResponseCache.get(key);
  if (cached && Date.now() - cached.timestamp < AI_FAQ_CACHE_TTL_MS) {
    return { reply: cached.reply, model: cached.model };
  }
  return null;
}

function sendStandardFallback(res: ServerResponse): void {
  sendJson(res, 200, {
    status: 'notice',
    reply:
      '• Keep windows closed during peak morning inversion hours (6 AM - 10 AM).\n• Run bedroom HEPA air purifiers continuously when ambient AQI is elevated.\n• Wear an N95 mask when commuting on two-wheelers or walking outdoors.\n\n*(Notice: Live Gemini models are currently experiencing peak demand. Providing verified clean-air advisory.)*',
    model: 'fallback-advisor',
    isFallback: true,
  });
}

function sendChatOutcome(
  res: ServerResponse,
  outcome: ReturnType<typeof queryGeminiCandidateModels> extends Promise<infer T> ? T : never,
  cleanModel: string,
  cacheKey: string,
  canCache: boolean
): void {
  if (outcome?.success && outcome.reply) {
    if (canCache && !outcome.isFallback) {
      aiResponseCache.set(cacheKey, {
        reply: outcome.reply,
        model: outcome.model || cleanModel,
        timestamp: Date.now(),
      });
    }
    sendJson(res, 200, {
      status: 'success',
      reply: outcome.reply,
      model: outcome.model,
      isFallback: outcome.isFallback,
    });
    return;
  }

  if (outcome?.errorStatus && outcome.errorMessage) {
    sendError(res, outcome.errorStatus, 'UPSTREAM_GEMINI_ERROR', outcome.errorMessage);
    return;
  }

  sendStandardFallback(res);
}

export async function handleChatRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const rawBody = await parseBody(req);
  const parsed = ChatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    sendError(res, 400, 'INVALID_INPUT', parsed.error.issues[0]?.message || 'Invalid chat request structure.');
    return;
  }

  const { message, history, context } = parsed.data;
  const sanitizedUserMessage = sanitizeUserPrompt(message);
  const apiKey = resolveApiKey();
  if (!apiKey) {
    sendJson(res, 200, {
      status: 'notice',
      reply: 'Please add `GEMINI_API_KEY=your_key` to your `.env` file to enable live Gemini AI answers.',
      isFallback: true,
    });
    return;
  }

  const modelInfo = await getActiveGeminiModel(apiKey);
  if (modelInfo.error) {
    sendError(res, 400, 'UPSTREAM_GEMINI_ERROR', `Google Gemini setup required: ${modelInfo.error}`);
    return;
  }

  const cleanModel = modelInfo.model.replace(/^models\//, '');
  const canCache = (!history || history.length === 0) && !context?.profile;
  const cacheKey = `ai_faq_${cleanModel}_${sanitizedUserMessage.toLowerCase()}`;
  const cached = checkFaqCache(cacheKey, canCache);
  if (cached) {
    sendJson(res, 200, { status: 'success', reply: cached.reply, model: cached.model });
    return;
  }

  const payload = buildChatPayload(buildSystemInstruction(context), sanitizedUserMessage, history);
  const outcome = await queryGeminiCandidateModels(apiKey, modelInfo, payload);
  sendChatOutcome(res, outcome, cleanModel, cacheKey, canCache);
}
