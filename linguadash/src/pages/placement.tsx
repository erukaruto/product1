import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { LangSelect, SearchInput, SelectFilter } from '../components/filters.tsx'
import { Badge, Card, Dl, EmptyState, Field, LangTag, PageHeader, Person, StatusBadge, useToast } from '../components/ui.tsx'
import { HBars } from '../components/charts.tsx'
import { classById, teacherById, type PlacementResult, type Student } from '../data/demo.ts'
import { PLACEMENT_QUESTIONS } from '../data/placement.ts'
import { DEMO_TODAY, branchName, langByCode, type BranchId } from '../data/school.ts'
import { isoDate, num, tanggal } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { waLink } from '../lib/selectors.ts'
import { nextStudentId, update, useClasses, usePlacements } from '../lib/store.ts'

const totalOf = (p: PlacementResult) => {
  const score = p.sections.reduce((s, x) => s + x.score, 0)
  const max = p.sections.reduce((s, x) => s + x.max, 0)
  return { score, max, pct: Math.round((score / max) * 100) }
}

export function PlacementList() {
  const results = usePlacements()
  const [q, setQ] = useParam('q')
  const [lang, setLang] = useParam('bahasa')
  const [status, setStatus] = useParam('status')
  const rows = useMemo(() => results.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())) && (!lang || p.lang === lang) && (!status || p.status === status)), [results, q, lang, status])
  const waiting = results.filter((p) => p.status === 'menunggu').length
  const columns: Column<PlacementResult>[] = [
    { key: 'name', header: 'Peserta', sort: (p) => p.name, render: (p) => <Person name={p.name} lang={p.lang} to={`/tes-penempatan/${p.id}`} sub={p.id} /> },
    { key: 'date', header: 'Tanggal', sort: (p) => p.date, render: (p) => tanggal(p.date) },
    { key: 'lang', header: 'Bahasa', sort: (p) => p.lang, render: (p) => <LangTag code={p.lang} /> },
    { key: 'type', header: 'Jenis tes', hideSm: true, sort: (p) => p.type, render: (p) => <span className="small">{p.type}</span> },
    { key: 'score', header: 'Skor', align: 'right', sort: (p) => totalOf(p).pct, render: (p) => <span className="tabular">{totalOf(p).score}/{totalOf(p).max}</span> },
    { key: 'level', header: 'Level hasil', sort: (p) => p.level, render: (p) => <Badge tone="accent">{p.level}</Badge> },
    { key: 'status', header: 'Status', sort: (p) => p.status, render: (p) => <StatusBadge status={p.status} /> },
    { key: 'act', header: <span className="sr-only">Aksi</span>, render: (p) => p.status === 'menunggu' ? <Link className="btn btn-sm btn-primary" to={`/tes-penempatan/${p.id}/tetapkan`}>Tetapkan kelas</Link> : <Link className="btn btn-sm" to={`/tes-penempatan/${p.id}`}>Detail</Link> },
  ]
  return (
    <>
      <PageHeader title="Hasil tes penempatan" description={`${num(results.length)} tes dalam 6 bulan terakhir · ${waiting} menunggu penetapan kelas`} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Tes penempatan' }]} />
      <div className="toolbar">
        <SearchInput id="pt-q" value={q} onChange={setQ} placeholder="Nama atau ID tes" />
        <LangSelect id="pt-lang" value={lang} onChange={setLang} />
        <SelectFilter id="pt-status" label="Status" value={status} onChange={setStatus} options={[['', 'Semua status'], ['menunggu', 'Menunggu kelas'], ['ditetapkan', 'Kelas ditetapkan']]} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(p) => p.id} caption="Hasil tes penempatan" pageSize={12} initialSort={{ key: 'date', dir: 'desc' }} />
    </>
  )
}

function usePlacement() {
  const { id } = useParams()
  const results = usePlacements()
  return results.find((p) => p.id === id)
}

function Missing() {
  return (
    <>
      <PageHeader title="Hasil tes tidak ditemukan" crumbs={[{ label: 'Tes penempatan', to: '/tes-penempatan' }, { label: 'Tidak ditemukan' }]} />
      <Card><EmptyState icon="test" title="ID tes tidak ada" action={<Link className="btn" to="/tes-penempatan">Kembali</Link>} /></Card>
    </>
  )
}

export function PlacementDetail() {
  const p = usePlacement()
  if (!p) return <Missing />
  const total = totalOf(p)
  const cls = p.classId ? classById(p.classId) : undefined
  return (
    <>
      <PageHeader
        title={`Tes penempatan ${p.name}`}
        description={`${p.id} · ${tanggal(p.date)} · ${p.type}`}
        crumbs={[{ label: 'Tes penempatan', to: '/tes-penempatan' }, { label: p.name }]}
        actions={
          <>
            <a className="btn btn-wa" href={waLink(p.phone, `Halo ${p.name.split(' ')[0]}, hasil tes penempatan Anda: level ${p.level}.`)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> Kirim hasil</a>
            {p.status === 'menunggu' && <Link className="btn btn-primary" to={`/tes-penempatan/${p.id}/tetapkan`}>Tetapkan kelas</Link>}
          </>
        }
      />
      <div className="grid grid-main">
        <div className="stack">
          <Card title="Skor per bagian" description={`Total ${total.score} dari ${total.max} (${total.pct}%) · rekomendasi level ${p.level}`}>
            <HBars label="Skor per bagian tes" format={(v) => String(v)} items={p.sections.map((s) => ({ key: s.name, label: s.name, value: s.score, sub: `dari ${s.max}` }))} max={Math.max(...p.sections.map((s) => s.max))} />
          </Card>
          {p.answers ? (
            <Card title="Jawaban per soal" description="15 soal online, sama dengan tes di situs LinguaDrop" flush>
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Jawaban per soal</caption>
                  <thead><tr><th scope="col">#</th><th scope="col">Soal</th><th scope="col">Bagian</th><th scope="col">Jawaban</th><th scope="col">Hasil</th></tr></thead>
                  <tbody>
                    {PLACEMENT_QUESTIONS.map((q, i) => {
                      const a = p.answers?.[i] ?? -1
                      const ok = a === q.answer
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><span lang="en">{q.prompt}</span><small className="muted block">Level soal {q.level}</small></td>
                          <td className="small">{q.section}</td>
                          <td><span lang="en">{q.options[a] ?? '–'}</span>{!ok && <small className="muted block">Kunci: <span lang="en">{q.options[q.answer]}</span></small>}</td>
                          <td>{ok ? <Badge tone="good">Benar</Badge> : <Badge tone="bad">Salah</Badge>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Lembar jawaban"><EmptyState icon="file" title="Tes tertulis dan lisan di cabang">Lembar jawaban fisik disimpan di cabang. Skor diinput oleh pengajar penguji.</EmptyState></Card>
          )}
        </div>
        <div className="stack">
          <Card title="Peserta">
            <Dl items={[['Nama', p.name], ['WhatsApp', p.phone], ['Email', <span style={{ overflowWrap: 'anywhere' }}>{p.email}</span>], ['Bahasa', <LangTag code={p.lang} />], ['Level hasil', <Badge tone="accent">{p.level}</Badge>], ['Status', <StatusBadge status={p.status} />]]} />
          </Card>
          {cls && (
            <Card title="Kelas yang ditetapkan">
              <Dl items={[['Kelas', <Link to={`/kelas/${cls.id}`}>{cls.name}</Link>], ['Pengajar', teacherById(cls.teacherId)?.name ?? '–'], ['Tempat', branchName(cls.branch)]]} />
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export function PlacementAssign() {
  const p = usePlacement()
  const classes = useClasses()
  const toast = useToast()
  const navigate = useNavigate()
  const [branch, setBranch] = useState<'all' | BranchId>('all')
  const [choice, setChoice] = useState('')
  const [createStudent, setCreateStudent] = useState(true)
  const [error, setError] = useState('')
  if (!p) return <Missing />
  const options = classes.filter((c) => c.lang === p.lang && c.level === p.level && (branch === 'all' || c.branch === branch))
  const nearby = classes.filter((c) => c.lang === p.lang && c.level !== p.level && (branch === 'all' || c.branch === branch)).slice(0, 4)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!choice) { setError('Pilih satu kelas.'); document.querySelector<HTMLInputElement>('input[name="class"]')?.focus(); return }
    const cls = classes.find((c) => c.id === choice)
    update((st) => ({ placements: { ...st.placements, [p.id]: choice } }))
    if (createStudent && cls) {
      const id = nextStudentId()
      const student: Student = {
        id, name: p.name, gender: 'P', birth: '2000-01-01', phone: p.phone, email: p.email, lang: p.lang, level: cls.level,
        program: cls.program, branch: cls.branch, classId: cls.id, status: 'aktif', joined: isoDate(DEMO_TODAY), attendance: 100,
        scores: { listening: 0, speaking: 0, reading: 0, writing: 0 }, history: [{ level: cls.level, start: isoDate(DEMO_TODAY), result: 'berjalan' }],
        source: 'Tes penempatan', note: `Dari tes ${p.id}, skor ${totalOf(p).score}/${totalOf(p).max}.`,
      }
      update((st) => ({ added: [student, ...st.added] }))
      toast(`${p.name} ditetapkan ke ${cls.name} dan dibuat sebagai siswa ${id}.`)
      navigate(`/siswa/${id}`)
      return
    }
    toast(`${p.name} ditetapkan ke ${cls?.name}.`)
    navigate(`/tes-penempatan/${p.id}`)
  }
  const radio = (c: (typeof classes)[number]) => (
    <label key={c.id} className="choice">
      <input type="radio" name="class" value={c.id} checked={choice === c.id} onChange={() => { setChoice(c.id); setError('') }} disabled={c.enrolled >= c.capacity} />
      <span>
        {c.name}
        <small>{branchName(c.branch)} · {teacherById(c.teacherId)?.name} · {c.enrolled}/{c.capacity} kursi · pertemuan {c.meetingsDone}/{c.meetings}</small>
      </span>
    </label>
  )
  return (
    <>
      <PageHeader title={`Tetapkan kelas untuk ${p.name}`} description={`Hasil tes ${p.id}: ${langByCode(p.lang).name} level ${p.level}, skor ${totalOf(p).score}/${totalOf(p).max}`} crumbs={[{ label: 'Tes penempatan', to: '/tes-penempatan' }, { label: p.name, to: `/tes-penempatan/${p.id}` }, { label: 'Tetapkan kelas' }]} />
      <form className="grid grid-main" onSubmit={submit} noValidate>
        <Card title={`Kelas ${langByCode(p.lang).name} ${p.level}`} description="Kelas penuh tidak bisa dipilih." actions={
          <div className="segmented" role="group" aria-label="Filter cabang">
            {(['all', 'bdg', 'jkt', 'online'] as const).map((b) => <button key={b} type="button" aria-pressed={branch === b} onClick={() => setBranch(b)}>{b === 'all' ? 'Semua' : branchName(b)}</button>)}
          </div>
        }>
          <fieldset className="stack-sm" aria-describedby={error ? 'assign-error' : undefined}>
            <legend className="sr-only">Pilih kelas</legend>
            {options.length ? <div className="choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>{options.map(radio)}</div> : <EmptyState icon="calendar" title="Belum ada kelas untuk level ini">Pilih level terdekat di bawah, atau buka kelas baru dari menu Kelas.</EmptyState>}
            {nearby.length > 0 && (<><p className="small muted mt-0">Level terdekat:</p><div className="choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>{nearby.map(radio)}</div></>)}
            {error && <p className="error" id="assign-error" role="alert">{error}</p>}
          </fieldset>
        </Card>
        <Card title="Konfirmasi">
          <Toggle checked={createStudent} onChange={setCreateStudent} />
          <Field id="assign-note" label="Catatan untuk pengajar"><textarea id="assign-note" className="textarea" rows={3} placeholder="contoh: kuat di reading, perlu latihan speaking" /></Field>
          <button type="submit" className="btn btn-primary btn-block">Tetapkan kelas</button>
          <Link to={`/tes-penempatan/${p.id}`} className="btn btn-ghost btn-block">Batal</Link>
        </Card>
      </form>
    </>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> Langsung buat data siswa aktif dari hasil tes ini</label>
  )
}
