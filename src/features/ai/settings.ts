export type AiSettings = {
  chatEnabled: boolean
  sentimentEnabled: boolean
  seoEnabled: boolean
  recommendationsEnabled: boolean
  inventoryEnabled: boolean
  fraudEnabled: boolean
  welcomeAr: string
  welcomeEn: string
}

export const AI_SETTING_KEYS = [
  "ai_chat_enabled",
  "ai_sentiment_enabled",
  "ai_seo_enabled",
  "ai_recommendations_enabled",
  "ai_inventory_enabled",
  "ai_fraud_enabled",
  "ai_chat_welcome_ar",
  "ai_chat_welcome_en",
] as const

export const DEFAULT_AI_SETTINGS: AiSettings = {
  chatEnabled: true,
  sentimentEnabled: true,
  seoEnabled: true,
  recommendationsEnabled: true,
  inventoryEnabled: false,
  fraudEnabled: false,
  welcomeAr: "مرحباً! أنا مساعد CIAR الذكي. كيف يمكنني مساعدتك اليوم؟",
  welcomeEn: "Hello! I'm the CIAR smart assistant. How can I help you today?",
}

const asBool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  return value === "1" || value === "true"
}

export function parseAiSettings(settings: Record<string, string>): AiSettings {
  return {
    chatEnabled: asBool(settings.ai_chat_enabled, DEFAULT_AI_SETTINGS.chatEnabled),
    sentimentEnabled: asBool(settings.ai_sentiment_enabled, DEFAULT_AI_SETTINGS.sentimentEnabled),
    seoEnabled: asBool(settings.ai_seo_enabled, DEFAULT_AI_SETTINGS.seoEnabled),
    recommendationsEnabled: asBool(settings.ai_recommendations_enabled, DEFAULT_AI_SETTINGS.recommendationsEnabled),
    inventoryEnabled: asBool(settings.ai_inventory_enabled, DEFAULT_AI_SETTINGS.inventoryEnabled),
    fraudEnabled: asBool(settings.ai_fraud_enabled, DEFAULT_AI_SETTINGS.fraudEnabled),
    welcomeAr: settings.ai_chat_welcome_ar?.trim() || DEFAULT_AI_SETTINGS.welcomeAr,
    welcomeEn: settings.ai_chat_welcome_en?.trim() || DEFAULT_AI_SETTINGS.welcomeEn,
  }
}

export function serializeAiSettings(settings: AiSettings): Record<string, string> {
  return {
    ai_chat_enabled: settings.chatEnabled ? "1" : "0",
    ai_sentiment_enabled: settings.sentimentEnabled ? "1" : "0",
    ai_seo_enabled: settings.seoEnabled ? "1" : "0",
    ai_recommendations_enabled: settings.recommendationsEnabled ? "1" : "0",
    ai_inventory_enabled: settings.inventoryEnabled ? "1" : "0",
    ai_fraud_enabled: settings.fraudEnabled ? "1" : "0",
    ai_chat_welcome_ar: settings.welcomeAr,
    ai_chat_welcome_en: settings.welcomeEn,
  }
}
