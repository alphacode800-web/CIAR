import { z } from "zod"
import {
  getNewsTickerFontStack,
  newsTickerFontKeys,
  type NewsTickerFontKey,
} from "@/lib/news-ticker"

export type TextStyle = {
  color: string
  fontFamily: NewsTickerFontKey
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800
}

export const textStyleSchema = z.object({
  color: z.string(),
  fontFamily: z.enum(newsTickerFontKeys),
  fontSize: z.number().min(10).max(96),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800)]),
})

export function textStyleToCss(style: TextStyle) {
  return {
    color: style.color,
    fontFamily: getNewsTickerFontStack(style.fontFamily),
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
  } as const
}

export function titleStyleToCss(
  style: TextStyle & { useGradient?: boolean; accentColor?: string }
) {
  if (style.useGradient && style.accentColor) {
    return {
      fontFamily: getNewsTickerFontStack(style.fontFamily),
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      backgroundImage: `linear-gradient(135deg, ${style.accentColor}, ${style.color})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    } as const
  }
  return textStyleToCss(style)
}
