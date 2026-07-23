/** Public UI: show platforms in reverse catalog order (last module first). */
export function reversePlatformDisplayOrder<T>(items: readonly T[]): T[] {
  return [...items].reverse()
}

export function comparePlatformOrderDesc(a: { order?: number }, b: { order?: number }): number {
  return (b.order ?? 0) - (a.order ?? 0)
}
