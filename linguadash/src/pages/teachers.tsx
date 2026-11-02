import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { LangSelect, SearchInput, SelectFilter } from '../components/filters.tsx'
import { Badge, Card, Dl, EmptyState, Foreign, LangTag, PageHeader, Person, Stat, StatusBadge } from '../components/ui.tsx'
import { WeekGrid } from '../components/WeekGrid.tsx'
import { CLASSES, TEACHERS, classStudents, type ClassGroup, type Session, type Teacher } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, branchName, langByCode } from '../data/school.ts'
import { seeded } from '../lib/prng.ts'
import { bulanTahun, num, pct, rupiah, startOfWeek, tanggal } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { attendanceStats, waLink } from '../lib/selectors.ts'
import { useAllSessions } from '../lib/store.ts'

const classesOf = (t: Teacher) => CLASSES.filter((c) => c.teacherId === t.id)
const monthPrefix = `${DEMO_TODAY.getFullYear()}-${String(DEMO_TODAY.getMonth() + 1).padStart(2, '0')}`

/** Teaching hours and the teacher's own attendance this month, from the class sessions. */
function payroll(t: Teacher, sessions: Map<string, Session[]>) {
  const rng = seeded(t.id.length * 7919 + t.years)
  let hours = 0
  let taught = 0
  let substituted = 0
  for (const c of classesOf(t)) {
    for (const s of sessions.get(c.id) ?? []) {
      if (!s.date.startsWith(monthPrefix)) continue
      if (rng.next() < 0.04) { substituted++; continue }
      taught++
      hours += c.minutes / 60
    }
  }
  return { hours, taught, substituted, pay: Math.round(hours * t.rate), rate: taught + substituted ? (taught / (taught + substituted)) * 100 : 100 }
}

export function TeacherList() {
  const [lang, setLang] = useParam('bahasa')
  const [type, setType] = useParam('jenis')
  const [q, setQ] = useParam('q')
  const rows = useMemo(() => TEACHERS.filter((t) => (!lang || t.lang === lang) && (!type || t.type === type) && (!q || t.name.toLowerCase().includes(q.toLowerCase()))), [lang, type, q])
  const columns: Column<Teacher>[] = [
    { key: 'name', header: 'Pengajar', sort: (t) => t.name, render: (t) => <Person name={t.name} lang={t.lang} to={`/pengajar/${t.id}`} sub={t.origin} /> },
    { key: 'type', header: 'Jenis', sort: (t) => t.type, render: (t) => <StatusBadge status={t.type} /> },
    { key: 'lang', header: 'Bahasa diajar', sort: (t) => t.lang, render: (t) => <LangTag code={t.lang} /> },
    { key: 'focus', header: 'Fokus', hideSm: true, render: (t) => <span className="small">{t.focus}</span> },
    { key: 'classes', header: 'Kelas', align: 'right', sort: (t) => classesOf(t).length, render: (t) => classesOf(t).length },
    { key: 'years', header: 'Pengalaman', align: 'right', hideSm: true, sort: (t) => t.years, render: (t) => `${t.years} th` },
    { key: 'rating', header: 'Rating', align: 'right', sort: (t) => t.rating, render: (t) => <span className="nowrap">★ {t.rating.toFixed(1).replace('.', ',')}</span> },
    { key: 'branch', header: 'Cabang', hideSm: true, sort: (t) => t.branch, render: (t) => branchName(t.branch) },
  ]
  return (
    <>
      <PageHeader title="Pengajar" description={`${TEACHERS.length} pengajar: ${TEACHERS.filter((t) => t.type === 'native').length} native dan ${TEACHERS.filter((t) => t.type === 'lokal').length} lokal`} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Pengajar' }]}
        actions={<Link className="btn" to="/pengajar/honor"><Icon name="wallet" size={16} /> Honor & absensi</Link>} />
      <div className="grid grid-6">
        {LANGUAGES.map((l) => <Stat key={l.code} label={`Bahasa ${l.name}`} value={TEACHERS.filter((t) => t.lang === l.code).length} hint={`${TEACHERS.filter((t) => t.lang === l.code && t.type === 'native').length} native`} />)}
      </div>
      <div className="toolbar">
        <SearchInput id="tc-q" value={q} onChange={setQ} placeholder="Nama pengajar" />
        <LangSelect id="tc-lang" value={lang} onChange={setLang} />
        <SelectFilter id="tc-type" label="Jenis" value={type} onChange={setType} options={[['', 'Native & lokal'], ['native', 'Native'], ['lokal', 'Lokal']]} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} caption="Daftar pengajar" pageSize={12} initialSort={{ key: 'name', dir: 'asc' }} />
    </>
  )
}

function useTeacher() {
  const { id } = useParams()
  return TEACHERS.find((t) => t.id === id)
}
function Missing() {
  return (
    <>
      <PageHeader title="Pengajar tidak ditemukan" crumbs={[{ label: 'Pengajar', to: '/pengajar' }, { label: 'Tidak ditemukan' }]} />
      <Card><EmptyState icon="teacher" title="ID pengajar tidak ada" action={<Link className="btn" to="/pengajar">Kembali</Link>} /></Card>
    </>
  )
}

export function TeacherDetail() {
  const t = useTeacher()
  const sessions = useAllSessions()
  if (!t) return <Missing />
  const own = classesOf(t)
  const pay = payroll(t, sessions)
  const studentCount = own.reduce((s, c) => s + classStudents(c.id).length, 0)
  const att = attendanceStats(own.flatMap((c) => sessions.get(c.id) ?? []))
  return (
    <>
      <PageHeader
        title={t.name}
        description={<><StatusBadge status={t.type} /> · Pengajar Bahasa {langByCode(t.lang).name} · {t.origin}</>}
        crumbs={[{ label: 'Pengajar', to: '/pengajar' }, { label: t.name }]}
        actions={
          <>
            <a className="btn btn-wa" href={waLink(t.phone, `Halo ${t.name.split(' ')[0]}, `)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> WhatsApp</a>
            <Link className="btn btn-primary" to={`/pengajar/${t.id}/jadwal`}><Icon name="calendar" size={16} /> Jadwal mengajar</Link>
          </>
        }
      />
      <div className="grid grid-4">
        <Stat label="Kelas aktif" value={own.length} />
        <Stat label="Siswa diajar sekarang" value={studentCount} />
        <Stat label={`Jam mengajar ${bulanTahun(DEMO_TODAY)}`} value={`${num(Math.round(pay.hours * 10) / 10)} jam`} hint={`honor ${rupiah(pay.pay)}`} />
        <Stat label="Kehadiran siswa di kelasnya" value={pct(att.rate)} />
      </div>
      <div className="grid grid-main">
        <Card title="Kelas yang diajar" flush>
          <ClassTable classes={own} />
        </Card>
        <div className="stack">
          <Card title="Profil">
            <Dl items={[['Email', <span style={{ overflowWrap: 'anywhere' }}>{t.email}</span>], ['WhatsApp', t.phone], ['Sertifikat', t.cert], ['Pengalaman', `${t.years} tahun`], ['Fokus', t.focus], ['Cabang utama', branchName(t.branch)], ['Bergabung', tanggal(t.joined)], ['Tarif honor', `${rupiah(t.rate)} / jam`]]} />
          </Card>
          <Card title="Motto mengajar">
            <blockquote className="small">{t.quoteNative && <><Foreign lang={t.lang}>{t.quoteNative}</Foreign> </>}{t.quote}</blockquote>
          </Card>
        </div>
      </div>
    </>
  )
}

function ClassTable({ classes }: { classes: ClassGroup[] }) {
  if (!classes.length) return <EmptyState icon="calendar" title="Belum ada kelas" />
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Kelas</caption>
        <thead><tr><th scope="col">Kelas</th><th scope="col">Tempat</th><th scope="col" className="num">Siswa</th><th scope="col">Progres</th></tr></thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td><Link className="strong-link" to={`/kelas/${c.id}`}>{c.name}</Link><small className="muted block">{c.id} · {c.program}</small></td>
              <td>{c.branch === 'online' ? 'Online' : `${branchName(c.branch)} · ${c.room}`}</td>
              <td className="num">{classStudents(c.id).length}/{c.capacity}</td>
              <td className="small">{c.meetingsDone}/{c.meetings} pertemuan</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TeacherSchedule() {
  const t = useTeacher()
  if (!t) return <Missing />
  const own = classesOf(t)
  const minutes = own.reduce((s, c) => s + c.minutes * c.days.length, 0)
  return (
    <>
      <PageHeader title={`Jadwal mengajar ${t.name}`} description={`${own.length} kelas · ${num(minutes / 60)} jam per minggu · minggu ini`} crumbs={[{ label: 'Pengajar', to: '/pengajar' }, { label: t.name, to: `/pengajar/${t.id}` }, { label: 'Jadwal' }]} />
      <WeekGrid classes={own} weekStart={startOfWeek(DEMO_TODAY)} />
      <Card title="Daftar kelas" flush><ClassTable classes={own} /></Card>
    </>
  )
}

export function TeacherPay() {
  const sessions = useAllSessions()
  const [lang, setLang] = useParam('bahasa')
  const rows = useMemo(() => TEACHERS.filter((t) => !lang || t.lang === lang).map((t) => ({ t, ...payroll(t, sessions) })), [sessions, lang])
  type Row = (typeof rows)[number]
  const total = rows.reduce((s, r) => s + r.pay, 0)
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Pengajar', sort: (r) => r.t.name, render: (r) => <Person name={r.t.name} lang={r.t.lang} to={`/pengajar/${r.t.id}`} sub={<>{langByCode(r.t.lang).name} · {r.t.type === 'native' ? 'Native' : 'Lokal'}</>} /> },
    { key: 'sessions', header: 'Pertemuan', align: 'right', sort: (r) => r.taught, render: (r) => r.taught },
    { key: 'sub', header: 'Digantikan', align: 'right', sort: (r) => r.substituted, render: (r) => r.substituted ? <Badge tone="warn">{r.substituted}</Badge> : '0' },
    { key: 'att', header: 'Kehadiran', align: 'right', sort: (r) => r.rate, render: (r) => pct(r.rate, 0) },
    { key: 'hours', header: 'Jam', align: 'right', sort: (r) => r.hours, render: (r) => num(Math.round(r.hours * 10) / 10) },
    { key: 'rate', header: 'Tarif/jam', align: 'right', hideSm: true, sort: (r) => r.t.rate, render: (r) => rupiah(r.t.rate) },
    { key: 'pay', header: 'Honor', align: 'right', sort: (r) => r.pay, render: (r) => <b>{rupiah(r.pay)}</b> },
  ]
  return (
    <>
      <PageHeader title="Honor & absensi pengajar" description={`${bulanTahun(DEMO_TODAY)} sampai ${tanggal(DEMO_TODAY)} · dibayar tanggal 5 bulan berikutnya`} crumbs={[{ label: 'Pengajar', to: '/pengajar' }, { label: 'Honor & absensi' }]}
        actions={<button type="button" className="btn" onClick={() => window.print()}><Icon name="printer" size={16} /> Cetak rekap</button>} />
      <div className="grid grid-4">
        <Stat label="Total honor berjalan" value={rupiah(total)} />
        <Stat label="Jam mengajar" value={`${num(Math.round(rows.reduce((s, r) => s + r.hours, 0)))} jam`} />
        <Stat label="Pertemuan digantikan" value={rows.reduce((s, r) => s + r.substituted, 0)} hint="pengajar pengganti" />
        <Stat label="Rata-rata tarif" value={rupiah(Math.round(rows.reduce((s, r) => s + r.t.rate, 0) / Math.max(1, rows.length)))} hint="per jam" />
      </div>
      <div className="toolbar"><LangSelect id="pay-lang" value={lang} onChange={setLang} /></div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.t.id} caption="Honor pengajar bulan ini" pageSize={24} initialSort={{ key: 'pay', dir: 'desc' }}
        footer={<tr><td>Total ({rows.length} pengajar)</td><td className="num">{rows.reduce((s, r) => s + r.taught, 0)}</td><td className="num">{rows.reduce((s, r) => s + r.substituted, 0)}</td><td /><td className="num">{num(Math.round(rows.reduce((s, r) => s + r.hours, 0)))}</td><td className="hide-sm" /><td className="num">{rupiah(total)}</td></tr>} />
    </>
  )
}
