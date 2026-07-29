/** Public UI: show platforms in catalog order (first module first). */
export function reversePlatformDisplayOrder<T>(items: readonly T[]): T[] {
  return [...items].reverse()
}

export function comparePlatformOrderDesc(a: { order?: number }, b: { order?: number }): number {
  return (a.order ?? 0) - (b.order ?? 0)
}

export function sortPlatformModulesDesc<T extends { order?: number }>(items: readonly T[]): T[] {
  return [...items].sort(comparePlatformOrderDesc)
}
