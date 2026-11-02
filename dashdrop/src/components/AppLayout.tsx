import { Suspense, useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Icon, { type IconName } from './Icon.tsx'
import Logo, { LogoMark } from './Logo.tsx'
import ThemeSwitch from './ThemeSwitch.tsx'
import { Avatar, Skeleton } from './ui.tsx'
import { activity } from '../data/activity.ts'
import { NAV, NAV_FOOTER, type NavGroup } from '../nav.ts'
import { useDismiss } from '../lib/hooks.ts'
import type { ActivityType, ActivityItem } from '../types.ts'

const ACTIVITY_ICON: Record<ActivityType, [IconName, string]> = {
  payment_failed: ['card', 'bad'],
  inactive: ['warning', 'warn'],
  upgrade: ['trendUp', 'good'],
  canceled: ['close', 'bad'],
  new: ['userPlus', 'accent'],
}

export function ActivityIcon({ type }: { type: ActivityType }) {
  const [icon, tone] = ACTIVITY_ICON[type]
  return (
    <span className={`activity-icon tone-${tone}`}>
      <Icon name={icon} size={16} />
    </span>
  )
}

export function ActivityList({ items, compact = false, onNavigate }: { items: ActivityItem[]; compact?: boolean; onNavigate?: () => void }) {
  return (
    <ul className={`activity${compact ? ' compact' : ''}`}>
      {items.map((item) => (
        <li key={item.id}>
          <ActivityIcon type={item.type} />
          <div>
            <Link to={`/customers/${item.customerId}`} onClick={onNavigate}>
              {item.title}
            </Link>
            <small>{item.detail}</small>
          </div>
          <time>{item.time}</time>
        </li>
      ))}
    </ul>
  )
}

function SidebarGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const containsActive = group.items.some((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))
  const [open, setOpen] = useState(!group.collapsible || containsActive)

  useEffect(() => {
    if (containsActive) setOpen(true)
  }, [containsActive])

  const links = group.items.map((item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </NavLink>
  ))

  if (!group.label) return <div className="nav-group">{links}</div>

  return (
    <div className="nav-group">
      {group.collapsible ? (
        <button type="button" className="nav-label nav-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {group.label}
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={14} />
        </button>
      ) : (
        <span className="nav-label">{group.label}</span>
      )}
      {open && links}
    </div>
  )
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Sidebar">
      <div className="sidebar-head">
        <Link to="/" aria-label="Beacon overview">
          <Logo />
        </Link>
        <button type="button" className="icon-button sidebar-close" onClick={onClose}>
          <Icon name="close" />
          <span className="sr-only">Close menu</span>
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map((group) => (
          <SidebarGroup key={group.id} group={group} pathname={pathname} />
        ))}
      </nav>
      <div className="sidebar-foot">
        {NAV_FOOTER.map((item) => (
          <NavLink key={item.to} to={item.to} className="nav-link">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <Link className="nav-link" to="/login">
          <Icon name="logout" />
          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  )
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useDismiss<HTMLDivElement>(open, close)

  return (
    <div className="popover-wrap" ref={ref}>
      <button type="button" className="icon-button has-dot" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((value) => !value)}>
        <Icon name="bell" />
        <span className="sr-only">Notifications</span>
      </button>
      {open && (
        <div className="popover" role="dialog" aria-label="Notifications">
          <header>
            <strong>Notifications</strong>
            <span className="muted">{activity.length} new</span>
          </header>
          <ActivityList items={activity.slice(0, 4)} compact onNavigate={close} />
        </div>
      )}
    </div>
  )
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate()

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')?.toString().trim()
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <header className="topbar">
      <button type="button" className="icon-button menu-toggle" onClick={onMenu}>
        <Icon name="menu" />
        <span className="sr-only">Open menu</span>
      </button>
      <Link to="/" className="topbar-logo" aria-label="Beacon overview">
        <LogoMark size={28} />
      </Link>
      <form className="topbar-search" role="search" onSubmit={onSearch}>
        <Icon name="search" size={18} />
        <label className="sr-only" htmlFor="global-search">
          Search
        </label>
        <input id="global-search" name="q" type="search" placeholder="Search customers, invoices..." autoComplete="off" />
      </form>
      <div className="topbar-actions">
        <ThemeSwitch />
        <Notifications />
        <Link to="/settings" className="topbar-user" aria-label="Your profile">
          <Avatar name="Lena Marsh" size={32} tone="accent" />
        </Link>
      </div>
    </header>
  )
}

/** Shown while a page's code loads (pages are split into separate files). */
export function PageLoading() {
  return (
    <div className="page-loading" aria-busy="true" aria-label="Loading">
      <Skeleton width={220} height={28} />
      <Skeleton width={320} />
      <div className="stats">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={104} radius={14} />
        ))}
      </div>
      <Skeleton height={280} radius={14} />
    </div>
  )
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [menuOpen])

  return (
    <div className="app">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="app-main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main id="content" className="content">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
