type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export async function createAiCompletion(messages: ChatMessage[]): Promise<string | null> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
      temperature: 0.4,
    })
    const content = completion.choices?.[0]?.message?.content
    return typeof content === "string" && content.trim() ? content.trim() : null
  } catch {
    return null
  }
}

export async function isAiConfigured(): Promise<boolean> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default
    await ZAI.create()
    return true
  } catch {
    return false
  }
}
