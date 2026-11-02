import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { LangSelect, SearchInput } from '../components/filters.tsx'
import { Badge, Card, Field, LangTag, PageHeader, Person, Progress, Stat, useToast } from '../components/ui.tsx'
import { HBars, LANG_COLOR } from '../components/charts.tsx'
import { CLASSES, meetingDate, teacherById, topicFor, type AttendanceStatus, type Session } from '../data/demo.ts'
import { LANGUAGES, branchName } from '../data/school.ts'
import { pct, tanggal } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { attendanceStats } from '../lib/selectors.ts'
import { saveSession, useAllSessions, useSessions, useStudents } from '../lib/store.ts'

const STATUSES: { id: AttendanceStatus; label: string }[] = [{ id: 'hadir', label: 'Hadir' }, { id: 'izin', label: 'Izin' }, { id: 'sakit', label: 'Sakit' }, { id: 'alpa', label: 'Alpa' }]

export function AttendanceInput() {
  const toast = useToast()
  const students = useStudents()
  const [classId, setClassId] = useParam('kelas', CLASSES[0].id)
  const cls = CLASSES.find((c) => c.id === classId) ?? CLASSES[0]
  const sessions = useSessions(cls.id)
  const members = useMemo(() => students.filter((s) => s.classId === cls.id && s.status === 'aktif'), [students, cls.id])
  const nextMeeting = Math.min(cls.meetings, (sessions[sessions.length - 1]?.meeting ?? 0) + 1)
  const [meeting, setMeeting] = useState(nextMeeting)
  const existing = sessions.find((s) => s.meeting === meeting)
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({})
  const [topic, setTopic] = useState('')
  const [saved, setSaved] = useState<Session | null>(null)

  // Reset the sheet when the class or meeting changes.
  useEffect(() => { setMeeting(nextMeeting); setSaved(null) }, [cls.id])
  useEffect(() => {
    setRecords(Object.fromEntries(members.map((s) => [s.id, existing?.records[s.id] ?? 'hadir'])))
    setTopic(existing?.topic ?? topicFor(cls.lang, meeting))
  }, [cls.id, meeting, members, existing])

  const counts = STATUSES.map((s) => ({ ...s, n: Object.values(records).filter((r) => r === s.id).length }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const session: Session = { classId: cls.id, meeting, date: meetingDate(cls, meeting), topic: topic.trim() || topicFor(cls.lang, meeting), records }
    saveSession(session)
    setSaved(session)
    toast(`Absensi ${cls.id} pertemuan ${meeting} disimpan: ${counts.map((c) => `${c.n} ${c.label.toLowerCase()}`).join(', ')}.`)
  }

  return (
    <>
      <PageHeader title="Input absensi" description="Pilih kelas dan pertemuan, tandai kehadiran tiap siswa, lalu simpan." crumbs={[{ label: 'Absensi' }, { label: 'Input absensi' }]}
        actions={<Link className="btn" to={`/absensi/rekap-kelas`}><Icon name="chart" size={16} /> Rekap per kelas</Link>} />
      <form className="grid grid-main" onSubmit={submit} noValidate>
        <Card title={cls.name} description={`${teacherById(cls.teacherId)?.name} · ${cls.branch === 'online' ? 'Online' : `${branchName(cls.branch)}, ${cls.room}`} · ${members.length} siswa`} flush>
          <div className="att-head">
            <div className="form-grid">
              <Field id="att-class" label="Kelas">
                <select id="att-class" className="select" value={cls.id} onChange={(e) => setClassId(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <optgroup key={l.code} label={`Bahasa ${l.name}`}>
                      {CLASSES.filter((c) => c.lang === l.code).map((c) => <option key={c.id} value={c.id}>{c.id} · {c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field id="att-meeting" label="Pertemuan" hint={`Tanggal ${tanggal(meetingDate(cls, meeting))}${existing ? ' · sudah pernah diisi, menyimpan akan menimpa' : ''}`}>
                <select id="att-meeting" className="select" value={meeting} onChange={(e) => { setMeeting(Number(e.target.value)); setSaved(null) }}>
                  {Array.from({ length: Math.min(cls.meetings, nextMeeting) }, (_, i) => i + 1).reverse().map((m) => <option key={m} value={m}>Pertemuan {m}{m === nextMeeting && !sessions.some((s) => s.meeting === m) ? ' (berikutnya)' : ''}</option>)}
                </select>
              </Field>
              <Field id="att-topic" label="Materi" className="span-2">
                <input id="att-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </Field>
            </div>
            <button type="button" className="btn btn-sm btn-soft" onClick={() => setRecords(Object.fromEntries(members.map((s) => [s.id, 'hadir' as AttendanceStatus])))}><Icon name="check" size={14} /> Tandai semua hadir</button>
          </div>
          <ul className="att-list" role="list">
            {members.map((s) => (
              <li key={s.id} className="att-row">
                <Person name={s.name} lang={s.lang} sub={s.id} />
                <fieldset className="att-options">
                  <legend className="sr-only">Kehadiran {s.name}</legend>
                  {STATUSES.map((st) => (
                    <label key={st.id} className={`att-option att-${st.id}`}>
                      <input type="radio" name={`att-${s.id}`} value={st.id} checked={records[s.id] === st.id} onChange={() => setRecords((r) => ({ ...r, [s.id]: st.id }))} />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </fieldset>
              </li>
            ))}
          </ul>
        </Card>
        <div className="stack">
          <Card title="Ringkasan">
            <ul className="list" role="list">
              {counts.map((c) => <li key={c.id} className="list-row"><span className={`dot att-dot-${c.id}`} aria-hidden="true" /><span className="grow">{c.label}</span><b>{c.n}</b></li>)}
            </ul>
            <button type="submit" className="btn btn-primary btn-block">Simpan absensi</button>
          </Card>
          {saved && (
            <div className="notice notice-good" role="status">
              <Icon name="check" size={16} />
              <span>Pertemuan {saved.meeting} tersimpan ({tanggal(saved.date)}). <Link to={`/absensi/rekap-kelas?q=${cls.id}`}>Lihat rekap</Link></span>
            </div>
          )}
        </div>
      </form>
    </>
  )
}

export function AttendanceByStudent() {
  const students = useStudents()
  const sessions = useAllSessions()
  const [q, setQ] = useParam('q')
  const [lang, setLang] = useParam('bahasa')
  const rows = useMemo(() => students.filter((s) => s.status === 'aktif' && s.classId && (!lang || s.lang === lang) && (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase() === q.toLowerCase())).map((s) => {
    const own = (sessions.get(s.classId) ?? []).map((x) => ({ ...x, records: x.records[s.id] ? { [s.id]: x.records[s.id] } : {} }))
    return { s, ...attendanceStats(own) }
  }), [students, sessions, q, lang])
  type Row = (typeof rows)[number]
  const low = rows.filter((r) => r.total > 0 && r.rate < 75).length
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Siswa', sort: (r) => r.s.name, render: (r) => <Person name={r.s.name} lang={r.s.lang} to={`/siswa/${r.s.id}`} sub={r.s.id} /> },
    { key: 'class', header: 'Kelas', hideSm: true, sort: (r) => r.s.classId, render: (r) => <Link to={`/kelas/${r.s.classId}`}>{r.s.classId}</Link> },
    { key: 'hadir', header: 'Hadir', align: 'right', sort: (r) => r.hadir, render: (r) => r.hadir },
    { key: 'izin', header: 'Izin', align: 'right', hideSm: true, sort: (r) => r.izin, render: (r) => r.izin },
    { key: 'sakit', header: 'Sakit', align: 'right', hideSm: true, sort: (r) => r.sakit, render: (r) => r.sakit },
    { key: 'alpa', header: 'Alpa', align: 'right', sort: (r) => r.alpa, render: (r) => r.alpa },
    { key: 'rate', header: 'Kehadiran', sort: (r) => r.rate, render: (r) => r.total ? <span className="row nowrap"><Progress value={r.rate} label={`Kehadiran ${r.s.name}`} tone={r.rate < 75 ? 'bad' : r.rate < 85 ? 'warn' : 'good'} /><span className="small tabular">{pct(r.rate, 0)}</span>{r.rate < 75 && <Badge tone="bad">Perlu perhatian</Badge>}</span> : <span className="muted small">Belum ada data</span> },
  ]
  return (
    <>
      <PageHeader title="Rekap absensi per siswa" description={`${rows.length} siswa aktif · ${low} siswa di bawah 75% (syarat naik level)`} crumbs={[{ label: 'Absensi', to: '/absensi' }, { label: 'Rekap per siswa' }]} />
      <div className="toolbar">
        <SearchInput id="ab-q" value={q} onChange={setQ} placeholder="Nama atau ID siswa" />
        <LangSelect id="ab-lang" value={lang} onChange={setLang} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.s.id} caption="Rekap absensi per siswa" pageSize={15} initialSort={{ key: 'rate', dir: 'asc' }} />
    </>
  )
}

export function AttendanceByClass() {
  const sessions = useAllSessions()
  const [q, setQ] = useParam('q')
  const rows = useMemo(() => CLASSES.filter((c) => !q || c.id.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase())).map((c) => {
    const list = sessions.get(c.id) ?? []
    return { c, ...attendanceStats(list), meetings: list.length, last: list[list.length - 1] }
  }), [sessions, q])
  type Row = (typeof rows)[number]
  const byLang = LANGUAGES.map((l) => ({ key: l.code, label: l.name, value: attendanceStats(CLASSES.filter((c) => c.lang === l.code).flatMap((c) => sessions.get(c.id) ?? [])).rate, color: LANG_COLOR[l.code] }))
  const all = attendanceStats([...sessions.values()].flat())
  const columns: Column<Row>[] = [
    { key: 'class', header: 'Kelas', sort: (r) => r.c.id, render: (r) => <span><Link className="strong-link" to={`/kelas/${r.c.id}`}>{r.c.id}</Link><small className="muted block">{r.c.name}</small></span> },
    { key: 'lang', header: 'Bahasa', hideSm: true, sort: (r) => r.c.lang, render: (r) => <LangTag code={r.c.lang} level={r.c.level} /> },
    { key: 'teacher', header: 'Pengajar', hideSm: true, sort: (r) => teacherById(r.c.teacherId)?.name ?? '', render: (r) => teacherById(r.c.teacherId)?.name },
    { key: 'meetings', header: 'Pertemuan', align: 'right', sort: (r) => r.meetings, render: (r) => r.meetings },
    { key: 'last', header: 'Terakhir', hideSm: true, sort: (r) => r.last?.date ?? '', render: (r) => r.last ? tanggal(r.last.date) : '–' },
    { key: 'rate', header: 'Kehadiran', sort: (r) => r.rate, render: (r) => <span className="row nowrap"><Progress value={r.rate} label={`Kehadiran ${r.c.id}`} tone={r.rate < 80 ? 'warn' : 'good'} /><span className="small tabular">{pct(r.rate, 0)}</span></span> },
    { key: 'act', header: <span className="sr-only">Aksi</span>, render: (r) => <Link className="btn btn-sm" to={`/absensi?kelas=${r.c.id}`}>Input</Link> },
  ]
  return (
    <>
      <PageHeader title="Rekap absensi per kelas" description={`${CLASSES.length} kelas · ${all.total.toLocaleString('id-ID')} catatan kehadiran`} crumbs={[{ label: 'Absensi', to: '/absensi' }, { label: 'Rekap per kelas' }]} />
      <div className="grid grid-4">
        <Stat label="Kehadiran keseluruhan" value={pct(all.rate)} />
        <Stat label="Izin" value={all.izin.toLocaleString('id-ID')} />
        <Stat label="Sakit" value={all.sakit.toLocaleString('id-ID')} />
        <Stat label="Alpa" value={all.alpa.toLocaleString('id-ID')} />
      </div>
      <Card title="Kehadiran per bahasa" description="Rata-rata semua pertemuan yang tercatat">
        <HBars label="Tingkat kehadiran per bahasa" format={(v) => pct(v)} max={100} items={byLang} />
      </Card>
      <div className="toolbar"><SearchInput id="ak-q" value={q} onChange={setQ} placeholder="ID atau nama kelas" /></div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.c.id} caption="Rekap absensi per kelas" pageSize={15} initialSort={{ key: 'rate', dir: 'asc' }} />
    </>
  )
}
