import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/** Sets document.title to "<title> | Beacon". */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} | Beacon` : 'Beacon'
  }, [title])
}

/** Returns [ref, width] and keeps width in sync with the element's size. */
export function useElementWidth<T extends HTMLElement = HTMLDivElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined
    setWidth(element.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/** Calls onOutside when a pointer press or Escape happens outside the element. */
export function useDismiss<T extends HTMLElement>(open: boolean, onOutside: () => void): RefObject<T | null> {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOutside()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOutside])
  return ref
}
