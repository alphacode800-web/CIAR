export const POST_AUTH_REDIRECT_KEY = "ciar_post_auth_redirect"

export type PostAuthRedirect = "advertise"

export function setPostAuthRedirect(target: PostAuthRedirect) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, target)
}

export function consumePostAuthRedirect(): PostAuthRedirect | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY)
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY)
  return value === "advertise" ? value : null
}
