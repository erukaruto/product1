import { useSearchParams } from 'react-router'

/**
 * Several query values at once. setSearchParams calls in the same event do not compose
 * (each one starts from the same old URL), so change related filters in one call.
 */
export function useSetParams(defaults: Record<string, string> = {}) {
  const [, setParams] = useSearchParams()
  return (changes: Record<string, string>) =>
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value && value !== (defaults[key] ?? '')) out.set(key, value)
        else out.delete(key)
      }
      return out
    }, { replace: true })
}

/** A string kept in the URL query (?bahasa=ja), so filtered views can be linked and reloaded. */
export function useParam(key: string, fallback = ''): [string, (value: string) => void] {
  const [params] = useSearchParams()
  const setMany = useSetParams({ [key]: fallback })
  return [params.get(key) ?? fallback, (value: string) => setMany({ [key]: value })]
}
