export const POST_AUTH_REDIRECT_KEY = "ciar_post_auth_redirect"
export const SELECTED_SUBSCRIPTION_PLAN_KEY = "ciar_selected_subscription_plan"
export const PENDING_SUBSCRIPTION_ID_KEY = "ciar_pending_subscription_id"

export type PostAuthRedirect = "advertise" | "subscription"

export function setPostAuthRedirect(target: PostAuthRedirect) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, target)
}

export function consumePostAuthRedirect(): PostAuthRedirect | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY)
  return value === "advertise" || value === "subscription" ? value : null
}

export function getSelectedSubscriptionPlan(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(SELECTED_SUBSCRIPTION_PLAN_KEY)
}

export function setSelectedSubscriptionPlan(planId: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SELECTED_SUBSCRIPTION_PLAN_KEY, planId)
}

export function consumeSelectedSubscriptionPlan(): string | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(SELECTED_SUBSCRIPTION_PLAN_KEY)
  sessionStorage.removeItem(SELECTED_SUBSCRIPTION_PLAN_KEY)
  return value || null
}

export function setPendingSubscriptionId(subscriptionId: string) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(PENDING_SUBSCRIPTION_ID_KEY, subscriptionId)
}

export function getPendingSubscriptionId(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(PENDING_SUBSCRIPTION_ID_KEY)
}

export function clearPendingSubscriptionId() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(PENDING_SUBSCRIPTION_ID_KEY)
}

export async function resolvePostAuthRoute(): Promise<"advertise" | "subscription" | "home"> {
  const redirect = consumePostAuthRedirect()
  if (!redirect) return "home"
  if (redirect === "subscription") return "subscription"

  try {
    const token = localStorage.getItem("ciar_token")
    const res = await fetch("/api/subscriptions/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return "subscription"
    const data = await res.json()
    return data.canPost ? "advertise" : "subscription"
  } catch {
    return "subscription"
  }
}
