import { cn } from "@/lib/utils"

type IconProps = { className?: string }

export function FacebookBrandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.02 10.125 11.926v-8.43H7.078v-3.496h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.496h-2.796v8.43C19.612 23.093 24 18.1 24 12.073z"
      />
    </svg>
  )
}

export function GoogleBrandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function AppleBrandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.42 2.19-1.193 2.98-.84.86-2.04 1.36-3.17 1.28-.15-1.09.47-2.24 1.24-3.01.84-.88 2.28-1.53 3.123-1.25.01.33.01.66 0 1zm1.12 3.44c-1.76-.1-3.26.99-4.1.99-.86 0-2.19-.96-3.6-.93-1.85.03-3.56 1.08-4.51 2.75-1.93 3.35-.5 8.31 1.38 11.04.92 1.33 2.01 2.82 3.44 2.77 1.38-.06 1.9-.89 3.57-.89 1.66 0 2.12.89 3.57.86 1.48-.03 2.41-1.35 3.32-2.68 1.04-1.52 1.47-3 1.49-3.08-.03-.01-2.86-1.1-2.89-4.37-.03-2.74 2.22-4.05 2.32-4.11-1.27-1.86-3.24-2.11-3.93-2.15z"
      />
    </svg>
  )
}

const SOCIAL_LINKS = {
  facebook: "https://facebook.com",
  google: "https://accounts.google.com",
  apple: "https://appleid.apple.com",
} as const

type SocialAuthButtonsProps = {
  locale: string
  variant?: "default" | "compact"
  title?: string
  className?: string
}

export function SocialAuthButtons({
  locale,
  variant = "default",
  title,
  className,
}: SocialAuthButtonsProps) {
  const isAr = locale === "ar"
  const heading =
    title ||
    (isAr ? "تسجيل سريع عبر المنصات" : "Quick sign in via platforms")

  const buttonClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background transition-colors hover:bg-muted/40",
    variant === "compact" ? "px-2 py-1.5 text-[11px]" : "px-3 py-2.5 text-xs"
  )

  return (
    <div className={cn("rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2", className)}>
      <p className="text-xs text-muted-foreground">{heading}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className={buttonClass}>
          <FacebookBrandIcon className="h-4 w-4 shrink-0" />
          <span>{isAr ? "فيسبوك" : "Facebook"}</span>
        </a>
        <a href={SOCIAL_LINKS.google} target="_blank" rel="noreferrer" className={buttonClass}>
          <GoogleBrandIcon className="h-4 w-4 shrink-0" />
          <span>{isAr ? "جوجل" : "Google"}</span>
        </a>
        <a href={SOCIAL_LINKS.apple} target="_blank" rel="noreferrer" className={cn(buttonClass, "text-foreground")}>
          <AppleBrandIcon className="h-4 w-4 shrink-0" />
          <span>{isAr ? "آبل" : "Apple"}</span>
        </a>
      </div>
    </div>
  )
}
