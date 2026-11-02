import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { Badge, Card, Dl, Field, Foreign, Modal, PageHeader, Person, Stat, StatusBadge, Toggle, useToast } from '../components/ui.tsx'
import { CLASSES, ROOMS } from '../data/demo.ts'
import { BRANCHES, DEMO_TODAY, LANGUAGES, PRIVATE_RATES, REGISTRATION_FEE, SCHOOL } from '../data/school.ts'
import { addDays, rupiah, tanggal } from '../lib/format.ts'
import { resetDemo } from '../lib/store.ts'

const TABS = [
  { to: '/pengaturan', label: 'Profil lembaga' }, { to: '/pengaturan/bahasa', label: 'Bahasa & level' }, { to: '/pengaturan/cabang', label: 'Cabang' },
  { to: '/pengaturan/tim', label: 'Tim & peran' }, { to: '/pengaturan/paket', label: 'Paket harga' }, { to: '/pengaturan/notifikasi', label: 'Notifikasi' }, { to: '/pengaturan/tagihan', label: 'Tagihan langganan' },
]

function SettingsShell({ title, description, children, actions }: { title: string; description: string; children: ReactNode; actions?: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <>
      <PageHeader title={title} description={description} crumbs={[{ label: 'Pengaturan', to: '/pengaturan' }, { label: title }]} actions={actions} />
      <nav className="subnav" aria-label="Bagian pengaturan">
        {TABS.map((t) => <Link key={t.to} to={t.to} aria-current={pathname === t.to ? 'page' : undefined}>{t.label}</Link>)}
      </nav>
      {children}
    </>
  )
}

function useSave(message: string) {
  const toast = useToast()
  return (e: FormEvent) => { e.preventDefault(); toast(message) }
}

export function SettingsProfile() {
  const save = useSave('Profil lembaga disimpan (demo).')
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  return (
    <SettingsShell title="Profil lembaga" description="Muncul di invoice, sertifikat, dan pesan WhatsApp.">
      <form className="grid grid-main" onSubmit={save}>
        <Card title="Identitas">
          <div className="form-grid">
            <Field id="sp-name" label="Nama lembaga" className="span-2"><input id="sp-name" className="input" defaultValue={SCHOOL.name} /></Field>
            <Field id="sp-short" label="Nama singkat"><input id="sp-short" className="input" defaultValue={SCHOOL.short} /></Field>
            <Field id="sp-year" label="Tahun berdiri"><input id="sp-year" className="input" type="number" defaultValue={SCHOOL.founded} /></Field>
            <Field id="sp-email" label="Email"><input id="sp-email" className="input" type="email" defaultValue={SCHOOL.email} /></Field>
            <Field id="sp-wa" label="WhatsApp admin"><input id="sp-wa" className="input" defaultValue="+62 800-0000-0000" /></Field>
            <Field id="sp-license" label="Nomor izin LKP" className="span-2"><input id="sp-license" className="input" defaultValue="000/LKP/2014" /></Field>
            <Field id="sp-sign" label="Penandatangan sertifikat"><input id="sp-sign" className="input" defaultValue="Rina Kartika" /></Field>
            <Field id="sp-signrole" label="Jabatan"><input id="sp-signrole" className="input" defaultValue="Direktur" /></Field>
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Simpan profil</button>
        </Card>
        <div className="stack">
          <Card title="Data demo" description="Siswa, invoice, absensi, dan nilai yang Anda buat tersimpan di browser ini.">
            <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}><Icon name="refresh" size={16} /> Reset data demo</button>
          </Card>
          <Card title="Zona waktu & format"><Dl items={[['Zona waktu', 'WIB (Asia/Jakarta)'], ['Mata uang', 'Rupiah, contoh Rp 1.250.000'], ['Tanggal', tanggal(DEMO_TODAY)]]} /></Card>
        </div>
      </form>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset data demo?" size="sm" footer={<><button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>Batal</button><button type="button" className="btn btn-danger" onClick={() => { resetDemo(); setConfirm(false); toast('Data demo kembali ke kondisi awal.', 'accent') }}>Ya, reset</button></>}>
        <p className="small">Semua siswa, invoice, pembayaran, absensi, nilai, dan perubahan status yang dibuat di browser ini akan dihapus. Data contoh bawaan tetap ada.</p>
      </Modal>
    </SettingsShell>
  )
}

export function SettingsLanguages() {
  const toast = useToast()
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(LANGUAGES.map((l) => [l.code, true])))
  return (
    <SettingsShell title="Bahasa & level" description="Level mengikuti CEFR, dengan jalur JLPT, TOPIK, dan HSK untuk Jepang, Korea, dan Mandarin.">
      <div className="grid grid-2">
        {LANGUAGES.map((l) => (
          <Card key={l.code} title={<span className="row">Bahasa {l.name} <Foreign lang={l.code}>{l.native}</Foreign></span>} description={`${l.track} · ${l.levels.length} level`} actions={<Toggle id={`lang-${l.code}`} label="Aktif" checked={on[l.code]} onChange={(v) => { setOn((o) => ({ ...o, [l.code]: v })); toast(`Bahasa ${l.name} ${v ? 'diaktifkan' : 'dinonaktifkan'} (demo).`, 'accent') }} />}>
            <div className="table-wrap">
              <table className="table table-compact">
                <caption className="sr-only">Level Bahasa {l.name}</caption>
                <thead><tr><th scope="col">Level</th><th scope="col">Nama</th><th scope="col">CEFR</th><th scope="col" className="num">Pertemuan</th></tr></thead>
                <tbody>{l.levels.map((lv) => <tr key={lv.code}><th scope="row">{lv.code}</th><td>{lv.name}</td><td>{lv.cefr}</td><td className="num">{lv.meetings}</td></tr>)}</tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </SettingsShell>
  )
}

export function SettingsBranches() {
  const save = useSave('Data cabang disimpan (demo).')
  return (
    <SettingsShell title="Cabang" description="Dua cabang offline dan kelas online." actions={<button type="button" className="btn"><Icon name="plus" size={16} /> Tambah cabang</button>}>
      <div className="grid grid-2">
        {BRANCHES.map((b) => (
          <Card key={b.id} title={b.name} description={`${ROOMS[b.id].length} ruang · ${CLASSES.filter((c) => c.branch === b.id).length} kelas berjalan`}>
            <form className="stack" onSubmit={save}>
              <Field id={`br-addr-${b.id}`} label="Alamat"><textarea id={`br-addr-${b.id}`} className="textarea" rows={2} defaultValue={b.address} /></Field>
              <Field id={`br-hours-${b.id}`} label="Jam buka"><input id={`br-hours-${b.id}`} className="input" defaultValue={b.hours} /></Field>
              <button type="submit" className="btn" style={{ justifySelf: 'start' }}>Simpan</button>
            </form>
          </Card>
        ))}
        <Card title="Online" description={`${CLASSES.filter((c) => c.branch === 'online').length} kelas`}>
          <Dl items={[['Platform', 'Zoom (akun lembaga)'], ['Domain link', 'meet.polyglotnusantara.example'], ['Rekaman', 'Disimpan 14 hari']]} />
        </Card>
      </div>
    </SettingsShell>
  )
}

const TEAM = [
  { name: 'Rina Kartika', email: 'rina@polyglotnusantara.example', role: 'Admin', branch: 'Semua cabang', last: 'Aktif sekarang' },
  { name: 'Hendro Wicaksono', email: 'hendro@polyglotnusantara.example', role: 'Admin', branch: 'Semua cabang', last: '2 jam lalu' },
  { name: 'Maya Sari Lubis', email: 'maya@polyglotnusantara.example', role: 'Staf', branch: 'Jakarta – Tebet', last: 'Kemarin' },
  { name: 'Agus Firmansyah', email: 'agus@polyglotnusantara.example', role: 'Staf', branch: 'Bandung – Dago', last: 'Hari ini' },
  { name: 'Putri Ramadhan', email: 'putri@polyglotnusantara.example', role: 'Staf', branch: 'Bandung – Dago', last: '3 hari lalu' },
  { name: 'Haruka Tanaka', email: 'haruka@polyglotnusantara.example', role: 'Pengajar', branch: 'Bandung – Dago', last: 'Hari ini' },
  { name: 'Rizky Pratama', email: 'rizky@polyglotnusantara.example', role: 'Pengajar', branch: 'Bandung – Dago', last: 'Kemarin' },
  { name: 'Li Mei', email: 'li@polyglotnusantara.example', role: 'Pengajar', branch: 'Jakarta – Tebet', last: 'Hari ini' },
]
const PERMS: [string, boolean, boolean, boolean][] = [
  ['Lihat overview', true, true, false], ['Kelola siswa', true, true, false], ['Input absensi & nilai', true, true, true],
  ['Lihat kelas sendiri', true, true, true], ['Buat invoice & catat pembayaran', true, true, false], ['Laporan keuangan', true, false, false],
  ['Honor pengajar', true, false, false], ['Pengaturan & tim', true, false, false],
]

export function SettingsTeam() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const invite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { (e.currentTarget.elements.namedItem('email') as HTMLElement).focus(); return }
    setOpen(false)
    toast(`Undangan dikirim ke ${email} (demo).`)
  }
  return (
    <SettingsShell title="Tim & peran" description="Tiga peran: admin, staf, dan pengajar." actions={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Undang anggota</button>}>
      <div className="grid grid-3">
        <Stat label="Admin" value={TEAM.filter((t) => t.role === 'Admin').length} />
        <Stat label="Staf" value={TEAM.filter((t) => t.role === 'Staf').length} />
        <Stat label="Pengajar dengan akses" value={TEAM.filter((t) => t.role === 'Pengajar').length} hint="dari 24 pengajar" />
      </div>
      <Card title="Anggota" flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Anggota tim</caption>
            <thead><tr><th scope="col">Nama</th><th scope="col">Peran</th><th scope="col" className="hide-sm">Cabang</th><th scope="col" className="hide-sm">Terakhir aktif</th></tr></thead>
            <tbody>{TEAM.map((t) => <tr key={t.email}><td><Person name={t.name} sub={t.email} /></td><td><Badge tone={t.role === 'Admin' ? 'accent' : 'neutral'}>{t.role}</Badge></td><td className="hide-sm">{t.branch}</td><td className="hide-sm small">{t.last}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Card title="Hak akses per peran" flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Hak akses</caption>
            <thead><tr><th scope="col">Izin</th><th scope="col" className="center">Admin</th><th scope="col" className="center">Staf</th><th scope="col" className="center">Pengajar</th></tr></thead>
            <tbody>{PERMS.map(([p, ...r]) => <tr key={p}><th scope="row">{p}</th>{r.map((v, i) => <td key={i} className="center">{v ? <span aria-label="Ya" role="img" className="perm-yes"><Icon name="check" size={16} /></span> : <span aria-label="Tidak" role="img" className="muted">–</span>}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Undang anggota tim" size="sm">
        <form className="stack" onSubmit={invite} noValidate id="invite-form">
          <Field id="inv-email" label="Email"><input id="inv-email" name="email" type="email" className="input" /></Field>
          <Field id="inv-role" label="Peran"><select id="inv-role" name="role" className="select"><option>Staf</option><option>Pengajar</option><option>Admin</option></select></Field>
          <div className="row between"><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button><button type="submit" className="btn btn-primary">Kirim undangan</button></div>
        </form>
      </Modal>
    </SettingsShell>
  )
}

export function SettingsPackages() {
  const save = useSave('Paket harga disimpan (demo).')
  return (
    <SettingsShell title="Paket harga" description="Harga reguler per level, paket intensif, dan privat per jam. Perubahan dipakai untuk invoice baru.">
      <form className="stack" onSubmit={save}>
        <Card title="Reguler per level (harga level pertama)" flush>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Harga reguler</caption>
              <thead><tr><th scope="col">Bahasa</th><th scope="col">Level termurah</th><th scope="col">Level termahal</th><th scope="col" className="num">Harga level pertama</th></tr></thead>
              <tbody>{LANGUAGES.map((l) => (
                <tr key={l.code}><th scope="row">{l.name}</th><td>{rupiah(Math.min(...l.levels.map((x) => x.price)))}</td><td>{rupiah(Math.max(...l.levels.map((x) => x.price)))}</td>
                  <td className="num"><label className="sr-only" htmlFor={`pk-${l.code}`}>Harga level pertama Bahasa {l.name}</label><input id={`pk-${l.code}`} className="input cell-input" style={{ width: 140 }} type="number" step={50000} defaultValue={l.levels[0].price} /></td></tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
        <div className="grid grid-2">
          <Card title="Privat per jam">
            <Dl items={PRIVATE_RATES.map((r) => [`${r.teacher} · ${r.mode}`, rupiah(r.price)] as [string, string])} />
          </Card>
          <Card title="Biaya lain">
            <Dl items={[['Pendaftaran', rupiah(REGISTRATION_FEE)], ['Buku & modul', 'Rp 125.000 – Rp 185.000'], ['Remedial kedua', rupiah(100000)], ['Cetak ulang sertifikat', rupiah(50000)]]} />
          </Card>
        </div>
        <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Simpan harga</button>
      </form>
    </SettingsShell>
  )
}

const NOTIFS: [string, string, boolean][] = [
  ['Booking trial baru dari situs', 'WhatsApp ke admin cabang', true], ['Pendaftaran siswa baru', 'Email ke admin', true], ['Pembayaran diterima', 'WhatsApp ke siswa/wali', true],
  ['Invoice H-3 jatuh tempo', 'WhatsApp ke siswa/wali', true], ['Siswa alpa 2× berturut-turut', 'WhatsApp ke wali dan pengajar', true], ['Ringkasan harian', 'Email ke admin pukul 20.00', false], ['Laporan bulanan orang tua', 'WhatsApp tanggal 1', false],
]
export function SettingsNotifications() {
  const toast = useToast()
  const [state, setState] = useState(NOTIFS.map((n) => n[2]))
  return (
    <SettingsShell title="Notifikasi" description="Pilih kejadian yang memicu pesan otomatis. Demo: tidak ada pesan yang benar-benar dikirim.">
      <Card>
        {NOTIFS.map(([label, desc], i) => <Toggle key={label} id={`nt-${i}`} label={label} description={desc} checked={state[i]} onChange={(v) => { setState((s) => s.map((x, j) => (j === i ? v : x))); toast(`${label}: ${v ? 'aktif' : 'nonaktif'}.`, 'accent') }} />)}
      </Card>
    </SettingsShell>
  )
}

export function SettingsBilling() {
  const history = [0, 1, 2, 3].map((i) => ({ id: `LD-${2611 - i * 1}`, date: addDays(new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth() - i, 1), 0), amount: 749000 }))
  return (
    <SettingsShell title="Tagihan langganan" description="Contoh layar langganan LinguaDash (SaaS). Template ini tidak memproses pembayaran.">
      <div className="grid grid-3">
        <Stat label="Paket" value="Pro" hint="hingga 500 siswa aktif" />
        <Stat label="Biaya bulanan" value={rupiah(749000)} hint="ditagih tanggal 1" />
        <Stat label="Pemakaian" value="312 / 500" hint="siswa aktif" />
      </div>
      <div className="grid grid-2">
        <Card title="Metode pembayaran"><Dl items={[['Metode', 'Kartu kredit •••• 4242 (contoh)'], ['Atas nama', SCHOOL.name], ['Email tagihan', SCHOOL.email]]} /></Card>
        <Card title="Riwayat tagihan" flush>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Riwayat tagihan langganan</caption>
              <thead><tr><th scope="col">No.</th><th scope="col">Tanggal</th><th scope="col" className="num">Jumlah</th><th scope="col">Status</th></tr></thead>
              <tbody>{history.map((h) => <tr key={h.id}><td className="mono">{h.id}</td><td>{tanggal(h.date)}</td><td className="num">{rupiah(h.amount)}</td><td><StatusBadge status="lunas" /></td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      </div>
    </SettingsShell>
  )
}
