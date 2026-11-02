import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Icon, type IconName } from './Icon.tsx'
import { Avatar } from './ui.tsx'
import { useTheme, siteUrl, THEMES, type Theme } from '../lib/theme.tsx'
import { SCHOOL } from '../data/school.ts'

interface NavEntry { label: string; to: string }
interface NavGroup { label: string; icon: IconName; to?: string; items?: NavEntry[] }

export const NAV: { section: string; groups: NavGroup[] }[] = [
  {
    section: 'Utama',
    groups: [
      { label: 'Overview', icon: 'overview', to: '/' },
      { label: 'Siswa', icon: 'users', items: [{ label: 'Daftar siswa', to: '/siswa' }, { label: 'Tambah siswa', to: '/siswa/baru' }, { label: 'Impor CSV', to: '/siswa/impor' }] },
      { label: 'Tes penempatan', icon: 'test', to: '/tes-penempatan' },
      { label: 'Trial class', icon: 'trial', to: '/trial' },
      { label: 'Pengajar', icon: 'teacher', items: [{ label: 'Daftar pengajar', to: '/pengajar' }, { label: 'Honor & absensi', to: '/pengajar/honor' }] },
    ],
  },
  {
    section: 'Akademik',
    groups: [
      { label: 'Kelas & jadwal', icon: 'calendar', items: [{ label: 'Kalender mingguan', to: '/jadwal' }, { label: 'Daftar kelas', to: '/kelas' }, { label: 'Ruang & cabang', to: '/ruang' }, { label: 'Kelas online', to: '/kelas-online' }] },
      { label: 'Absensi', icon: 'attendance', items: [{ label: 'Input absensi', to: '/absensi' }, { label: 'Rekap per siswa', to: '/absensi/rekap-siswa' }, { label: 'Rekap per kelas', to: '/absensi/rekap-kelas' }] },
      { label: 'Akademik', icon: 'academic', items: [{ label: 'Kurikulum', to: '/akademik/kurikulum' }, { label: 'Bank soal', to: '/akademik/bank-soal' }, { label: 'Mock test', to: '/akademik/mock-test' }, { label: 'Input nilai', to: '/akademik/nilai' }, { label: 'Rubrik penilaian', to: '/akademik/rubrik' }, { label: 'Kenaikan level', to: '/akademik/kenaikan-level' }] },
    ],
  },
  {
    section: 'Bisnis',
    groups: [
      { label: 'Keuangan', icon: 'wallet', items: [{ label: 'Tagihan', to: '/keuangan/tagihan' }, { label: 'Invoice', to: '/keuangan/invoice' }, { label: 'Pembayaran', to: '/keuangan/pembayaran' }, { label: 'Tunggakan', to: '/keuangan/tunggakan' }, { label: 'Diskon & promo', to: '/keuangan/promo' }, { label: 'Pendapatan', to: '/keuangan/laporan' }] },
      { label: 'Komunikasi', icon: 'chat', items: [{ label: 'Pengumuman', to: '/komunikasi/pengumuman' }, { label: 'Template WhatsApp', to: '/komunikasi/template' }, { label: 'Inbox', to: '/komunikasi/inbox' }] },
      { label: 'Laporan', icon: 'chart', items: [{ label: 'Pendapatan', to: '/laporan/pendapatan' }, { label: 'Retensi siswa', to: '/laporan/retensi' }, { label: 'Kenaikan level', to: '/laporan/kenaikan-level' }, { label: 'Skor ujian', to: '/laporan/skor-ujian' }, { label: 'Kinerja pengajar', to: '/laporan/kinerja-pengajar' }, { label: 'Konversi trial', to: '/laporan/konversi-trial' }] },
    ],
  },
  {
    section: 'Sistem',
    groups: [
      { label: 'Pengaturan', icon: 'settings', items: [{ label: 'Profil lembaga', to: '/pengaturan' }, { label: 'Bahasa & level', to: '/pengaturan/bahasa' }, { label: 'Cabang', to: '/pengaturan/cabang' }, { label: 'Tim & peran', to: '/pengaturan/tim' }, { label: 'Paket harga', to: '/pengaturan/paket' }, { label: 'Notifikasi', to: '/pengaturan/notifikasi' }, { label: 'Tagihan langganan', to: '/pengaturan/tagihan' }] },
      { label: 'UI kit', icon: 'layers', items: [{ label: 'Tombol', to: '/ui/tombol' }, { label: 'Form', to: '/ui/form' }, { label: 'Tabel', to: '/ui/tabel' }, { label: 'Chart', to: '/ui/chart' }, { label: 'Overlay', to: '/ui/overlay' }, { label: 'State', to: '/ui/state' }] },
      { label: 'Semua layar', icon: 'grid', to: '/screens' },
    ],
  },
]

const groupMatches = (group: NavGroup, path: string) =>
  group.items?.some((item) => path === item.to || (item.to !== '/' && path.startsWith(item.to + '/')))

function SidebarGroup({ group, path }: { group: NavGroup; path: string }) {
  const active = groupMatches(group, path) ?? false
  const [open, setOpen] = useState(active)
  useEffect(() => { if (active) setOpen(true) }, [active])
  if (group.to) {
    return (
      <NavLink to={group.to} end className="nav-item">
        <Icon name={group.icon} />
        {group.label}
      </NavLink>
    )
  }
  const id = `nav-${group.label.toLowerCase().replace(/[^a-z]+/g, '-')}`
  // Highlight the most specific item only (so /siswa/baru does not also mark /siswa).
  const best = group.items?.filter((i) => path === i.to || path.startsWith(i.to + '/')).sort((a, b) => b.to.length - a.to.length)[0]
  return (
    <div className="nav-group">
      <button type="button" className="nav-group-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <Icon name={group.icon} />
        {group.label}
        <Icon name="down" size={14} className="chev" />
      </button>
      {open && (
        <ul className="nav-sub" id={id} role="list">
          {group.items?.map((item) => (
            <li key={item.to}>
              <Link to={item.to} aria-current={best?.to === item.to ? 'page' : undefined}>{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const icon: Record<Theme, IconName> = { light: 'sun', dark: 'moon', batik: 'batik' }
  const label: Record<Theme, string> = { light: 'Tema terang', dark: 'Tema gelap', batik: 'Tema batik' }
  return (
    <div className="theme-switch" role="group" aria-label="Tema tampilan">
      {THEMES.map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)} title={label[t]} aria-label={label[t]}>
          <Icon name={icon[t]} size={16} />
        </button>
      ))}
    </div>
  )
}

export function Logo({ size = 34, inverted }: { size?: number; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} aria-hidden="true">
      <rect width="36" height="36" rx="10" fill={inverted ? 'var(--on-accent)' : 'var(--accent)'} />
      <path d="M11 27V9h8.2c4 0 6.8 2.5 6.8 6.1 0 3.7-2.8 6.1-6.8 6.1H15.5" fill="none" stroke={inverted ? 'var(--accent)' : 'var(--on-accent)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26.5" cy="26" r="3" fill="var(--pop)" />
    </svg>
  )
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [navOpen, setNavOpen] = useState(false)
  const [query, setQuery] = useState('')
  useEffect(() => { setNavOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  return (
    <div className={`shell${navOpen ? ' nav-open' : ''}`}>
      <a className="skip-link" href="#content">Langsung ke konten</a>
      <aside className="sidebar" aria-label="Navigasi samping">
        <Link to="/" className="sidebar-brand">
          <Logo />
          <span><b>{SCHOOL.short}</b><small>LinguaDash · Admin</small></span>
        </Link>
        <div className="branch-switch">
          <label className="sr-only" htmlFor="branch-switch">Cabang aktif</label>
          <select id="branch-switch" className="select" defaultValue="all">
            <option value="all">Semua cabang</option>
            <option value="bdg">Bandung – Dago</option>
            <option value="jkt">Jakarta – Tebet</option>
            <option value="online">Online</option>
          </select>
        </div>
        <nav className="sidebar-nav" aria-label="Menu utama">
          {NAV.map((section) => (
            <div key={section.section}>
              <div className="nav-label">{section.section}</div>
              {section.groups.map((g) => <SidebarGroup key={g.label} group={g} path={location.pathname} />)}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <a className="btn btn-ghost btn-sm" href={siteUrl('/', theme)}>
            <Icon name="globe" size={16} /> Lihat situs LinguaDrop
          </a>
          <Link className="btn btn-ghost btn-sm" to="/login">
            <Icon name="logout" size={16} /> Keluar
          </Link>
        </div>
      </aside>
      <button type="button" className="scrim" aria-label="Tutup menu" onClick={() => setNavOpen(false)} tabIndex={-1} />
      <div className="main">
        <header className="topbar">
          <button type="button" className="btn btn-ghost btn-icon menu-btn" aria-label="Buka menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
            <Icon name="menu" />
          </button>
          <form className="topbar-search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/siswa?q=${encodeURIComponent(query)}`) }}>
            <Icon name="search" size={16} />
            <label htmlFor="global-search" className="sr-only">Cari siswa</label>
            <input id="global-search" className="input" type="search" placeholder="Cari siswa, ID, atau nomor WA…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>
          <div className="topbar-actions">
            <ThemeSwitch />
            <Link to="/komunikasi/inbox" className="btn btn-ghost btn-icon icon-btn-badge" aria-label="Inbox, 4 pesan belum dibaca">
              <Icon name="bell" />
              <span className="count" aria-hidden="true">4</span>
            </Link>
            <Link to="/pengaturan/tim" className="user-chip">
              <Avatar name="Rina Kartika" size={30} />
              <span>Rina Kartika</span>
            </Link>
          </div>
        </header>
        <main id="content" className="content" tabIndex={-1}>
          <Outlet />
        </main>
        <p className="demo-note">Demo LinguaDash: semua data fiktif dan tersimpan di browser ini saja. Tidak ada server, pembayaran, atau login sungguhan.</p>
      </div>
    </div>
  )
}

export function AuthLayout({ children, title, wide }: { children: ReactNode; title?: ReactNode; wide?: boolean }) {
  const { theme } = useTheme()
  return (
    <div className="auth">
      <aside className="auth-aside" aria-label="Tentang LinguaDash">
        <div className="row"><Logo size={40} inverted /><b>{SCHOOL.short}</b></div>
        <div className="stack">
          <div className="greet" aria-label="Sapaan dalam enam bahasa">
            <span lang="en">Hello</span>
            <span lang="ja">こんにちは</span>
            <span lang="ko">안녕하세요</span>
            <span lang="zh-Hans">你好</span>
            <span lang="ar" dir="rtl">مرحبا</span>
            <span lang="de">Hallo</span>
          </div>
          <h2>{title ?? 'Satu dashboard untuk siswa, kelas, nilai, dan tagihan.'}</h2>
          <p>Kelola 6 bahasa, 2 cabang, kelas online, dan privat dari satu tempat. Data di demo ini fiktif.</p>
        </div>
        <p className="small"><a href={siteUrl('/', theme)}>← Kembali ke situs</a></p>
      </aside>
      <main className="auth-main" id="content">
        <div className={`auth-top${wide ? ' auth-wide' : ''}`}>
          <a href={siteUrl('/', theme)} className="row small">
            <Icon name="arrowLeft" size={16} /> Kembali ke situs
          </a>
          <ThemeSwitch />
        </div>
        <div className={`auth-card${wide ? ' auth-wide' : ''}`}>{children}</div>
      </main>
    </div>
  )
}
