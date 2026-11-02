import {
  createContext, useCallback, useContext, useEffect, useId, useRef, useState,
  type ReactNode, type KeyboardEvent,
} from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from './Icon.tsx'
import { HTML_LANG, langByCode, type LangCode } from '../data/school.ts'
import { initials } from '../lib/format.ts'

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
export { cx }

// ---------- Page header ----------
export interface Crumb { label: string; to?: string }
export function useTitle(title: string) {
  useEffect(() => { document.title = `${title} · LinguaDash` }, [title])
}

export function PageHeader({ title, description, actions, crumbs, children }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; crumbs?: Crumb[]; children?: ReactNode }) {
  useEffect(() => { if (typeof title === 'string') document.title = `${title} · LinguaDash` }, [title])
  return (
    <header className="page-header">
      {crumbs && crumbs.length > 0 && (
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            {crumbs.map((c, i) => (
              <li key={i}>{c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
            ))}
          </ol>
        </nav>
      )}
      <div className="page-header-row">
        <div className="page-title">
          <h1>{title}</h1>
          {description && <p className="muted">{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
      {children}
    </header>
  )
}

// ---------- Card ----------
export function Card({ title, description, actions, children, className, flush, id }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string; flush?: boolean; id?: string }) {
  const headingId = useId()
  return (
    <section className={cx('card', 'panel', flush && 'panel-flush', className)} aria-labelledby={title ? headingId : undefined} id={id}>
      {(title || actions) && (
        <div className="panel-head">
          <div>
            {title && <h2 id={headingId} className="panel-title">{title}</h2>}
            {description && <p className="panel-desc">{description}</p>}
          </div>
          {actions && <div className="panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

// ---------- Stat tile ----------
export function Stat({ label, value, delta, good, hint, icon, children, to }: { label: string; value: ReactNode; delta?: string; good?: boolean; hint?: ReactNode; icon?: IconName; children?: ReactNode; to?: string }) {
  const body = (
    <>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon"><Icon name={icon} size={16} /></span>}
      </div>
      <div className="stat-value">{value}</div>
      {(delta || hint) && (
        <div className="stat-foot">
          {delta && (
            <span className={cx('delta', good ? 'delta-good' : 'delta-bad')}>
              <Icon name={good ? 'trendUp' : 'trendDown'} size={14} />
              {delta}
            </span>
          )}
          {hint && <span className="muted">{hint}</span>}
        </div>
      )}
      {children}
    </>
  )
  return to ? <Link className="card stat-tile stat-link" to={to}>{body}</Link> : <div className="card stat-tile">{body}</div>
}

// ---------- Badges ----------
export type Tone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad'
export function Badge({ tone = 'neutral', children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cx('badge', tone !== 'neutral' && `badge-${tone}`)}>
      {dot && <span className="dot" aria-hidden="true" />}
      {children}
    </span>
  )
}

const STATUS: Record<string, [string, Tone]> = {
  aktif: ['Aktif', 'good'], cuti: ['Cuti', 'warn'], lulus: ['Lulus', 'accent'], berhenti: ['Berhenti', 'neutral'],
  lunas: ['Lunas', 'good'], 'belum-bayar': ['Belum bayar', 'warn'], 'jatuh-tempo': ['Jatuh tempo', 'bad'], sebagian: ['Dibayar sebagian', 'warn'], draf: ['Draf', 'neutral'],
  terjadwal: ['Terjadwal', 'accent'], hadir: ['Hadir', 'good'], mendaftar: ['Mendaftar', 'good'], 'tidak-lanjut': ['Tidak lanjut', 'neutral'], 'tidak-hadir': ['Tidak hadir', 'bad'],
  izin: ['Izin', 'warn'], sakit: ['Sakit', 'warn'], alpa: ['Alpa', 'bad'],
  menunggu: ['Menunggu kelas', 'warn'], ditetapkan: ['Kelas ditetapkan', 'good'],
  selesai: ['Selesai', 'good'], berjalan: ['Berjalan', 'accent'], mengulang: ['Mengulang', 'warn'],
  native: ['Native', 'accent'], lokal: ['Lokal', 'neutral'],
}
export function StatusBadge({ status }: { status: string }) {
  const [label, tone] = STATUS[status] ?? [status, 'neutral' as Tone]
  return <Badge tone={tone} dot>{label}</Badge>
}

export function LangTag({ code, level, short }: { code: LangCode; level?: string; short?: boolean }) {
  const lang = langByCode(code)
  return (
    <span className={cx('lang-tag', `lang-${code}`)}>
      <span className="lang-dot" aria-hidden="true" />
      {short ? lang.name : `${lang.name}`}
      {level && <b>{level}</b>}
    </span>
  )
}

/** Foreign-language text with the right lang (and dir for Arabic) for screen readers and fonts. */
export function Foreign({ lang, children, block }: { lang: LangCode; children: ReactNode; block?: boolean }) {
  const Tag = block ? 'p' : 'span'
  return <Tag lang={HTML_LANG[lang]} dir={lang === 'ar' ? 'rtl' : undefined} className="foreign-text">{children}</Tag>
}

/** "あいさつ (Salam)": the foreign part gets its lang attribute, the Indonesian gloss stays Indonesian. */
export function Topic({ lang, text }: { lang: LangCode; text: string }) {
  if (lang === 'en' || lang === 'de') return <Foreign lang={lang}>{text}</Foreign>
  const m = text.match(/^(.*?)\s*\((.*)\)$/)
  if (!m) return <Foreign lang={lang}>{text}</Foreign>
  return <><Foreign lang={lang}>{m[1]}</Foreign> <span className="muted">({m[2]})</span></>
}

export function Avatar({ name, lang, size = 36 }: { name: string; lang?: LangCode; size?: number }) {
  return (
    <span className={cx('avatar', lang && `lang-${lang}`)} style={{ ['--size' as string]: `${size}px` }} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function Person({ name, sub, lang, to }: { name: string; sub?: ReactNode; lang?: LangCode; to?: string }) {
  return (
    <span className="person-cell">
      <Avatar name={name} lang={lang} size={32} />
      <span>
        {to ? <Link to={to} className="strong-link">{name}</Link> : <b>{name}</b>}
        {sub && <small className="muted">{sub}</small>}
      </span>
    </span>
  )
}

// ---------- Form field ----------
export function Field({ id, label, hint, error, required, children, className }: { id: string; label: ReactNode; hint?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cx('field', className)}>
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

// ---------- Tabs ----------
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: ReactNode; count?: number }[]; value: T; onChange: (id: T) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, index: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + tabs.length) % tabs.length
    refs.current[next]?.focus()
    onChange(tabs[next].id)
  }
  return (
    <div className="tabbar" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el }}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
          {t.count !== undefined && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ---------- Modal / drawer (native <dialog>: focus trap and Escape for free) ----------
export function Modal({ open, onClose, title, children, footer, size, drawer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'lg'; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={cx('modal', size && `modal-${size}`, drawer && 'drawer')}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      {open && (
        <div className="modal-box">
          <div className="modal-head">
            <h2 id={headingId}>{title}</h2>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Tutup">
              <Icon name="x" />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

// ---------- Toasts ----------
interface ToastItem { id: number; message: string; tone: Tone }
const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const show = useCallback((message: string, tone: Tone = 'good') => {
    const id = Date.now() + Math.random()
    setItems((list) => [...list, { id, message, tone }])
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200)
  }, [])
  return (
    <ToastContext value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx('toast', `toast-${t.tone}`)}>
            <Icon name={t.tone === 'bad' ? 'alert' : t.tone === 'good' ? 'check' : 'info'} size={16} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
export const useToast = () => useContext(ToastContext)

// ---------- States ----------
export function EmptyState({ icon = 'search', title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  )
}
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <span key={i} style={{ width: `${90 - i * 14}%` }} />)}
    </div>
  )
}

export function Progress({ value, max = 100, label, tone }: { value: number; max?: number; label: string; tone?: Tone }) {
  const pctValue = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={cx('progress', tone && `progress-${tone}`)} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: `${pctValue}%` }} />
    </div>
  )
}

export function Pagination({ page, pages, onPage, from, to, total }: { page: number; pages: number; onPage: (p: number) => void; from: number; to: number; total: number }) {
  const numbers: (number | '…')[] = []
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) numbers.push(p)
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…')
  }
  return (
    <nav className="pagination" aria-label="Halaman tabel">
      <span className="muted">{total === 0 ? 'Tidak ada data' : `${from}–${to} dari ${total}`}</span>
      <div className="pagination-buttons">
        <button type="button" className="btn btn-sm btn-ghost btn-icon" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Halaman sebelumnya">
          <Icon name="left" />
        </button>
        {numbers.map((n, i) =>
          n === '…' ? <span key={`gap-${i}`} className="muted page-gap">…</span> : (
            <button key={n} type="button" className={cx('btn btn-sm', n === page ? 'btn-primary' : 'btn-ghost')} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)} aria-label={`Halaman ${n}`}>
              {n}
            </button>
          ),
        )}
        <button type="button" className="btn btn-sm btn-ghost btn-icon" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Halaman berikutnya">
          <Icon name="right" />
        </button>
      </div>
    </nav>
  )
}

export function Dl({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="dl">
      {items.map(([k, v], i) => (
        <div key={i}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Toggle({ id, checked, onChange, label, description }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id} className="toggle-label">{label}</label>
        {description && <p className="muted small" id={`${id}-desc`}>{description}</p>}
      </div>
      <input id={id} type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={description ? `${id}-desc` : undefined} />
    </div>
  )
}
