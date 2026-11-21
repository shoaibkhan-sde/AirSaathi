import { AIOutputSchema } from './validationSchemas.ts';

const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+instructions/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /system\s*:\s*/gi,
  /\[system\]/gi,
  /<\/?instructions?>/gi,
  /jailbreak/gi,
  /reveal\s+(your\s+)?(system\s+prompt|api\s+key|secret)/gi,
];

export function stripControlCharacters(text: string): string {
  if (!text) return '';
  return text.replace(CONTROL_CHARS_REGEX, '');
}

export function sanitizeUserPrompt(rawMessage: string): string {
  let cleaned = stripControlCharacters(rawMessage).trim();

  // Neutralize common prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[neutralized]');
  }

  // Cap message length to 1000 characters
  if (cleaned.length > 1000) {
    cleaned = cleaned.slice(0, 1000);
  }

  return cleaned;
}

export function validateAndSanitizeAiOutput(
  rawText: string | undefined,
  modelName: string
): { reply: string; model: string; isFallback?: boolean } {
  const fallbackReply =
    'AirSaathi Assistant is currently operating in safe advisory mode. Please maintain indoor ventilation and check outdoor AQI before outdoor exertion.';

  if (!rawText || typeof rawText !== 'string') {
    return { reply: fallbackReply, model: modelName, isFallback: true };
  }

  const cleaned = stripControlCharacters(rawText).trim();

  const parsed = AIOutputSchema.safeParse({
    reply: cleaned,
    model: modelName,
    status: 'success',
  });

  if (!parsed.success || !parsed.data.reply) {
    return { reply: fallbackReply, model: modelName, isFallback: true };
  }

  return { reply: parsed.data.reply, model: modelName };
}
