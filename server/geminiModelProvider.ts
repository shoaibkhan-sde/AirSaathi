import { serverConfig } from './config.ts';
import { safeFetch } from './httpClient.ts';
import { validateAndSanitizeAiOutput } from './promptSanitizer.ts';

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface GeminiPayload {
  systemInstruction: { parts: GeminiContentPart[] };
  contents: GeminiContentMessage[];
  generationConfig: { temperature: number; maxOutputTokens: number };
}

interface GeminiModelsResponse {
  models?: Array<{
    name: string;
    supportedGenerationMethods?: string[];
  }>;
  error?: { message?: string };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
}

export interface GeminiCandidateOutcome {
  success: boolean;
  reply?: string;
  model?: string;
  isFallback?: boolean;
  errorStatus?: number;
  errorMessage?: string;
}

let cachedWorkingModel: { model: string; version: string } | null = null;
const PREFERRED_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function parseModelListResponse(rawText: string): GeminiModelsResponse | null {
  try {
    return JSON.parse(rawText) as GeminiModelsResponse;
  } catch {
    return null;
  }
}

function selectBestModel(genModels: string[], userModel: string): string {
  if (userModel && genModels.includes(userModel)) {
    return userModel;
  }
  for (const preferred of PREFERRED_MODELS) {
    if (genModels.includes(preferred)) return preferred;
  }
  return genModels[0];
}

export async function getActiveGeminiModel(
  apiKey: string
): Promise<{ model: string; version: string; error?: string }> {
  if (cachedWorkingModel) return cachedWorkingModel;

  const userModel = serverConfig.GEMINI_MODEL;
  for (const version of ['v1beta', 'v1']) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      const res = await safeFetch(url, {
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      });
      const rawText = await res.text();
      const json = parseModelListResponse(rawText);

      if (res.ok && json?.models && Array.isArray(json.models)) {
        const genModels = json.models
          .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m) => m.name.replace(/^models\//, ''));

        if (genModels.length > 0) {
          cachedWorkingModel = { model: selectBestModel(genModels, userModel), version };
          return cachedWorkingModel;
        }
      } else if (!res.ok) {
        return { model: '', version, error: json?.error?.message || rawText };
      }
    } catch {
      // Continue to next API version
    }
  }

  return { model: userModel || 'gemini-1.5-flash', version: 'v1beta' };
}

async function attemptGeminiRequest(
  url: string,
  apiKey: string,
  payload: GeminiPayload,
  modelName: string
): Promise<GeminiCandidateOutcome | null> {
  try {
    const response = await safeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 503 || response.status === 429 || response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      let parsedMsg = errorText;
      try {
        const errObj = JSON.parse(errorText) as GeminiGenerateResponse;
        if (errObj?.error?.message) parsedMsg = errObj.error.message;
      } catch {
        // Fallback to raw text
      }
      return { success: false, errorStatus: response.status, errorMessage: parsedMsg };
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const sanitized = validateAndSanitizeAiOutput(rawReply, modelName);
    return {
      success: true,
      reply: sanitized.reply,
      model: sanitized.model,
      isFallback: sanitized.isFallback,
    };
  } catch {
    return null;
  }
}

export async function queryGeminiCandidateModels(
  apiKey: string,
  modelInfo: { model: string; version: string },
  payload: GeminiPayload
): Promise<GeminiCandidateOutcome | null> {
  const candidateModels = [
    modelInfo.model,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  for (const model of candidateModels) {
    const cleanModel = model.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${encodeURIComponent(cleanModel)}:generateContent?key=${apiKey}`;
    const result = await attemptGeminiRequest(url, apiKey, payload, cleanModel);
    if (result) return result;
  }

  return null;
}
