import type { ChatMessage, CityLocation, UserProfile } from '../types';

export interface ChatDynamicContext {
  activePage: string;
  city?: CityLocation;
  profile?: UserProfile | null;
}

export interface ChatServiceResponse {
  reply: string;
  isNotice?: boolean;
}

export async function requestAssistantReply(
  message: string,
  history: ChatMessage[],
  context: ChatDynamicContext
): Promise<ChatServiceResponse> {
  const historyPayload = history.map((m) => ({
    role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.text || m.structured?.directAnswer || '',
  }));

  const payload = {
    message,
    history: historyPayload,
    context: {
      activePage: context.activePage,
      city: context.city
        ? {
            name: context.city.name,
            aqi: context.city.aqi,
            category: context.city.category,
            pm2_5: context.city.pm2_5,
            pm10: context.city.pm10,
            dominantPollutant: context.city.dominantPollutant,
          }
        : undefined,
      profile: context.profile
        ? {
            cookingFuel: context.profile.cookingFuel,
            heatingFuel: context.profile.heatingFuel,
            hasAirPurifier: context.profile.hasAirPurifier,
            commuteMode: context.profile.commuteMode,
            homeType: context.profile.homeType,
            ventilationType: context.profile.ventilationType,
            householdMembers: context.profile.householdMembers,
            healthConsiderations: context.profile.healthConsiderations,
          }
        : undefined,
    },
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(15000) : undefined,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      let detailMsg = '';
      if (errJson?.error?.details) {
        try {
          const parsed =
            typeof errJson.error.details === 'string'
              ? JSON.parse(errJson.error.details)
              : errJson.error.details;
          if (parsed?.error?.message) {
            detailMsg = `: ${parsed.error.message}`;
          }
        } catch {
          if (typeof errJson.error.details === 'string') {
            detailMsg = `: ${errJson.error.details.slice(0, 150)}`;
          }
        }
      }
      const errMsg =
        errJson?.error?.message ||
        `Server responded with status ${response.status}. Please check your connection.`;
      return {
        reply: `⚠️ Unable to connect to AirSaathi AI: ${errMsg}${detailMsg}`,
        isNotice: true,
      };
    }

    const data = await response.json();
    return {
      reply: data.reply || 'No response generated.',
      isNotice: data.status === 'notice',
    };
  } catch {
    return {
      reply:
        '⚠️ Network connection issue. Unable to communicate with the AirSaathi server. Please ensure the local backend or dev server is running.',
      isNotice: true,
    };
  }
}
