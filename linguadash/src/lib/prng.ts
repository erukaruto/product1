/** Deterministic pseudo-random numbers (mulberry32). Same seed, same demo data on every load. */
export function seeded(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)],
    chance: (p: number) => next() < p,
    weighted: <T,>(items: readonly (readonly [T, number])[]): T => {
      const total = items.reduce((sum, [, w]) => sum + w, 0)
      let roll = next() * total
      for (const [item, w] of items) {
        roll -= w
        if (roll <= 0) return item
      }
      return items[items.length - 1][0]
    },
  }
}
export type Rng = ReturnType<typeof seeded>
export const SEED = 20260417
