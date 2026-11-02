import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { BranchSelect, LangSelect, LevelSelect } from '../components/filters.tsx'
import { Card, Dl, EmptyState, LangTag, PageHeader, Person, Progress, Segmented, Stat, StatusBadge, Topic, useToast } from '../components/ui.tsx'
import { WeekGrid } from '../components/WeekGrid.tsx'
import { CLASSES, ROOMS, meetingDate, teacherById, type ClassGroup } from '../data/demo.ts'
import { BRANCHES, DEMO_TODAY, branchName, langByCode } from '../data/school.ts'
import { addDays, hari, isoDate, pct, startOfWeek, tanggal, tanggalPendek } from '../lib/format.ts'
import { useParam, useSetParams } from '../lib/params.ts'
import { attendanceStats } from '../lib/selectors.ts'
import { useAllSessions, useClasses, useSessions, useStudents } from '../lib/store.ts'

const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const schedule = (c: ClassGroup) => `${c.days.map((d) => DAY[d]).join(' & ')} ${c.start.replace(':', '.')}`

export function WeekCalendar() {
  const [branch, setBranch] = useParam('cabang', 'bdg')
  const [lang, setLang] = useParam('bahasa')
  const [offset, setOffset] = useState(0)
  const weekStart = addDays(startOfWeek(DEMO_TODAY), offset * 7)
  const list = CLASSES.filter((c) => (!branch || c.branch === branch) && (!lang || c.lang === lang))
  return (
    <>
      <PageHeader title="Kalender mingguan" description={`Minggu ${tanggal(weekStart)} – ${tanggal(addDays(weekStart, 6))} · ${list.length} kelas`} crumbs={[{ label: 'Kelas & jadwal', to: '/kelas' }, { label: 'Kalender' }]}
        actions={
          <div className="row">
            <button type="button" className="btn btn-icon" onClick={() => setOffset(offset - 1)} aria-label="Minggu sebelumnya"><Icon name="left" /></button>
            <button type="button" className="btn" onClick={() => setOffset(0)} disabled={offset === 0}>Minggu ini</button>
            <button type="button" className="btn btn-icon" onClick={() => setOffset(offset + 1)} aria-label="Minggu berikutnya"><Icon name="right" /></button>
          </div>
        } />
      <div className="toolbar">
        <BranchSelect id="cal-branch" value={branch} onChange={setBranch} />
        <LangSelect id="cal-lang" value={lang} onChange={setLang} />
      </div>
      <WeekGrid classes={list} weekStart={weekStart} />
      <Card title="Agenda (tampilan daftar)" description="Versi daftar dari kalender di atas, lebih mudah dibaca di ponsel.">
        <div className="agenda">
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d) => {
            const items = list.filter((c) => c.days.includes(d.getDay())).sort((a, b) => a.start.localeCompare(b.start))
            if (!items.length) return null
            return (
              <div key={d.toISOString()} className="agenda-day">
                <h3>{hari(d)}, {tanggalPendek(d)}</h3>
                <ul className="list" role="list">
                  {items.map((c) => (
                    <li key={c.id}><Link className="list-link" to={`/kelas/${c.id}`}><span className={`lang-dot lang-${c.lang}`} aria-hidden="true" /><span className="grow"><b>{c.start.replace(':', '.')}</b> {c.name}<small className="muted block">{teacherById(c.teacherId)?.name} · {c.branch === 'online' ? 'Online' : c.room}</small></span></Link></li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}

export function ClassList() {
  const classes = useClasses()
  const [lang] = useParam('bahasa')
  const [level, setLevel] = useParam('level')
  const [branch, setBranch] = useParam('cabang')
  const setMany = useSetParams()
  const rows = useMemo(() => classes.filter((c) => (!lang || c.lang === lang) && (!level || c.level === level) && (!branch || c.branch === branch)), [classes, lang, level, branch])
  type Row = (typeof classes)[number]
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Kelas', sort: (c) => c.id, render: (c) => <span><Link className="strong-link" to={`/kelas/${c.id}`}>{c.id}</Link><small className="muted block">{c.program}</small></span> },
    { key: 'lang', header: 'Bahasa & level', sort: (c) => `${c.lang}${c.level}`, render: (c) => <LangTag code={c.lang} level={c.level} /> },
    { key: 'sched', header: 'Jadwal', sort: (c) => `${c.days[0]}${c.start}`, render: (c) => <span className="nowrap">{schedule(c)}</span> },
    { key: 'teacher', header: 'Pengajar', hideSm: true, sort: (c) => teacherById(c.teacherId)?.name ?? '', render: (c) => teacherById(c.teacherId)?.name },
    { key: 'place', header: 'Tempat', hideSm: true, sort: (c) => c.branch, render: (c) => c.branch === 'online' ? <span className="row"><Icon name="video" size={14} /> Online</span> : <span>{branchName(c.branch)}<small className="muted block">{c.room}</small></span> },
    { key: 'seats', header: 'Siswa', align: 'right', sort: (c) => c.enrolled / c.capacity, render: (c) => <span className="tabular">{c.enrolled}/{c.capacity}</span> },
    { key: 'progress', header: 'Progres', sort: (c) => c.meetingsDone / c.meetings, render: (c) => <span className="row nowrap"><Progress value={c.meetingsDone} max={c.meetings} label={`Progres ${c.id}`} /><span className="small tabular">{c.meetingsDone}/{c.meetings}</span></span> },
  ]
  return (
    <>
      <PageHeader title="Daftar kelas" description={`${classes.length} kelas berjalan di 2 cabang dan online`} crumbs={[{ label: 'Kelas & jadwal' }, { label: 'Daftar kelas' }]}
        actions={<Link className="btn" to="/jadwal"><Icon name="calendar" size={16} /> Kalender</Link>} />
      <div className="toolbar">
        <LangSelect id="cl-lang" value={lang} onChange={(v) => setMany({ bahasa: v, level: '' })} />
        <LevelSelect id="cl-level" value={level} onChange={setLevel} lang={lang} />
        <BranchSelect id="cl-branch" value={branch} onChange={setBranch} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(c) => c.id} caption="Daftar kelas" pageSize={15} initialSort={{ key: 'lang', dir: 'asc' }} />
    </>
  )
}

export function ClassDetail() {
  const { id } = useParams()
  const cls = CLASSES.find((c) => c.id === id)
  const students = useStudents()
  const sessions = useSessions(id ?? '')
  const toast = useToast()
  if (!cls) {
    return (
      <>
        <PageHeader title="Kelas tidak ditemukan" crumbs={[{ label: 'Kelas', to: '/kelas' }, { label: 'Tidak ditemukan' }]} />
        <Card><EmptyState icon="calendar" title="ID kelas tidak ada" action={<Link className="btn" to="/kelas">Kembali</Link>} /></Card>
      </>
    )
  }
  const members = students.filter((s) => s.classId === cls.id && s.status === 'aktif')
  const teacher = teacherById(cls.teacherId)
  const att = attendanceStats(sessions)
  const next = meetingDate(cls, cls.meetingsDone + 1)
  const level = langByCode(cls.lang).levels.find((l) => l.code === cls.level)
  return (
    <>
      <PageHeader
        title={cls.name}
        description={<>{cls.id} · <LangTag code={cls.lang} level={cls.level} /> · {cls.program}</>}
        crumbs={[{ label: 'Kelas', to: '/kelas' }, { label: cls.id }]}
        actions={
          <>
            <Link className="btn" to={`/akademik/nilai?kelas=${cls.id}`}><Icon name="academic" size={16} /> Input nilai</Link>
            <Link className="btn btn-primary" to={`/absensi?kelas=${cls.id}`}><Icon name="attendance" size={16} /> Input absensi</Link>
          </>
        }
      />
      <div className="grid grid-4">
        <Stat label="Siswa" value={`${members.length}/${cls.capacity}`} />
        <Stat label="Progres" value={`${cls.meetingsDone}/${cls.meetings}`} hint="pertemuan" />
        <Stat label="Kehadiran kelas" value={pct(att.rate)} />
        <Stat label="Pertemuan berikutnya" value={tanggalPendek(next)} hint={`${hari(next)} ${cls.start.replace(':', '.')}`} />
      </div>
      <div className="grid grid-main">
        <div className="stack">
          <Card title="Siswa di kelas ini" flush>
            {members.length ? (
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Siswa kelas {cls.id}</caption>
                  <thead><tr><th scope="col">Siswa</th><th scope="col" className="num">Hadir</th><th scope="col" className="num hide-sm">Nilai rata-rata</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {members.map((s) => {
                      const mine = attendanceStats(sessions.map((x) => ({ ...x, records: x.records[s.id] ? { [s.id]: x.records[s.id] } : {} })))
                      return (
                        <tr key={s.id}>
                          <td><Person name={s.name} lang={s.lang} to={`/siswa/${s.id}`} sub={s.id} /></td>
                          <td className="num">{mine.total ? pct(mine.rate, 0) : '–'}</td>
                          <td className="num hide-sm">{Math.round((s.scores.listening + s.scores.speaking + s.scores.reading + s.scores.writing) / 4) || '–'}</td>
                          <td><StatusBadge status={s.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon="users" title="Belum ada siswa" />}
          </Card>
          <Card title="Pertemuan terakhir" flush>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Pertemuan kelas {cls.id}</caption>
                <thead><tr><th scope="col">#</th><th scope="col">Tanggal</th><th scope="col">Materi</th><th scope="col" className="num">Hadir</th></tr></thead>
                <tbody>
                  {[...sessions].reverse().slice(0, 8).map((s) => {
                    const st = attendanceStats([s])
                    return (
                      <tr key={s.meeting}>
                        <td>{s.meeting}</td>
                        <td className="nowrap">{tanggal(s.date)}</td>
                        <td><Topic lang={cls.lang} text={s.topic} /></td>
                        <td className="num">{st.hadir}/{st.total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card title="Info kelas">
            <Dl items={[
              ['Jadwal', schedule(cls)],
              ['Durasi', `${cls.minutes} menit per pertemuan`],
              ['Pengajar', teacher ? <Link to={`/pengajar/${teacher.id}`}>{teacher.name}</Link> : '–'],
              ['Tempat', cls.branch === 'online' ? 'Online (Zoom)' : `${branchName(cls.branch)} · ${cls.room}`],
              ['Mulai', tanggal(cls.startDate)],
              ['Target level', level?.can ?? '–'],
            ]} />
          </Card>
          {cls.link && (
            <Card title="Link kelas online">
              <p className="mono small" style={{ overflowWrap: 'anywhere' }}>{cls.link}</p>
              <button type="button" className="btn btn-sm" onClick={() => { void navigator.clipboard?.writeText(cls.link ?? ''); toast('Link disalin.') }}><Icon name="copy" size={14} /> Salin link</button>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export function Rooms() {
  const [branch, setBranch] = useState<'bdg' | 'jkt'>('bdg')
  const todayDay = DEMO_TODAY.getDay()
  const rooms = ROOMS[branch]
  const info = BRANCHES.find((b) => b.id === branch)
  return (
    <>
      <PageHeader title="Ruang & cabang" description={`Pemakaian ruang hari ini, ${hari(DEMO_TODAY)} ${tanggal(DEMO_TODAY)}`} crumbs={[{ label: 'Kelas & jadwal' }, { label: 'Ruang & cabang' }]}
        actions={<Segmented label="Pilih cabang" value={branch} onChange={setBranch} options={[{ id: 'bdg', label: 'Bandung – Dago' }, { id: 'jkt', label: 'Jakarta – Tebet' }]} />} />
      <div className="grid grid-3">
        <Stat label="Ruang" value={rooms.length} hint={info?.hours} />
        <Stat label="Kelas di cabang ini" value={CLASSES.filter((c) => c.branch === branch).length} />
        <Stat label="Kelas hari ini" value={CLASSES.filter((c) => c.branch === branch && c.days.includes(todayDay)).length} />
      </div>
      <div className="grid grid-3">
        {rooms.map((r) => {
          const used = CLASSES.filter((c) => c.branch === branch && c.room === r.name)
          const today = used.filter((c) => c.days.includes(todayDay)).sort((a, b) => a.start.localeCompare(b.start))
          return (
            <Card key={r.name} title={r.name} description={`Kapasitas ${r.capacity} · ${r.facility}`}>
              <p className="small"><b>{used.length}</b> kelas memakai ruang ini.</p>
              {today.length ? (
                <ul className="list" role="list">
                  {today.map((c) => <li key={c.id}><Link className="list-link" to={`/kelas/${c.id}`}><span className={`lang-dot lang-${c.lang}`} aria-hidden="true" /><span className="grow">{c.start.replace(':', '.')} · {c.name}</span></Link></li>)}
                </ul>
              ) : <p className="muted small">Kosong hari ini.</p>}
            </Card>
          )
        })}
      </div>
      <Card title="Alamat cabang"><p className="small">{info?.address}</p></Card>
    </>
  )
}

export function OnlineClasses() {
  const toast = useToast()
  const sessions = useAllSessions()
  const online = CLASSES.filter((c) => c.branch === 'online')
  return (
    <>
      <PageHeader title="Kelas online" description={`${online.length} kelas via Zoom. Link berlaku tetap selama level berjalan.`} crumbs={[{ label: 'Kelas & jadwal' }, { label: 'Kelas online' }]} />
      <Card flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Kelas online dan link</caption>
            <thead><tr><th scope="col">Kelas</th><th scope="col">Jadwal</th><th scope="col">Pertemuan berikutnya</th><th scope="col" className="num hide-sm">Kehadiran</th><th scope="col">Link</th></tr></thead>
            <tbody>
              {online.map((c) => {
                const next = meetingDate(c, c.meetingsDone + 1)
                return (
                  <tr key={c.id}>
                    <td><Link className="strong-link" to={`/kelas/${c.id}`}>{c.name}</Link><small className="muted block">{teacherById(c.teacherId)?.name}</small></td>
                    <td className="nowrap">{schedule(c)}</td>
                    <td className="nowrap">{tanggal(next)}{next === isoDate(DEMO_TODAY) && <small className="block" style={{ color: 'var(--good)' }}>Hari ini</small>}</td>
                    <td className="num hide-sm">{pct(attendanceStats(sessions.get(c.id) ?? []).rate, 0)}</td>
                    <td><span className="row nowrap"><a className="btn btn-sm" href={c.link} target="_blank" rel="noopener" aria-label={`Buka link ${c.id}`}><Icon name="external" size={14} /> Buka</a><button type="button" className="btn btn-sm btn-ghost" onClick={() => { void navigator.clipboard?.writeText(c.link ?? ''); toast(`Link ${c.id} disalin.`) }} aria-label={`Salin link ${c.id}`}><Icon name="copy" size={14} /></button></span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="muted small">Domain meet.polyglotnusantara.example adalah contoh. Ganti dengan link Zoom atau Google Meet Anda di detail kelas.</p>
    </>
  )
}
