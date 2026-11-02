import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import Icon, { type IconName } from './Icon.tsx'
import { initials } from '../lib/format.ts'

/* Layout */

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  back?: ReactNode
}

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {back}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}

interface CardProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  flush?: boolean
}

export function Card({ title, description, actions, children, className = '', flush = false }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={flush ? 'card-flush' : 'card-body'}>{children}</div>
    </section>
  )
}

/* Numbers */

interface DeltaProps {
  value: number
  suffix?: string
  /** For metrics where going down is good, such as churn. */
  invert?: boolean
  digits?: number
}

export function Delta({ value, suffix = '%', invert = false, digits = 1 }: DeltaProps) {
  const good = invert ? value <= 0 : value >= 0
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return (
    <span className={`delta ${good ? 'up' : 'down'}`}>
      {sign}
      {Math.abs(value).toFixed(digits)}
      {suffix}
    </span>
  )
}

interface StatCardProps {
  label: ReactNode
  value: ReactNode
  delta?: ReactNode
  note?: ReactNode
}

export function StatCard({ label, value, delta, note }: StatCardProps) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {(delta || note) && (
        <span className="stat-foot">
          {delta}
          {note && <span className="muted">{note}</span>}
        </span>
      )}
    </div>
  )
}

/* Badges and avatars */

export type Tone = 'good' | 'warn' | 'bad' | 'accent' | 'neutral'

const STATUS_TONE: Record<string, Tone> = {
  active: 'good',
  paid: 'good',
  succeeded: 'good',
  won: 'good',
  trial: 'accent',
  trialing: 'accent',
  open: 'accent',
  under_review: 'accent',
  draft: 'neutral',
  past_due: 'warn',
  needs_response: 'warn',
  overdue: 'bad',
  failed: 'bad',
  lost: 'bad',
  canceled: 'neutral',
  refunded: 'neutral',
  expired: 'neutral',
}

export function StatusBadge({ status, label, tone }: { status?: string; label: ReactNode; tone?: Tone }) {
  const resolved = tone ?? (status ? STATUS_TONE[status] : undefined) ?? 'neutral'
  return <span className={`status status-${resolved}`}>{label}</span>
}

export function Avatar({ name, size = 32, tone }: { name: string; size?: number; tone?: 'accent' | 'gold' }) {
  const code = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const variant = tone ?? (code % 2 === 0 ? 'accent' : 'gold')
  return (
    <span className={`avatar avatar-${variant}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/* States */

interface EmptyStateProps {
  title: ReactNode
  children?: ReactNode
  icon?: IconName
  action?: ReactNode
}

export function EmptyState({ title, children, icon = 'search', action }: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} />
      </span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function Skeleton({ width = '100%', height = 14, radius = 6 }: { width?: number | string; height?: number; radius?: number }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />
}

export function Progress({ value, max = 100, label, tone = 'accent' }: { value: number; max?: number; label: string; tone?: 'accent' | 'good' | 'warn' | 'bad' }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`meter meter-${tone}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i style={{ width: `${percent}%` }} />
    </div>
  )
}

/* Controls */

interface TabsProps<T extends string> {
  tabs: Array<{ id: T; label: ReactNode; count?: number }>
  value: T
  onChange: (id: T) => void
  label: string
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={value === tab.id} onClick={() => onChange(tab.id)}>
          {tab.label}
          {tab.count != null && <span className="count">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: Array<{ id: T; label: ReactNode }>; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  labelledBy?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, labelledBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className="switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
        return (
          <li key={step} className={`step-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="step-dot">{state === 'done' ? <Icon name="check" size={14} /> : index + 1}</span>
            <span className="step-label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function Pagination({ page, pageCount, from, to, total, onPage }: { page: number; pageCount: number; from: number; to: number; total: number; onPage: (page: number) => void }) {
  return (
    <div className="pagination">
      <span className="muted">{total === 0 ? 'No results' : `${from}-${to} of ${total}`}</span>
      <div className="pagination-buttons">
        <button type="button" className="icon-button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <Icon name="chevronLeft" />
          <span className="sr-only">Previous page</span>
        </button>
        <span className="muted">
          Page {page} of {pageCount}
        </span>
        <button type="button" className="icon-button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          <Icon name="chevronRight" />
          <span className="sr-only">Next page</span>
        </button>
      </div>
    </div>
  )
}

/* Dropdown menu */

export interface MenuItem {
  label: string
  icon?: IconName
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

interface DropdownProps {
  label: string
  items: MenuItem[]
  trigger?: ReactNode
  align?: 'start' | 'end'
  buttonClassName?: string
}

/**
 * A menu button. The menu renders in a portal with fixed positioning, so it is never clipped by a
 * scrolling table or card. Arrow keys move between items; Escape closes and returns focus to the button.
 */
export function Dropdown({ label, items, trigger, align = 'end', buttonClassName = 'icon-button' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  // Places the menu under the button, or above it when there is no room below. Re-run on scroll and resize.
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const estimatedHeight = items.length * 38 + 14
    const vertical = rect.bottom + 6 + estimatedHeight > window.innerHeight ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }
    const horizontal = align === 'end' ? { right: window.innerWidth - rect.right } : { left: rect.left }
    setPosition({ ...vertical, ...horizontal })
  }, [align, items.length])

  function toggle() {
    if (!open) place()
    setOpen((value) => !value)
  }

  useEffect(() => {
    if (!open) return undefined
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true })
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  function onMenuKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const enabled = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])]
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      enabled[(index + 1) % enabled.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      enabled[(index - 1 + enabled.length) % enabled.length]?.focus()
    } else if (event.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      >
        {trigger ?? <Icon name="more" />}
        <span className="sr-only">{label}</span>
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} id={menuId} className="menu" style={position} role="menu" aria-label={label} onKeyDown={onMenuKey}>
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={item.danger ? 'is-danger' : undefined}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  buttonRef.current?.focus()
                  item.onSelect()
                }}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}

/* Modal and drawer */

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Slide-in panel from the right instead of a centered dialog. */
  drawer?: boolean
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Dialog rendered in a portal. Traps Tab inside, closes on Escape or backdrop click, and returns focus when closed. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', drawer = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const returnFocusTo = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusables = () => [...(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    // Focus [data-autofocus] if present, else the first field or button in the body, else the dialog itself.
    const initial =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel?.querySelector<HTMLElement>('.modal-body input, .modal-body select, .modal-body textarea, .modal-body button, .modal-body a[href]') ??
      panel
    initial?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
      } else if (event.key === 'Tab') {
        const items = focusables()
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
      returnFocusTo?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className={`modal-root${drawer ? ' is-drawer' : ''}`}>
      <div className="modal-scrim" onClick={() => onCloseRef.current()} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button type="button" className="icon-button" onClick={() => onCloseRef.current()}>
            <Icon name="close" />
            <span className="sr-only">Close</span>
          </button>
        </header>
        {children && <div className="modal-body">{children}</div>}
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  )
}

/* Toasts */

export type ToastTone = 'good' | 'bad' | 'info'

interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: number
  description?: string
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {})

const TOAST_ICON: Record<ToastTone, IconName> = { good: 'checkCircle', bad: 'xCircle', info: 'info' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), [])

  const push = useCallback(
    ({ title, description, tone = 'good' }: ToastInput) => {
      const id = nextId.current++
      setItems((current) => [...current.slice(-3), { id, title, description, tone }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`toast toast-${item.tone}`}>
            <Icon name={TOAST_ICON[item.tone]} size={18} />
            <div>
              <strong>{item.title}</strong>
              {item.description && <span>{item.description}</span>}
            </div>
            <button type="button" className="toast-close" onClick={() => dismiss(item.id)}>
              <Icon name="close" size={16} />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Shows a short message in the corner: toast({ title: 'Saved' }). */
export function useToast(): (toast: ToastInput) => void {
  return useContext(ToastContext)
}

/* Small helpers */

export function KeyValue({ items }: { items: Array<{ label: ReactNode; value: ReactNode }> }) {
  return (
    <dl className="details">
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Legend({ items }: { items: Array<{ label: string; className: string }> }) {
  return (
    <div className="legend">
      {items.map((item) => (
        <span key={item.label}>
          <i className={`swatch ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  )
}
