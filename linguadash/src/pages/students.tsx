import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { BranchSelect, LangSelect, LevelSelect, SearchInput, SelectFilter } from '../components/filters.tsx'
import { Badge, Card, Dl, EmptyState, Field, LangTag, PageHeader, Person, Progress, StatusBadge, useToast } from '../components/ui.tsx'
import { HBars, SegmentBar } from '../components/charts.tsx'
import { BRANCH_LIST, CLASSES, SKILLS, SKILL_LABEL, classById, invoiceStatus, invoiceTotal, teacherById, type Student, type StudentStatus } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, SCHOOL, branchName, langByCode, type BranchId, type LangCode } from '../data/school.ts'
import { downloadText, parseCsv, toCsv } from '../lib/csv.ts'
import { isoDate, num, pct, rupiah, tanggal, tanggalPanjang } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { attendanceStats, skillAvg, waLink } from '../lib/selectors.ts'
import { nextStudentId, update, useClasses, useInvoices, useSessions, useStudent, useStudents } from '../lib/store.ts'

const ageOf = (birth: string) => {
  const b = new Date(birth)
  return DEMO_TODAY.getFullYear() - b.getFullYear() - (DEMO_TODAY < new Date(DEMO_TODAY.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0)
}
const STATUS_OPTIONS: [string, string][] = [['', 'Semua status'], ['aktif', 'Aktif'], ['cuti', 'Cuti'], ['lulus', 'Lulus'], ['berhenti', 'Berhenti']]

// ---------- List ----------
export function StudentList() {
  const students = useStudents()
  const [q, setQ] = useParam('q')
  const [lang, setLang] = useParam('bahasa')
  const [level, setLevel] = useParam('level')
  const [status, setStatus] = useParam('status')
  const [branch, setBranch] = useParam('cabang')

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return students.filter((s) =>
      (!term || s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term) || s.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '') || '§')) &&
      (!lang || s.lang === lang) && (!level || s.level === level) && (!status || s.status === status) && (!branch || s.branch === branch))
  }, [students, q, lang, level, status, branch])

  const columns: Column<Student>[] = [
    { key: 'name', header: 'Siswa', sort: (s) => s.name, render: (s) => <Person name={s.name} lang={s.lang} to={`/siswa/${s.id}`} sub={s.id} /> },
    { key: 'lang', header: 'Bahasa & level', sort: (s) => `${s.lang}${s.level}`, render: (s) => <LangTag code={s.lang} level={s.level} /> },
    { key: 'program', header: 'Program', hideSm: true, sort: (s) => s.program, render: (s) => s.program },
    { key: 'branch', header: 'Cabang', hideSm: true, sort: (s) => s.branch, render: (s) => branchName(s.branch) },
    { key: 'att', header: 'Kehadiran', sort: (s) => s.attendance, render: (s) => <span className="row nowrap"><Progress value={s.attendance} label={`Kehadiran ${s.name}`} tone={s.attendance < 75 ? 'bad' : s.attendance < 85 ? 'warn' : 'good'} /> <span className="tabular small">{s.attendance}%</span></span> },
    { key: 'score', header: 'Nilai rata-rata', align: 'right', sort: (s) => skillAvg(s), render: (s) => <b className="tabular">{skillAvg(s)}</b> },
    { key: 'status', header: 'Status', sort: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
    { key: 'joined', header: 'Bergabung', hideSm: true, sort: (s) => s.joined, render: (s) => tanggal(s.joined) },
  ]

  const exportCsv = () => downloadText('siswa-polyglot-nusantara.csv', toCsv(rows.map((s) => ({ id: s.id, nama: s.name, bahasa: langByCode(s.lang).name, level: s.level, program: s.program, cabang: branchName(s.branch), status: s.status, whatsapp: s.phone, email: s.email, kehadiran: s.attendance, nilai: skillAvg(s) }))))
  const counts = { aktif: students.filter((s) => s.status === 'aktif').length, total: students.length }

  return (
    <>
      <PageHeader
        title="Daftar siswa"
        description={`${num(counts.total)} siswa terdaftar, ${num(counts.aktif)} aktif.`}
        crumbs={[{ label: 'Overview', to: '/' }, { label: 'Siswa' }]}
        actions={
          <>
            <button type="button" className="btn" onClick={exportCsv}><Icon name="download" size={16} /> Ekspor CSV</button>
            <Link className="btn" to="/siswa/impor"><Icon name="upload" size={16} /> Impor CSV</Link>
            <Link className="btn btn-primary" to="/siswa/baru"><Icon name="plus" size={16} /> Tambah siswa</Link>
          </>
        }
      />
      <div className="toolbar" role="search" aria-label="Saring siswa">
        <SearchInput id="f-q" label="Cari" value={q} onChange={setQ} placeholder="Nama, ID, atau nomor WA" />
        <LangSelect id="f-lang" value={lang} onChange={(v) => { setLang(v); setLevel('') }} />
        <LevelSelect id="f-level" value={level} onChange={setLevel} lang={lang} />
        <SelectFilter id="f-status" label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <BranchSelect id="f-branch" value={branch} onChange={setBranch} />
      </div>
      <p className="small muted" aria-live="polite">{num(rows.length)} siswa cocok dengan filter.</p>
      <DataTable rows={rows} columns={columns} rowKey={(s) => s.id} caption="Daftar siswa" pageSize={12} initialSort={{ key: 'name', dir: 'asc' }} />
    </>
  )
}

// ---------- Detail ----------
export function StudentDetail() {
  const { id } = useParams()
  const s = useStudent(id)
  const invoices = useInvoices()
  const sessions = useSessions(s?.classId ?? '')
  if (!s) return <NotFoundStudent />
  const cls = classById(s.classId)
  const teacher = cls ? teacherById(cls.teacherId) : undefined
  const att = attendanceStats(sessions.map((x) => ({ ...x, records: x.records[s.id] ? { [s.id]: x.records[s.id] } : {} })))
  const own = invoices.filter((inv) => inv.studentId === s.id)
  const lang = langByCode(s.lang)
  const level = lang.levels.find((l) => l.code === s.level)
  const completed = s.history.filter((h) => h.result === 'lulus')
  const age = ageOf(s.birth)

  return (
    <>
      <PageHeader
        title={s.name}
        description={<>{s.id} · <LangTag code={s.lang} level={s.level} /> · {s.program} · {branchName(s.branch)}</>}
        crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: s.name }]}
        actions={
          <>
            <a className="btn btn-wa" href={waLink(s.phone, `Halo ${s.name.split(' ')[0]}, `)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> WhatsApp</a>
            {completed.length > 0 && <Link className="btn" to={`/siswa/${s.id}/sertifikat`}><Icon name="cert" size={16} /> Sertifikat</Link>}
            <Link className="btn" to={`/akademik/nilai?kelas=${s.classId}`}><Icon name="academic" size={16} /> Input nilai</Link>
            <Link className="btn btn-primary" to={`/siswa/${s.id}/edit`}><Icon name="edit" size={16} /> Edit</Link>
          </>
        }
      />
      <div className="grid grid-main">
        <div className="stack">
          <div className="grid grid-2">
            <Card title="Nilai 4 skill" description={`Penilaian terakhir · rata-rata ${skillAvg(s)}`}>
              <HBars label="Nilai listening, speaking, reading, writing" format={(v) => String(v)} max={100} items={SKILLS.map((k) => ({ key: k, label: SKILL_LABEL[k], value: s.scores[k], color: s.scores[k] < 70 ? 'var(--warn)' : 'var(--accent)' }))} />
              <p className="small muted">Batas lulus level: rata-rata 70 dan tidak ada skill di bawah 60. {SKILLS.some((k) => s.scores[k] < 60) ? 'Ada skill di bawah 60, perlu remedial.' : 'Semua skill di atas batas minimum.'}</p>
            </Card>
            <Card title="Kehadiran" description={cls ? `Kelas ${cls.id} · ${att.total} pertemuan tercatat` : 'Belum ada kelas'}>
              <p className="stat-value">{att.total ? pct(att.rate) : '–'}</p>
              <SegmentBar label="Komposisi kehadiran" parts={[{ name: 'Hadir', value: att.hadir, color: 'var(--good)' }, { name: 'Izin', value: att.izin, color: 'var(--c-zh)' }, { name: 'Sakit', value: att.sakit, color: 'var(--c-en)' }, { name: 'Alpa', value: att.alpa, color: 'var(--bad)' }]} />
              <Link className="small" to={`/absensi/rekap-siswa?q=${s.id}`}>Lihat rekap absensi</Link>
            </Card>
          </div>
          <Card title="Riwayat level" description={`${completed.length} level selesai sejak ${tanggal(s.joined)}`} flush>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Riwayat level {s.name}</caption>
                <thead><tr><th scope="col">Level</th><th scope="col">Mulai</th><th scope="col">Selesai</th><th scope="col" className="num">Nilai akhir</th><th scope="col">Hasil</th></tr></thead>
                <tbody>
                  {[...s.history].reverse().map((h) => (
                    <tr key={h.level + h.start}>
                      <th scope="row">{h.level} <span className="muted small">{lang.levels.find((l) => l.code === h.level)?.name}</span></th>
                      <td>{tanggal(h.start)}</td>
                      <td>{h.end ? tanggal(h.end) : '–'}</td>
                      <td className="num">{h.final ?? '–'}</td>
                      <td><StatusBadge status={h.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Tagihan & invoice" flush actions={<Link className="btn btn-sm" to={`/keuangan/invoice/baru?siswa=${s.id}`}><Icon name="plus" size={14} /> Invoice</Link>}>
            {own.length ? (
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Invoice {s.name}</caption>
                  <thead><tr><th scope="col">Invoice</th><th scope="col">Terbit</th><th scope="col" className="num">Total</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {own.map((inv) => (
                      <tr key={inv.id}><td><Link to={`/keuangan/invoice/${inv.id}`} className="mono">{inv.id}</Link></td><td>{tanggal(inv.issued)}</td><td className="num">{rupiah(invoiceTotal(inv))}</td><td><StatusBadge status={invoiceStatus(inv)} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon="file" title="Belum ada invoice">Buat invoice pertama untuk siswa ini.</EmptyState>}
          </Card>
        </div>
        <div className="stack">
          <Card title="Profil">
            <Dl items={[
              ['ID siswa', <span className="mono">{s.id}</span>],
              ['Status', <StatusBadge status={s.status} />],
              ['Tanggal lahir', `${tanggal(s.birth)} (${age} th)`],
              ['WhatsApp', s.phone],
              ['Email', <span style={{ overflowWrap: 'anywhere' }}>{s.email}</span>],
              ...(s.parent ? [['Orang tua/wali', `${s.parent.name} · ${s.parent.phone}`] as [string, string]] : []),
              ['Bergabung', tanggal(s.joined)],
              ['Tahu dari', s.source],
            ]} />
          </Card>
          <Card title="Kelas saat ini">
            {cls ? (
              <Dl items={[
                ['Kelas', <Link to={`/kelas/${cls.id}`}>{cls.name}</Link>],
                ['Pengajar', teacher ? <Link to={`/pengajar/${teacher.id}`}>{teacher.name}</Link> : '–'],
                ['Tempat', cls.branch === 'online' ? 'Online (Zoom)' : `${branchName(cls.branch)} · ${cls.room}`],
                ['Progres', `${cls.meetingsDone} dari ${cls.meetings} pertemuan`],
                ['Target level', level?.can ?? '–'],
              ]} />
            ) : <p className="muted small">Siswa ini belum masuk kelas (daftar tunggu).</p>}
          </Card>
          {s.note && <Card title="Catatan"><p className="small">{s.note}</p></Card>}
        </div>
      </div>
    </>
  )
}

function NotFoundStudent() {
  return (
    <>
      <PageHeader title="Siswa tidak ditemukan" crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: 'Tidak ditemukan' }]} />
      <Card><EmptyState icon="users" title="ID siswa ini tidak ada" action={<Link className="btn" to="/siswa">Kembali ke daftar siswa</Link>}>Mungkin sudah dihapus, atau alamatnya salah ketik.</EmptyState></Card>
    </>
  )
}

// ---------- Form (new + edit) ----------
type Errors = Partial<Record<string, string>>

function StudentForm({ initial }: { initial?: Student }) {
  const navigate = useNavigate()
  const toast = useToast()
  const classes = useClasses()
  const [lang, setLang] = useState<string>(initial?.lang ?? '')
  const [level, setLevel] = useState(initial?.level ?? '')
  const [branch, setBranch] = useState<string>(initial?.branch ?? 'bdg')
  const [classId, setClassId] = useState(initial?.classId ?? '')
  const [birth, setBirth] = useState(initial?.birth ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const options = classes.filter((c) => c.lang === lang && c.level === level && c.branch === branch)
  const minor = birth ? ageOf(birth) < 17 : false
  const isEdit = Boolean(initial)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '').trim()
    const next: Errors = {}
    if (get('name').length < 3) next.name = 'Nama minimal 3 huruf.'
    if (!get('birth')) next.birth = 'Tanggal lahir wajib diisi.'
    if (!/^(\+62|62|0)8[0-9\s-]{7,14}$/.test(get('phone'))) next.phone = 'Gunakan nomor WhatsApp Indonesia, contoh: 0812 3456 7890.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email'))) next.email = 'Format email belum benar.'
    if (!lang) next.lang = 'Pilih bahasa.'
    if (!level) next.level = 'Pilih level.'
    if (minor && !get('parentName')) next.parentName = 'Nama orang tua/wali wajib untuk siswa di bawah 17 tahun.'
    if (minor && !get('parentPhone')) next.parentPhone = 'Nomor orang tua/wali wajib untuk siswa di bawah 17 tahun.'
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) {
      document.getElementById(`st-${first}`)?.focus()
      return
    }
    const base = {
      name: get('name'), gender: (get('gender') || 'P') as 'P' | 'L', birth: get('birth'), phone: get('phone'), email: get('email'),
      parent: get('parentName') ? { name: get('parentName'), phone: get('parentPhone') } : undefined,
      lang: lang as LangCode, level, program: get('program') || 'General', branch: branch as BranchId, classId,
      source: get('source') || 'Datang langsung', note: get('note') || undefined,
    }
    if (initial) {
      const status = (get('status') || initial.status) as StudentStatus
      update((st) => ({ students: { ...st.students, [initial.id]: { ...st.students[initial.id], ...base, status } } }))
      // Students added in this browser live in `added`; keep that copy in sync too.
      update((st) => ({ added: st.added.map((a) => (a.id === initial.id ? { ...a, ...base, status } : a)) }))
      toast(`Data ${base.name} disimpan.`)
      navigate(`/siswa/${initial.id}`)
      return
    }
    const id = nextStudentId()
    const student: Student = {
      ...base, id, status: 'aktif', joined: isoDate(DEMO_TODAY), attendance: 100,
      scores: { listening: 0, speaking: 0, reading: 0, writing: 0 },
      history: [{ level, start: isoDate(DEMO_TODAY), result: 'berjalan' }],
    }
    update((st) => ({ added: [student, ...st.added] }))
    toast(`${student.name} ditambahkan dengan ID ${id}.`)
    navigate(`/siswa/${id}`)
  }

  const err = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `st-${k}-error` : undefined })

  return (
    <form className="stack-lg" onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && <p className="notice notice-bad" role="alert"><Icon name="alert" size={16} /> <span>Ada {Object.keys(errors).length} isian yang perlu diperbaiki.</span></p>}
      <div className="grid grid-main">
        <div className="stack">
          <Card title="Data diri">
            <div className="form-grid">
              <Field id="st-name" label="Nama lengkap" required error={errors.name} className="span-2">
                <input id="st-name" name="name" className="input" defaultValue={initial?.name} autoComplete="off" {...err('name')} />
              </Field>
              <Field id="st-gender" label="Jenis kelamin">
                <select id="st-gender" name="gender" className="select" defaultValue={initial?.gender ?? 'P'}><option value="P">Perempuan</option><option value="L">Laki-laki</option></select>
              </Field>
              <Field id="st-birth" label="Tanggal lahir" required error={errors.birth} hint={birth ? `Umur ${ageOf(birth)} tahun` : undefined}>
                <input id="st-birth" name="birth" type="date" className="input" value={birth} onChange={(e) => setBirth(e.target.value)} max={isoDate(DEMO_TODAY)} {...err('birth')} />
              </Field>
              <Field id="st-phone" label="Nomor WhatsApp" required error={errors.phone}>
                <input id="st-phone" name="phone" type="tel" inputMode="tel" className="input" defaultValue={initial?.phone} placeholder="0812 3456 7890" {...err('phone')} />
              </Field>
              <Field id="st-email" label="Email" required error={errors.email}>
                <input id="st-email" name="email" type="email" className="input" defaultValue={initial?.email} {...err('email')} />
              </Field>
            </div>
          </Card>
          <Card title="Orang tua / wali" description={minor ? 'Wajib karena siswa berusia di bawah 17 tahun.' : 'Opsional untuk siswa dewasa.'}>
            <div className="form-grid">
              <Field id="st-parentName" label="Nama orang tua/wali" required={minor} error={errors.parentName}>
                <input id="st-parentName" name="parentName" className="input" defaultValue={initial?.parent?.name} {...err('parentName')} />
              </Field>
              <Field id="st-parentPhone" label="WhatsApp orang tua/wali" required={minor} error={errors.parentPhone}>
                <input id="st-parentPhone" name="parentPhone" type="tel" inputMode="tel" className="input" defaultValue={initial?.parent?.phone} {...err('parentPhone')} />
              </Field>
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card title="Program & kelas">
            <div className="stack">
              <Field id="st-lang" label="Bahasa" required error={errors.lang}>
                <select id="st-lang" className="select" value={lang} onChange={(e) => { setLang(e.target.value); setLevel(''); setClassId('') }} {...err('lang')}>
                  <option value="">Pilih bahasa</option>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </Field>
              <Field id="st-level" label="Level" required error={errors.level}>
                <select id="st-level" className="select" value={level} onChange={(e) => { setLevel(e.target.value); setClassId('') }} disabled={!lang} {...err('level')}>
                  <option value="">{lang ? 'Pilih level' : 'Pilih bahasa dulu'}</option>
                  {lang && langByCode(lang).levels.map((l) => <option key={l.code} value={l.code}>{l.code} · {l.name}</option>)}
                </select>
              </Field>
              <Field id="st-program" label="Program">
                <select id="st-program" name="program" className="select" defaultValue={initial?.program ?? 'General'}>
                  {['General', 'Conversation', 'Business English', 'Kids & Teens', 'Privat 1-on-1', 'Persiapan IELTS', 'Persiapan TOEFL', 'Persiapan JLPT', 'Persiapan TOPIK', 'Persiapan HSK', 'Persiapan studi & kerja'].map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field id="st-branch" label="Cabang">
                <select id="st-branch" className="select" value={branch} onChange={(e) => { setBranch(e.target.value); setClassId('') }}>
                  {BRANCH_LIST.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field id="st-class" label="Kelas" hint={lang && level ? `${options.length} kelas cocok. Kosongkan untuk daftar tunggu.` : 'Pilih bahasa dan level dulu.'}>
                <select id="st-class" className="select" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={!level}>
                  <option value="">Daftar tunggu (belum ada kelas)</option>
                  {options.map((c) => <option key={c.id} value={c.id} disabled={c.enrolled >= c.capacity && c.id !== initial?.classId}>{c.name} ({c.enrolled}/{c.capacity})</option>)}
                </select>
              </Field>
              {isEdit && (
                <Field id="st-status" label="Status">
                  <select id="st-status" name="status" className="select" defaultValue={initial?.status}>
                    {STATUS_OPTIONS.slice(1).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </Field>
              )}
              <Field id="st-source" label="Tahu dari mana">
                <select id="st-source" name="source" className="select" defaultValue={initial?.source ?? 'Instagram'}>
                  {['Instagram', 'Google', 'Rekomendasi teman', 'TikTok', 'Situs web', 'Sekolah/kampus', 'Datang langsung'].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field id="st-note" label="Catatan">
                <textarea id="st-note" name="note" className="textarea" rows={3} defaultValue={initial?.note} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
      <div className="row between card panel" style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <Link className="btn btn-ghost" to={initial ? `/siswa/${initial.id}` : '/siswa'}>Batal</Link>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Simpan perubahan' : 'Simpan siswa'}</button>
      </div>
    </form>
  )
}

export function StudentNew() {
  return (
    <>
      <PageHeader title="Tambah siswa" description="Siswa baru langsung berstatus aktif. Data tersimpan di browser ini (demo)." crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: 'Tambah siswa' }]} />
      <StudentForm />
    </>
  )
}

export function StudentEdit() {
  const { id } = useParams()
  const s = useStudent(id)
  if (!s) return <NotFoundStudent />
  return (
    <>
      <PageHeader title={`Edit ${s.name}`} description={s.id} crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: s.name, to: `/siswa/${s.id}` }, { label: 'Edit' }]} />
      <StudentForm initial={s} />
    </>
  )
}

// ---------- CSV import ----------
const SAMPLE_CSV = `nama,bahasa,level,whatsapp,email,cabang
Melati Kusuma,Jepang,N5,0812 0000 1111,melati.kusuma@mail.example,bdg
Rendy Harahap,Inggris,B1,0813 0000 2222,rendy.h@mail.example,jkt
Talitha Sinaga,Korea,TOPIK 1,0812 0000 3333,talitha@mail.example,online
Umar Hakim,Arab,A2,0857 0000 4444,umar.hakim@mail.example,bdg
Baris Tanpa Email,Jerman,A1,0812 0000 5555,,bdg`

interface ImportRow { line: number; name: string; lang?: LangCode; level: string; phone: string; email: string; branch: BranchId; errors: string[] }

function checkRows(text: string): ImportRow[] {
  return parseCsv(text).map((r, i) => {
    const errors: string[] = []
    const langText = (r.bahasa ?? '').toLowerCase()
    const lang = LANGUAGES.find((l) => l.name.toLowerCase() === langText || l.code === langText)?.code
    if (!r.nama || r.nama.length < 3) errors.push('nama kosong')
    if (!lang) errors.push('bahasa tidak dikenal')
    if (lang && !langByCode(lang).levels.some((l) => l.code.toLowerCase() === (r.level ?? '').toLowerCase())) errors.push('level tidak ada')
    if (!/^(\+62|62|0)8[0-9\s-]{7,14}$/.test(r.whatsapp ?? '')) errors.push('nomor WA tidak valid')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email ?? '')) errors.push('email tidak valid')
    const branch = (['bdg', 'jkt', 'online'].includes(r.cabang) ? r.cabang : 'bdg') as BranchId
    const level = lang ? langByCode(lang).levels.find((l) => l.code.toLowerCase() === (r.level ?? '').toLowerCase())?.code ?? '' : ''
    return { line: i + 2, name: r.nama ?? '', lang, level, phone: r.whatsapp ?? '', email: r.email ?? '', branch, errors }
  })
}

export function StudentImport() {
  const toast = useToast()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const rows = useMemo(() => (text.trim() ? checkRows(text) : []), [text])
  const valid = rows.filter((r) => r.errors.length === 0)

  const onFile = async (file: File | undefined) => { if (file) setText(await file.text()) }
  const run = () => {
    const added: Student[] = []
    let next = Number(nextStudentId().slice(2))
    for (const r of valid) {
      const cls = CLASSES.find((c) => c.lang === r.lang && c.level === r.level && c.branch === r.branch)
      added.push({
        id: `S-${String(next++).padStart(4, '0')}`, name: r.name, gender: 'P', birth: '2000-01-01', phone: r.phone, email: r.email,
        lang: r.lang as LangCode, level: r.level, program: 'General', branch: r.branch, classId: cls?.id ?? '', status: 'aktif',
        joined: isoDate(DEMO_TODAY), attendance: 100, scores: { listening: 0, speaking: 0, reading: 0, writing: 0 },
        history: [{ level: r.level, start: isoDate(DEMO_TODAY), result: 'berjalan' }], source: 'Impor CSV',
      })
    }
    update((st) => ({ added: [...added, ...st.added] }))
    toast(`${added.length} siswa diimpor.`)
    navigate('/siswa?q=&status=aktif')
  }

  return (
    <>
      <PageHeader title="Impor siswa dari CSV" description="Kolom wajib: nama, bahasa, level, whatsapp, email. Kolom cabang opsional (bdg, jkt, online)." crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: 'Impor CSV' }]}
        actions={<button type="button" className="btn" onClick={() => downloadText('contoh-impor-siswa.csv', SAMPLE_CSV)}><Icon name="download" size={16} /> Unduh contoh CSV</button>} />
      <div className="grid grid-2">
        <Card title="1. Pilih file atau tempel isi CSV">
          <Field id="csv-file" label="File CSV" hint="Pemisah koma atau titik koma. Baris pertama adalah judul kolom.">
            <input id="csv-file" type="file" accept=".csv,text/csv" className="input" onChange={(e) => onFile(e.target.files?.[0])} />
          </Field>
          <Field id="csv-text" label="Atau tempel isi CSV">
            <textarea id="csv-text" className="textarea mono" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="nama,bahasa,level,whatsapp,email,cabang" />
          </Field>
          <button type="button" className="btn btn-soft" onClick={() => setText(SAMPLE_CSV)}>Isi dengan contoh data</button>
        </Card>
        <Card title="2. Periksa hasil" description={rows.length ? `${valid.length} baris siap diimpor, ${rows.length - valid.length} bermasalah.` : 'Belum ada data.'}>
          {rows.length ? (
            <div className="table-wrap">
              <table className="table table-compact">
                <caption className="sr-only">Pratinjau impor</caption>
                <thead><tr><th scope="col">Baris</th><th scope="col">Nama</th><th scope="col">Bahasa</th><th scope="col">Cek</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.line}>
                      <td>{r.line}</td>
                      <td>{r.name || '–'}</td>
                      <td>{r.lang ? <LangTag code={r.lang} level={r.level} /> : '–'}</td>
                      <td>{r.errors.length ? <Badge tone="bad">{r.errors.join(', ')}</Badge> : <Badge tone="good">OK</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon="upload" title="Tempel CSV atau pilih file">Hasil pengecekan per baris muncul di sini.</EmptyState>}
          <button type="button" className="btn btn-primary" disabled={!valid.length} onClick={run}>Impor {valid.length} siswa</button>
        </Card>
      </div>
    </>
  )
}

// ---------- Certificate ----------
export function Certificate() {
  const { id } = useParams()
  const s = useStudent(id)
  if (!s) return <NotFoundStudent />
  const done = [...s.history].reverse().find((h) => h.result === 'lulus')
  const lang = langByCode(s.lang)
  if (!done) {
    return (
      <>
        <PageHeader title="Sertifikat" crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: s.name, to: `/siswa/${s.id}` }, { label: 'Sertifikat' }]} />
        <Card><EmptyState icon="cert" title="Belum ada level yang selesai" action={<Link className="btn" to={`/siswa/${s.id}`}>Kembali ke profil</Link>}>Sertifikat tersedia setelah siswa lulus ujian akhir level.</EmptyState></Card>
      </>
    )
  }
  const level = lang.levels.find((l) => l.code === done.level)
  const number = `PN/${(done.end ?? '').slice(0, 4)}/${s.lang.toUpperCase()}-${done.level.replace(/\s/g, '')}/${s.id.slice(2)}`
  return (
    <>
      <PageHeader
        title={`Sertifikat ${s.name}`}
        description={`Bahasa ${lang.name} ${done.level} · nomor ${number}`}
        crumbs={[{ label: 'Siswa', to: '/siswa' }, { label: s.name, to: `/siswa/${s.id}` }, { label: 'Sertifikat' }]}
        actions={<button type="button" className="btn btn-primary" onClick={() => window.print()}><Icon name="printer" size={16} /> Cetak / simpan PDF</button>}
      />
      <div className="certificate" aria-label="Pratinjau sertifikat">
        <div className="stack-sm">
          <p className="cert-org">{SCHOOL.name}</p>
          <p className="cert-title">Sertifikat Kelulusan Level</p>
        </div>
        <div className="stack-sm">
          <p className="cert-text">Diberikan kepada</p>
          <p><span className="cert-name">{s.name}</span></p>
          <p className="cert-text">telah menyelesaikan program Bahasa {lang.name} level <b>{done.level} ({level?.name})</b>, setara {level?.cefr.replace('≈ ', '')} pada Common European Framework of Reference, dengan nilai akhir <b>{done.final}</b>.</p>
        </div>
        <div className="cert-meta">
          <div><b>{tanggalPanjang(done.end ?? DEMO_TODAY)}</b>Tanggal kelulusan</div>
          <div className="cert-seal" aria-hidden="true">LULUS</div>
          <div style={{ textAlign: 'right' }}><b>Rina Kartika</b>Direktur · No. {number}</div>
        </div>
      </div>
      <p className="muted small no-print">Contoh sertifikat dari data demo. Ganti nama lembaga dan penandatangan di Pengaturan, Profil lembaga.</p>
    </>
  )
}
