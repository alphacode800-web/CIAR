"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bot, MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import { DEFAULT_AI_SETTINGS } from "@/features/ai/settings"
import type { ChatAction } from "@/features/ai/chat"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  actions?: ChatAction[]
}

export function AiAssistantWidget() {
  const { locale } = useI18n()
  const { navigate } = useRouter()
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/ai/settings")
        const data = await res.json()
        const chatEnabled = Boolean(data.settings?.chatEnabled)
        setEnabled(chatEnabled)
        if (chatEnabled) {
          const welcomeText =
            locale === "ar"
              ? data.settings?.welcomeAr || DEFAULT_AI_SETTINGS.welcomeAr
              : data.settings?.welcomeEn || DEFAULT_AI_SETTINGS.welcomeEn
          setMessages([{ role: "assistant", content: welcomeText }])
          setSuggestions(
            locale === "ar"
              ? [
                  "ما هي المنصات المتاحة؟",
                  "أريد خدمات العقارات",
                  "كيف أتواصل معكم؟",
                ]
              : [
                  "What platforms are available?",
                  "I need real estate services",
                  "How can I contact you?",
                ]
          )
        }
      } catch {
        setEnabled(false)
      } finally {
        setBootstrapped(true)
      }
    }
    loadSettings()
  }, [locale])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  const runAction = useCallback(
    (action: ChatAction) => {
      if (action.slug) {
        navigate({ page: "platform", slug: action.slug })
      } else if (action.page === "contact") {
        navigate({ page: "contact" })
      } else if (action.page === "projects") {
        navigate({ page: "projects" })
      } else if (action.page === "about") {
        navigate({ page: "about" })
      } else {
        navigate({ page: "home" })
      }
      setOpen(false)
    },
    [navigate]
  )

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim()
      if (!text || loading) return

      const nextHistory = [...messages, { role: "user" as const, content: text }]
      setMessages(nextHistory)
      setInput("")
      setLoading(true)

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            locale,
            history: nextHistory.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          }),
        })
        const data = await res.json()
        const reply =
          data.reply ||
          (locale === "ar"
            ? "عذراً، لم أتمكن من الرد الآن. حاول مرة أخرى."
            : "Sorry, I could not reply right now. Please try again.")

        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions)
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply,
            actions: Array.isArray(data.actions) ? data.actions : undefined,
          },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              locale === "ar"
                ? "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً."
                : "Connection error. Please try again later.",
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [input, loading, locale, messages]
  )

  if (!bootstrapped || !enabled) return null

  return (
    <div className="pointer-events-none fixed bottom-5 z-[60] end-5 flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[min(560px,calc(100vh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[oklch(0.76_0.19_48/20%)] bg-white shadow-2xl dark:bg-[oklch(0.12_0.03_265/98%)]">
          <div className="flex items-center justify-between gap-3 border-b border-[oklch(0.76_0.19_48/12%)] bg-gradient-to-r from-[oklch(0.76_0.19_48)] to-[oklch(0.58_0.17_38)] px-4 py-3 text-[oklch(0.15_0.04_80)]">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">
                  {locale === "ar" ? "مساعد CIAR الذكي" : "CIAR Smart Assistant"}
                </p>
                <p className="text-[11px] opacity-80">
                  {locale === "ar" ? "متصل الآن · يرد فوراً" : "Online · instant replies"}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-[oklch(0.15_0.04_80)] hover:bg-white/15"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`}>
                <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-[oklch(0.76_0.19_48)] text-[oklch(0.15_0.04_80)]"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.role === "assistant" && msg.actions && msg.actions.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.actions.map((action) => (
                      <Button
                        key={`${action.page}-${action.slug || "main"}`}
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-xs"
                        onClick={() => runAction(action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {locale === "ar" ? "يكتب..." : "Typing..."}
              </div>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="border-t border-[oklch(0.76_0.19_48/8%)] px-3 py-2">
              <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {locale === "ar" ? "اقتراحات سريعة" : "Quick prompts"}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item)}
                    className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-foreground transition hover:bg-primary/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 border-t border-[oklch(0.76_0.19_48/12%)] p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={locale === "ar" ? "اكتب سؤالك..." : "Type your question..."}
              className="rounded-xl"
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl bg-[oklch(0.76_0.19_48)] text-[oklch(0.15_0.04_80)] hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        size="lg"
        onClick={() => setOpen((prev) => !prev)}
        className="pointer-events-auto h-14 w-14 rounded-full bg-gradient-to-br from-[oklch(0.76_0.19_48)] to-[oklch(0.58_0.17_38)] text-[oklch(0.15_0.04_80)] shadow-lg hover:opacity-90"
        aria-label={locale === "ar" ? "فتح المساعد الذكي" : "Open smart assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
