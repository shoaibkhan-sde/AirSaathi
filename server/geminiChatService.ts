import type { IncomingMessage, ServerResponse } from 'http';
import { parseBody, sendJson, sendError } from './apiUtils.ts';
import { serverConfig } from './config.ts';
import { safeFetch } from './httpClient.ts';
import { ChatRequestSchema } from './validationSchemas.ts';
import { sanitizeUserPrompt, validateAndSanitizeAiOutput } from './promptSanitizer.ts';

let cachedWorkingModel: { model: string; version: string } | null = null;

interface AICacheEntry {
  reply: string;
  model: string;
  timestamp: number;
}
const aiResponseCache = new Map<string, AICacheEntry>();
export const AI_FAQ_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

function buildSystemInstruction(context?: Record<string, unknown>): string {
  const city = context?.city as any;
  const profile = context?.profile as any;
  const activePage = (context?.activePage as string) || 'home';

  const loc = city?.name
    ? `Location: ${city.name} | US AQI: ${city.aqi ?? 'N/A'} (${city.category ?? 'Unknown'}) | PM2.5: ${city.pm2_5 ?? 'N/A'} µg/m³`
    : 'Location: Not selected';

  const prof = profile
    ? `Profile: Home: ${profile.homeType || 'standard'}, Cooking: ${profile.cookingFuel || 'standard'}, Purifier: ${profile.hasAirPurifier ? 'Yes' : 'No'}`
    : 'Profile: Standard default';

  return `You are "AirSaathi Assistant", an intelligent air-quality companion for the AirSaathi web app.
App sections: Home, Smart Tips, Indoor Air (never fabricate indoor AQI), Sustainability, Settings.
Context: Tab: ${activePage} | ${loc} | ${prof}
Guidance: Friendly, clear, concise English with bullet points using the bullet character (•). Do not use raw asterisks (*) or asterisk-wrapped bolding (**). General exposure reduction only, no medical prescribing.`;
}

async function getActiveGeminiModel(apiKey: string): Promise<{ model: string; version: string; error?: string }> {
  if (cachedWorkingModel) return cachedWorkingModel;

  const userModel = serverConfig.GEMINI_MODEL;
  for (const version of ['v1beta', 'v1']) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      const res = await safeFetch(url, { headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' } });
      const rawText = await res.text();
      let json: any = null;
      try { json = JSON.parse(rawText); } catch { json = null; }

      if (res.ok && json?.models && Array.isArray(json.models)) {
        const genModels = json.models
          .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map((m: any) => String(m.name).replace(/^models\//, ''));

        if (genModels.length > 0) {
          if (userModel && genModels.includes(userModel)) {
            cachedWorkingModel = { model: userModel, version };
            return cachedWorkingModel;
          }
          const preferred = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
          let chosen = genModels[0];
          for (const p of preferred) {
            if (genModels.includes(p)) { chosen = p; break; }
          }
          cachedWorkingModel = { model: chosen, version };
          return cachedWorkingModel;
        }
      } else if (!res.ok) {
        return { model: '', version, error: json?.error?.message || rawText };
      }
    } catch {
      // Continue
    }
  }

  return { model: userModel || 'gemini-1.5-flash', version: 'v1beta' };
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

  const apiKey = (process.env.GEMINI_API_KEY !== undefined ? process.env.GEMINI_API_KEY.trim() : serverConfig.GEMINI_API_KEY) || undefined;
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

  const systemPrompt = buildSystemInstruction(context);
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

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

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };

  const cleanModel = modelInfo.model.replace(/^models\//, '');
  const canCache = (!history || history.length === 0) && !context?.profile;
  const cacheKey = `ai_faq_${cleanModel}_${sanitizedUserMessage.toLowerCase()}`;

  if (canCache) {
    const cached = aiResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < AI_FAQ_CACHE_TTL_MS) {
      sendJson(res, 200, {
        status: 'success',
        reply: cached.reply,
        model: cached.model,
      });
      return;
    }
  }

  const url = `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${encodeURIComponent(cleanModel)}:generateContent?key=${apiKey}`;

  try {
    const response = await safeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMsg = errorText;
      try {
        const errObj = JSON.parse(errorText);
        if (errObj?.error?.message) parsedMsg = errObj.error.message;
      } catch {
        // Keep text
      }
      sendError(res, response.status, 'UPSTREAM_GEMINI_ERROR', parsedMsg);
      return;
    }

    const data = (await response.json()) as any;
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const sanitizedOutput = validateAndSanitizeAiOutput(rawReply, cleanModel);

    if (canCache && !sanitizedOutput.isFallback) {
      aiResponseCache.set(cacheKey, {
        reply: sanitizedOutput.reply,
        model: cleanModel,
        timestamp: Date.now(),
      });
    }

    sendJson(res, 200, {
      status: 'success',
      reply: sanitizedOutput.reply,
      model: sanitizedOutput.model,
      isFallback: sanitizedOutput.isFallback,
    });
  } catch (err: any) {
    sendError(res, 502, 'UPSTREAM_TIMEOUT', err.message || 'Gemini connection timeout.');
  }
}
