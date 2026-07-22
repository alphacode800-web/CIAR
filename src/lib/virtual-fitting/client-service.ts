import type { TryOnApiResponse, TryOnRequest, TryOnResult } from "@/lib/virtual-fitting/types"

export const VIRTUAL_FITTING_TIMEOUT_MS = 90_000

export class VirtualFittingError extends Error {
  code: string

  constructor(message: string, code = "UNKNOWN") {
    super(message)
    this.name = "VirtualFittingError"
    this.code = code
  }
}

export async function submitVirtualTryOn(
  payload: TryOnRequest,
  options?: { signal?: AbortSignal }
): Promise<TryOnResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VIRTUAL_FITTING_TIMEOUT_MS)

  const onAbort = () => controller.abort()
  options?.signal?.addEventListener("abort", onAbort, { once: true })

  try {
    const res = await fetch("/api/fitting-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const json = (await res.json()) as { success?: boolean; data?: TryOnResult; message?: string; code?: string }

    if (!res.ok || !json.success || !json.data) {
      throw new VirtualFittingError(
        json.message || "Try-on request failed",
        json.code || "REQUEST_FAILED"
      )
    }

    return json.data
  } catch (error) {
    if (error instanceof VirtualFittingError) throw error
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new VirtualFittingError("Request timed out", "TIMEOUT")
    }
    throw new VirtualFittingError(
      error instanceof Error ? error.message : "Network error",
      "NETWORK"
    )
  } finally {
    clearTimeout(timeout)
    options?.signal?.removeEventListener("abort", onAbort)
  }
}

/** Local mock for UI testing without API */
export async function mockVirtualTryOn(userPreviewUrl: string): Promise<TryOnResult> {
  await new Promise((r) => setTimeout(r, 2800))
  return {
    resultImageUrl: userPreviewUrl,
    provider: "mock",
    processingMs: 2800,
    mock: true,
  }
}
