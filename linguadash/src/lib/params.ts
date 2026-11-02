import { useSearchParams } from 'react-router'

/** A string kept in the URL query (?bahasa=ja), so filtered views can be linked and reloaded. */
export function useParam(key: string, fallback = ''): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams()
  const value = params.get(key) ?? fallback
  const set = (next: string) =>
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      if (next && next !== fallback) out.set(key, next)
      else out.delete(key)
      return out
    }, { replace: true })
  return [value, set]
}
