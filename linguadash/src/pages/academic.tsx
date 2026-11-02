import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { LangSelect, LevelSelect, SearchInput, SelectFilter } from '../components/filters.tsx'
import { Badge, Card, Dl, EmptyState, Field, Foreign, LangTag, Modal, PageHeader, Person, Stat, StatusBadge, Tabs, Topic, useToast } from '../components/ui.tsx'
import { BarChart, HBars } from '../components/charts.tsx'
import { CLASSES, SKILLS, SKILL_LABEL, mockResults, teacherById, topicFor, type MockTest, type Scores } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, branchName, langByCode, type LangCode } from '../data/school.ts'
import { isoDate, num, pct, tanggal, tanggalPanjang } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { average } from '../lib/selectors.ts'
import { update, useClasses, useDemoState, useMockTests, useStudents, type Question } from '../lib/store.ts'

// ---------- Curriculum ----------
const FOCUS = ['Listening & speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Speaking']
const BOOKS: Record<LangCode, string> = { en: 'English Pathways', ja: 'Minna no Nihongo', ko: 'Seoul Korean', zh: 'HSK Standard Course', ar: 'Al-Arabiyyah Baina Yadaik', de: 'Netzwerk neu' }

export function Curriculum() {
  const [lang, setLang] = useParam('bahasa', 'en')
  const levels = langByCode(lang).levels
  const [level, setLevel] = useParam('level', levels[0].code)
  const lv = levels.find((l) => l.code === level) ?? levels[0]
  const units = Math.min(12, Math.round(lv.meetings / 2))
  return (
    <>
      <PageHeader title="Kurikulum per level" description={`Bahasa ${langByCode(lang).name} ${lv.code} · ${lv.weeks} minggu · ${lv.meetings} pertemuan · buku ${BOOKS[lang as LangCode]}`} crumbs={[{ label: 'Akademik' }, { label: 'Kurikulum' }]}
        actions={<button type="button" className="btn" onClick={() => window.print()}><Icon name="printer" size={16} /> Cetak silabus</button>} />
      <div className="toolbar">
        <LangSelect id="cur-lang" value={lang} onChange={(v) => { setLang(v); setLevel(langByCode(v).levels[0].code) }} all="" />
        <LevelSelect id="cur-level" value={lv.code} onChange={setLevel} lang={lang} />
      </div>
      <div className="grid grid-4">
        <Stat label="Target CEFR" value={lv.cefr} />
        <Stat label="Unit" value={units} hint={`${lv.meetings} pertemuan`} />
        <Stat label="Ujian" value="2" hint="tengah & akhir level" />
        <Stat label="Harga per level" value={`Rp ${(lv.price / 1e6).toLocaleString('id-ID')} jt`} />
      </div>
      <Card title="Target kemampuan"><p>{lv.can}</p></Card>
      <Card title="Silabus" flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Silabus {lv.code}</caption>
            <thead><tr><th scope="col">Unit</th><th scope="col">Topik</th><th scope="col">Fokus skill</th><th scope="col" className="hide-sm">Pertemuan</th><th scope="col">Penilaian</th></tr></thead>
            <tbody>
              {Array.from({ length: units }, (_, i) => i + 1).map((u) => {
                const per = lv.meetings / units
                const assess = u === Math.ceil(units / 2) ? 'Ujian tengah level' : u === units ? 'Ujian akhir level' : u % 2 === 0 ? 'Kuis' : 'Tugas'
                return (
                  <tr key={u}>
                    <th scope="row">Unit {u}</th>
                    <td><Topic lang={lang as LangCode} text={topicFor(lang as LangCode, u)} /></td>
                    <td className="small">{FOCUS[(u - 1) % FOCUS.length]}</td>
                    <td className="hide-sm small">{Math.round((u - 1) * per) + 1}–{Math.round(u * per)}</td>
                    <td>{assess.startsWith('Ujian') ? <Badge tone="accent">{assess}</Badge> : <span className="small">{assess}</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}


// ---------- Question bank ----------
const SEED_QUESTIONS: Omit<Question, 'id' | 'used'>[] = [
  { lang: 'en', level: 'A2', skill: 'Grammar', type: 'Pilihan ganda', prompt: 'Yesterday I ___ (go) to the market with my sister.', note: 'Past simple kata kerja tak beraturan', difficulty: 'Mudah' },
  { lang: 'en', level: 'B1', skill: 'Listening', type: 'Pilihan ganda', prompt: 'Listen to the announcement. Which platform does the train to Leeds leave from?', note: 'Audio 45 detik, stasiun kereta', difficulty: 'Sedang' },
  { lang: 'en', level: 'B2', skill: 'Writing', type: 'Esai', prompt: 'Some people think public transport should be free. Discuss both views and give your opinion.', note: 'IELTS Task 2, 250 kata', difficulty: 'Sulit' },
  { lang: 'en', level: 'C1', skill: 'Speaking', type: 'Rekaman', prompt: 'Describe a decision you made that changed your career. You have 1 minute to prepare.', note: 'Long turn 2 menit', difficulty: 'Sulit' },
  { lang: 'ja', level: 'N5', skill: 'Reading', type: 'Pilihan ganda', prompt: 'わたしは まいあさ コーヒーを のみます。', note: 'Tentukan arti kalimat: kebiasaan pagi', difficulty: 'Mudah' },
  { lang: 'ja', level: 'N4', skill: 'Grammar', type: 'Isian', prompt: 'ごはんを ___ から、がっこうに いきます。（たべる）', note: 'Bentuk て + から', difficulty: 'Sedang' },
  { lang: 'ja', level: 'N3', skill: 'Listening', type: 'Pilihan ganda', prompt: '会話を聞いて、男の人が明日することを選んでください。', note: 'Choukai: rencana besok', difficulty: 'Sedang' },
  { lang: 'ja', level: 'N2', skill: 'Writing', type: 'Esai', prompt: '「在宅勤務のメリットとデメリット」について400字で書いてください。', note: 'Esai 400 karakter', difficulty: 'Sulit' },
  { lang: 'ko', level: 'TOPIK 1', skill: 'Reading', type: 'Pilihan ganda', prompt: '저는 학생이에요. 학교에 가요.', note: 'Pilih gambar yang sesuai', difficulty: 'Mudah' },
  { lang: 'ko', level: 'TOPIK 2', skill: 'Grammar', type: 'Isian', prompt: '한국에 ___ 싶어요. (가다)', note: 'Pola -고 싶다', difficulty: 'Mudah' },
  { lang: 'ko', level: 'TOPIK 3', skill: 'Writing', type: 'Esai', prompt: '여러분은 휴일에 무엇을 해요? 200~300자로 쓰십시오.', note: 'Menulis 200–300 karakter', difficulty: 'Sedang' },
  { lang: 'ko', level: 'TOPIK 4', skill: 'Listening', type: 'Pilihan ganda', prompt: '다음을 듣고 여자의 중심 생각을 고르십시오.', note: 'Ide utama dialog', difficulty: 'Sulit' },
  { lang: 'zh', level: 'HSK 1', skill: 'Reading', type: 'Pilihan ganda', prompt: '我是印度尼西亚人。', note: 'Pilih terjemahan yang benar', difficulty: 'Mudah' },
  { lang: 'zh', level: 'HSK 2', skill: 'Listening', type: 'Pilihan ganda', prompt: '他昨天几点睡觉？', note: 'Audio: jam tidur', difficulty: 'Mudah' },
  { lang: 'zh', level: 'HSK 3', skill: 'Grammar', type: 'Susun kalimat', prompt: '把 / 书 / 我 / 了 / 放在桌子上', note: 'Kalimat 把', difficulty: 'Sedang' },
  { lang: 'zh', level: 'HSK 4', skill: 'Writing', type: 'Isian', prompt: '看图，用"打扫"造句。', note: 'Buat kalimat dari gambar', difficulty: 'Sedang' },
  { lang: 'ar', level: 'A1', skill: 'Reading', type: 'Pilihan ganda', prompt: 'هذا كتاب جديد.', note: 'Pilih arti yang benar', difficulty: 'Mudah' },
  { lang: 'ar', level: 'A2', skill: 'Grammar', type: 'Isian', prompt: 'أنا ___ إلى المدرسة كل يوم. (ذهب)', note: 'Fi\'il mudhari\' orang pertama', difficulty: 'Sedang' },
  { lang: 'ar', level: 'B1', skill: 'Speaking', type: 'Rekaman', prompt: 'تحدث عن يومك المفضل في الأسبوع.', note: 'Bicara 1 menit', difficulty: 'Sedang' },
  { lang: 'de', level: 'A1', skill: 'Grammar', type: 'Pilihan ganda', prompt: 'Ich ___ aus Indonesien. (kommen)', note: 'Konjugasi Präsens', difficulty: 'Mudah' },
  { lang: 'de', level: 'A2', skill: 'Writing', type: 'Esai', prompt: 'Schreiben Sie eine E-Mail an Ihre Freundin: Sie können am Samstag nicht kommen.', note: 'E-mail 40 kata', difficulty: 'Sedang' },
  { lang: 'de', level: 'B1', skill: 'Listening', type: 'Pilihan ganda', prompt: 'Hören Sie die Durchsage. Wann fährt der Zug nach München ab?', note: 'Pengumuman kereta', difficulty: 'Sedang' },
  { lang: 'de', level: 'B2', skill: 'Speaking', type: 'Rekaman', prompt: 'Diskutieren Sie: Sollte Homeoffice ein Recht für alle sein?', note: 'Diskusi berpasangan', difficulty: 'Sulit' },
]
const BASE_QUESTIONS: Question[] = SEED_QUESTIONS.map((q, i) => ({ ...q, id: `Q-${String(i + 1).padStart(3, '0')}`, used: 3 + ((i * 37) % 41) }))
const SKILL_OPTIONS = ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary']

export function QuestionBank() {
  const state = useDemoState()
  const toast = useToast()
  const [lang, setLang] = useParam('bahasa')
  const [skill, setSkill] = useParam('skill')
  const [q, setQ] = useParam('q')
  const [open, setOpen] = useState(false)
  const all = useMemo(() => [...state.questions, ...BASE_QUESTIONS], [state.questions])
  const rows = all.filter((x) => (!lang || x.lang === lang) && (!skill || x.skill === skill) && (!q || `${x.prompt} ${x.note}`.toLowerCase().includes(q.toLowerCase())))
  const columns: Column<Question>[] = [
    { key: 'id', header: 'ID', sort: (x) => x.id, render: (x) => <span className="mono small">{x.id}</span> },
    { key: 'prompt', header: 'Soal', render: (x) => <span><Foreign lang={x.lang}>{x.prompt}</Foreign><small className="muted block">{x.note}</small></span> },
    { key: 'lang', header: 'Bahasa', sort: (x) => `${x.lang}${x.level}`, render: (x) => <LangTag code={x.lang} level={x.level} /> },
    { key: 'skill', header: 'Skill', sort: (x) => x.skill, render: (x) => x.skill },
    { key: 'type', header: 'Tipe', hideSm: true, sort: (x) => x.type, render: (x) => <span className="small">{x.type}</span> },
    { key: 'diff', header: 'Kesulitan', hideSm: true, sort: (x) => x.difficulty, render: (x) => <Badge tone={x.difficulty === 'Sulit' ? 'bad' : x.difficulty === 'Sedang' ? 'warn' : 'good'}>{x.difficulty}</Badge> },
    { key: 'used', header: 'Dipakai', align: 'right', hideSm: true, sort: (x) => x.used, render: (x) => `${x.used}×` },
  ]
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const prompt = String(fd.get('prompt') ?? '').trim()
    if (!prompt) { (e.currentTarget.elements.namedItem('prompt') as HTMLElement).focus(); return }
    const ql = String(fd.get('lang')) as LangCode
    const question: Question = { id: `Q-${String(all.length + 1).padStart(3, '0')}`, lang: ql, level: String(fd.get('level') || langByCode(ql).levels[0].code), skill: String(fd.get('skill')), type: String(fd.get('type')), prompt, note: String(fd.get('note') ?? ''), difficulty: fd.get('difficulty') as Question['difficulty'], used: 0 }
    update((st) => ({ questions: [question, ...st.questions] }))
    setOpen(false)
    toast(`Soal ${question.id} ditambahkan.`)
  }
  const [newLang, setNewLang] = useState<LangCode>('en')
  return (
    <>
      <PageHeader title="Bank soal" description={`${all.length} soal untuk 6 bahasa dan 4 skill. Teks soal memakai atribut bahasa yang benar.`} crumbs={[{ label: 'Akademik' }, { label: 'Bank soal' }]}
        actions={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Tambah soal</button>} />
      <div className="grid grid-6">
        {SKILL_OPTIONS.map((s) => <Stat key={s} label={s} value={all.filter((x) => x.skill === s).length} />)}
      </div>
      <div className="toolbar">
        <SearchInput id="qb-q" value={q} onChange={setQ} placeholder="Cari teks soal" />
        <LangSelect id="qb-lang" value={lang} onChange={setLang} />
        <SelectFilter id="qb-skill" label="Skill" value={skill} onChange={setSkill} options={[['', 'Semua skill'], ...SKILL_OPTIONS.map((s) => [s, s] as [string, string])]} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(x) => x.id} caption="Bank soal" pageSize={10} />
      <Modal open={open} onClose={() => setOpen(false)} title="Tambah soal" size="lg">
        <form className="stack" onSubmit={add} noValidate id="question-form">
          <div className="form-grid">
            <Field id="qn-lang" label="Bahasa">
              <select id="qn-lang" name="lang" className="select" value={newLang} onChange={(e) => setNewLang(e.target.value as LangCode)}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
            </Field>
            <Field id="qn-level" label="Level"><select id="qn-level" name="level" className="select">{langByCode(newLang).levels.map((l) => <option key={l.code}>{l.code}</option>)}</select></Field>
            <Field id="qn-skill" label="Skill"><select id="qn-skill" name="skill" className="select">{SKILL_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field id="qn-type" label="Tipe"><select id="qn-type" name="type" className="select">{['Pilihan ganda', 'Isian', 'Esai', 'Rekaman', 'Susun kalimat'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field id="qn-prompt" label="Teks soal" required className="span-2"><textarea id="qn-prompt" name="prompt" className="textarea" rows={3} lang={newLang === 'zh' ? 'zh-Hans' : newLang} dir={newLang === 'ar' ? 'rtl' : undefined} /></Field>
            <Field id="qn-note" label="Catatan untuk pengajar (bahasa Indonesia)" className="span-2"><input id="qn-note" name="note" className="input" /></Field>
            <Field id="qn-diff" label="Kesulitan"><select id="qn-diff" name="difficulty" className="select"><option>Mudah</option><option>Sedang</option><option>Sulit</option></select></Field>
          </div>
          <div className="row between"><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan soal</button></div>
        </form>
      </Modal>
    </>
  )
}

// ---------- Mock tests ----------
const EXAMS: { id: MockTest['exam']; lang: LangCode; sections: [string, string][] }[] = [
  { id: 'TOEFL ITP', lang: 'en', sections: [['Listening', '35 menit'], ['Structure', '25 menit'], ['Reading', '55 menit']] },
  { id: 'IELTS', lang: 'en', sections: [['Listening', '30 menit'], ['Reading', '60 menit'], ['Writing', '60 menit'], ['Speaking', '11–14 menit']] },
  { id: 'JLPT N3', lang: 'ja', sections: [['Kosakata & tata bahasa', '30 menit'], ['Tata bahasa & membaca', '70 menit'], ['Mendengar', '40 menit']] },
  { id: 'JLPT N4', lang: 'ja', sections: [['Kosakata', '25 menit'], ['Tata bahasa & membaca', '55 menit'], ['Mendengar', '35 menit']] },
  { id: 'TOPIK II', lang: 'ko', sections: [['Mendengar', '60 menit'], ['Menulis', '50 menit'], ['Membaca', '70 menit']] },
  { id: 'HSK 4', lang: 'zh', sections: [['Mendengar', '30 menit'], ['Membaca', '40 menit'], ['Menulis', '25 menit']] },
]

export function MockTestList() {
  const tests = useMockTests()
  const done = tests.filter((t) => t.status === 'selesai')
  return (
    <>
      <PageHeader title="Mock test" description={`${tests.length} simulasi ujian · ${done.length} selesai`} crumbs={[{ label: 'Akademik' }, { label: 'Mock test' }]}
        actions={<Link className="btn btn-primary" to="/akademik/mock-test/baru"><Icon name="plus" size={16} /> Buat mock test</Link>} />
      <div className="grid grid-3">
        {tests.map((t) => {
          const res = mockResults(t)
          const avg = average(res.map((r) => r.total))
          const passed = res.filter((r) => r.pass).length
          return (
            <Card key={t.id} title={t.title} description={`${t.id} · ${tanggalPanjang(t.date)}`} actions={<StatusBadge status={t.status} />}>
              <Dl items={[['Ujian', <LangTag code={t.lang} level={t.exam} />], ['Peserta', `${t.studentIds.length} siswa`], ['Rata-rata', res.length ? (t.exam === 'IELTS' ? avg.toFixed(1).replace('.', ',') : num(Math.round(avg))) : '–'], ...(res.some((r) => r.pass !== undefined) ? [['Lulus/target', `${passed}/${res.length}`] as [string, string]] : [])]} />
              <Link className="btn btn-sm" to={`/akademik/mock-test/${t.id}`}>{t.status === 'selesai' ? 'Lihat hasil' : 'Lihat detail'}</Link>
            </Card>
          )
        })}
      </div>
    </>
  )
}

export function MockTestNew() {
  const navigate = useNavigate()
  const toast = useToast()
  const classes = useClasses()
  const students = useStudents()
  const [exam, setExam] = useState<MockTest['exam']>('TOEFL ITP')
  const spec = EXAMS.find((e) => e.id === exam) ?? EXAMS[0]
  const [picked, setPicked] = useState<string[]>([])
  const [error, setError] = useState<Record<string, string>>({})
  useEffect(() => setPicked([]), [exam])
  const eligible = classes.filter((c) => c.lang === spec.lang)
  const participants = students.filter((s) => s.status === 'aktif' && picked.includes(s.classId))
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const title = String(fd.get('title') ?? '').trim()
    const date = String(fd.get('date') ?? '')
    const next: Record<string, string> = {}
    if (title.length < 4) next.title = 'Judul minimal 4 karakter.'
    if (!date) next.date = 'Pilih tanggal.'
    if (!picked.length) next.classes = 'Pilih minimal satu kelas peserta.'
    setError(next)
    if (Object.keys(next).length) { document.getElementById(next.title ? 'mt-title' : next.date ? 'mt-date' : 'mt-classes')?.focus(); return }
    const test: MockTest = { id: `MT-${310 + Math.floor(Math.random() * 600)}`, exam, lang: spec.lang, date, title, status: 'terjadwal', studentIds: participants.map((s) => s.id) }
    update((st) => ({ mockTests: [test, ...st.mockTests] }))
    toast(`${title} dijadwalkan untuk ${participants.length} siswa.`)
    navigate('/akademik/mock-test')
  }
  return (
    <>
      <PageHeader title="Buat mock test" description="Simulasi ujian dengan format dan waktu seperti ujian resmi." crumbs={[{ label: 'Mock test', to: '/akademik/mock-test' }, { label: 'Buat baru' }]} />
      <form className="grid grid-main" onSubmit={submit} noValidate>
        <div className="stack">
          <Card title="Jenis ujian">
            <fieldset>
              <legend className="sr-only">Pilih ujian</legend>
              <div className="choices">
                {EXAMS.map((x) => (
                  <label key={x.id} className="choice"><input type="radio" name="exam" value={x.id} checked={exam === x.id} onChange={() => setExam(x.id)} /><span>{x.id}<small>Bahasa {langByCode(x.lang).name} · {x.sections.length} bagian</small></span></label>
                ))}
              </div>
            </fieldset>
          </Card>
          <Card title="Detail">
            <div className="form-grid">
              <Field id="mt-title" label="Judul" required error={error.title} className="span-2"><input id="mt-title" name="title" className="input" defaultValue={`Simulasi ${exam} · ${tanggal(DEMO_TODAY)}`} key={exam} aria-invalid={error.title ? true : undefined} /></Field>
              <Field id="mt-date" label="Tanggal" required error={error.date}><input id="mt-date" name="date" type="date" className="input" min={isoDate(DEMO_TODAY)} aria-invalid={error.date ? true : undefined} /></Field>
              <Field id="mt-time" label="Jam mulai"><input id="mt-time" name="time" type="time" className="input" defaultValue="08:30" /></Field>
              <Field id="mt-place" label="Tempat" className="span-2"><select id="mt-place" name="place" className="select"><option>Bandung – Dago, Lab Listening</option><option>Jakarta – Tebet, Ruang Oxford</option><option>Online (pengawasan kamera)</option></select></Field>
            </div>
          </Card>
          <Card title="Kelas peserta" description={`Kelas Bahasa ${langByCode(spec.lang).name}`}>
            <fieldset id="mt-classes" tabIndex={-1} aria-describedby={error.classes ? 'mt-classes-error' : undefined}>
              <legend className="sr-only">Pilih kelas peserta</legend>
              <div className="choices" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {eligible.map((c) => (
                  <label key={c.id} className="choice"><input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id)))} /><span>{c.id} · {c.level}<small>{c.name.split('·')[1]} · {c.enrolled} siswa · {branchName(c.branch)}</small></span></label>
                ))}
              </div>
              {error.classes && <p className="error" id="mt-classes-error" role="alert">{error.classes}</p>}
            </fieldset>
          </Card>
        </div>
        <Card title="Ringkasan">
          <Dl items={[['Ujian', exam], ['Bagian', spec.sections.map(([n, d]) => `${n} (${d})`).join(', ')], ['Peserta', `${participants.length} siswa dari ${picked.length} kelas`]]} />
          <button type="submit" className="btn btn-primary btn-block">Jadwalkan mock test</button>
          <Link className="btn btn-ghost btn-block" to="/akademik/mock-test">Batal</Link>
        </Card>
      </form>
    </>
  )
}

export function MockTestResult() {
  const { id } = useParams()
  const tests = useMockTests()
  const students = useStudents()
  const test = tests.find((t) => t.id === id)
  if (!test) {
    return (<><PageHeader title="Mock test tidak ditemukan" crumbs={[{ label: 'Mock test', to: '/akademik/mock-test' }, { label: 'Tidak ditemukan' }]} /><Card><EmptyState icon="academic" title="ID mock test tidak ada" action={<Link className="btn" to="/akademik/mock-test">Kembali</Link>} /></Card></>)
  }
  const results = mockResults(test)
  const byId = new Map(students.map((s) => [s.id, s]))
  const ielts = test.exam === 'IELTS'
  const fmt = (v: number) => (ielts ? v.toFixed(1).replace('.', ',') : num(Math.round(v)))
  const sectionNames = results[0]?.sections.map((s) => s.name) ?? []
  const avgSections = sectionNames.map((name, i) => ({ name, value: average(results.map((r) => r.sections[i].score)), max: results[0].sections[i].max }))
  const buckets = ielts ? ['≤5,0', '5,5', '6,0', '6,5', '7,0+'] : ['< 40%', '40–54%', '55–69%', '70–84%', '≥ 85%']
  const counts = buckets.map(() => 0)
  for (const r of results) {
    const idx = ielts ? (r.total <= 5 ? 0 : r.total === 5.5 ? 1 : r.total === 6 ? 2 : r.total === 6.5 ? 3 : 4) : Math.min(4, Math.max(0, Math.floor(((r.total / r.totalMax) * 100 - 25) / 15)))
    counts[idx]++
  }
  return (
    <>
      <PageHeader title={test.title} description={`${test.id} · ${test.exam} · ${tanggalPanjang(test.date)}`} crumbs={[{ label: 'Mock test', to: '/akademik/mock-test' }, { label: test.id }]}
        actions={<button type="button" className="btn" onClick={() => window.print()}><Icon name="printer" size={16} /> Cetak hasil</button>} />
      {results.length === 0 ? (
        <Card><EmptyState icon="clock" title="Mock test belum dilaksanakan">{`Terjadwal ${tanggalPanjang(test.date)} untuk ${test.studentIds.length} siswa. Hasil muncul setelah nilai diinput.`}</EmptyState></Card>
      ) : (
        <>
          <div className="grid grid-4">
            <Stat label="Peserta" value={results.length} />
            <Stat label="Rata-rata skor" value={fmt(average(results.map((r) => r.total)))} hint={`dari ${ielts ? '9,0' : results[0].totalMax}`} />
            <Stat label="Skor tertinggi" value={fmt(Math.max(...results.map((r) => r.total)))} />
            <Stat label={results.some((r) => r.pass !== undefined) ? 'Lulus / capai target' : 'Prediksi rata-rata'} value={results.some((r) => r.pass !== undefined) ? pct((results.filter((r) => r.pass).length / results.length) * 100, 0) : results[Math.floor(results.length / 2)].predicted} />
          </div>
          <div className="grid grid-2">
            <Card title="Rata-rata per bagian">
              <HBars label="Rata-rata skor per bagian" format={fmt} items={avgSections.map((s) => ({ key: s.name, label: s.name, value: s.value, sub: `dari ${s.max}` }))} max={Math.max(...avgSections.map((s) => s.max))} />
            </Card>
            <Card title="Sebaran skor">
              <BarChart label="Jumlah peserta per rentang skor" labels={buckets} labelHeader="Rentang" series={[{ id: 'n', name: 'Peserta', color: 'var(--accent)', values: counts }]} format={(v) => num(Math.round(v))} height={200} valueLabels />
            </Card>
          </div>
          <Card title="Skor per peserta & prediksi skor resmi" flush>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Hasil mock test per peserta</caption>
                <thead><tr><th scope="col">Peserta</th>{sectionNames.map((n) => <th key={n} scope="col" className="num">{n}</th>)}<th scope="col" className="num">Total</th><th scope="col">Prediksi</th></tr></thead>
                <tbody>
                  {[...results].sort((a, b) => b.total - a.total).map((r) => {
                    const s = byId.get(r.studentId)
                    return (
                      <tr key={r.studentId}>
                        <td>{s ? <Person name={s.name} lang={s.lang} to={`/siswa/${s.id}`} sub={s.classId} /> : r.studentId}</td>
                        {r.sections.map((x) => <td key={x.name} className="num">{fmt(x.score)}</td>)}
                        <td className="num"><b>{fmt(r.total)}</b></td>
                        <td>{r.pass === undefined ? <span className="nowrap">{r.predicted}</span> : <Badge tone={r.pass ? 'good' : 'bad'}>{r.predicted}</Badge>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="muted small">Prediksi memakai rentang galat dari selisih mock test dan skor resmi alumni sebelumnya (data demo). Bukan jaminan skor ujian resmi.</p>
        </>
      )}
    </>
  )
}

// ---------- Grade input ----------
type GradeRow = Scores & { id: string }
export function GradeInput() {
  const toast = useToast()
  const students = useStudents()
  const [classId, setClassId] = useParam('kelas', CLASSES[0].id)
  const cls = CLASSES.find((c) => c.id === classId) ?? CLASSES[0]
  const members = useMemo(() => students.filter((s) => s.classId === cls.id && s.status === 'aktif'), [students, cls.id])
  const [type, setType] = useState('Ujian tengah level')
  const [rows, setRows] = useState<GradeRow[]>([])
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState('')
  useEffect(() => { setRows(members.map((s) => ({ id: s.id, ...s.scores }))); setErrors({}) }, [members])
  const setScore = (id: string, skill: keyof Scores, value: string) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [skill]: value === '' ? Number.NaN : Number(value) } : x)))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const bad: Record<string, boolean> = {}
    for (const r of rows) for (const k of SKILLS) if (!(r[k] >= 0 && r[k] <= 100)) bad[`${r.id}-${k}`] = true
    setErrors(bad)
    const first = Object.keys(bad)[0]
    if (first) { document.getElementById(`g-${first}`)?.focus(); return }
    update((st) => ({ grades: [...st.grades, ...rows.map((r) => ({ studentId: r.id, classId: cls.id, type, date: isoDate(DEMO_TODAY), scores: { listening: r.listening, speaking: r.speaking, reading: r.reading, writing: r.writing } }))] }))
    setSaved(`${type} untuk ${rows.length} siswa`)
    toast(`Nilai ${type.toLowerCase()} ${cls.id} disimpan untuk ${rows.length} siswa.`)
  }
  const avgOf = (r: GradeRow) => Math.round((r.listening + r.speaking + r.reading + r.writing) / 4)
  const pass = (r: GradeRow) => avgOf(r) >= 70 && SKILLS.every((k) => r[k] >= 60)
  return (
    <>
      <PageHeader title="Input nilai 4 skill" description="Skala 0–100. Lulus level: rata-rata minimal 70 dan setiap skill minimal 60." crumbs={[{ label: 'Akademik' }, { label: 'Input nilai' }]}
        actions={<Link className="btn" to="/akademik/rubrik"><Icon name="rubric" size={16} /> Rubrik penilaian</Link>} />
      <form className="stack" onSubmit={submit} noValidate>
        <Card>
          <div className="form-grid">
            <Field id="g-class" label="Kelas">
              <select id="g-class" className="select" value={cls.id} onChange={(e) => { setClassId(e.target.value); setSaved('') }}>
                {LANGUAGES.map((l) => <optgroup key={l.code} label={`Bahasa ${l.name}`}>{CLASSES.filter((c) => c.lang === l.code).map((c) => <option key={c.id} value={c.id}>{c.id} · {c.name}</option>)}</optgroup>)}
              </select>
            </Field>
            <Field id="g-type" label="Jenis penilaian">
              <select id="g-type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Kuis</option><option>Ujian tengah level</option><option>Ujian akhir level</option><option>Remedial</option>
              </select>
            </Field>
          </div>
        </Card>
        <Card title={cls.name} description={`${members.length} siswa · pengajar ${teacherById(cls.teacherId)?.name}`} flush>
          {Object.keys(errors).length > 0 && <p className="notice notice-bad" role="alert" style={{ margin: 'var(--space-4) var(--space-5) 0' }}>Ada {Object.keys(errors).length} nilai di luar rentang 0–100.</p>}
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Input nilai kelas {cls.id}</caption>
              <thead><tr><th scope="col">Siswa</th>{SKILLS.map((k) => <th key={k} scope="col" className="num">{SKILL_LABEL[k]}</th>)}<th scope="col" className="num">Rata-rata</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const s = members.find((m) => m.id === r.id)
                  return (
                    <tr key={r.id}>
                      <td>{s && <Person name={s.name} lang={s.lang} sub={s.id} />}</td>
                      {SKILLS.map((k) => (
                        <td key={k} className="num">
                          <label className="sr-only" htmlFor={`g-${r.id}-${k}`}>{SKILL_LABEL[k]} {s?.name}</label>
                          <input id={`g-${r.id}-${k}`} className="input cell-input" type="number" min={0} max={100} inputMode="numeric" value={Number.isNaN(r[k]) ? '' : r[k]} onChange={(e) => setScore(r.id, k, e.target.value)} aria-invalid={errors[`${r.id}-${k}`] ? true : undefined} />
                        </td>
                      ))}
                      <td className="num"><b>{Number.isNaN(avgOf(r)) ? '–' : avgOf(r)}</b></td>
                      <td>{pass(r) ? <Badge tone="good">Lulus</Badge> : <Badge tone="warn">Remedial</Badge>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="row between">
          {saved ? <p className="notice notice-good" role="status"><Icon name="check" size={16} /> <span>Tersimpan: {saved}. <Link to={`/siswa/${rows[0]?.id ?? ''}`}>Lihat di profil siswa</Link></span></p> : <span className="muted small">Nilai tersimpan di browser ini dan langsung tampil di profil siswa.</span>}
          <button type="submit" className="btn btn-primary">Simpan nilai</button>
        </div>
      </form>
    </>
  )
}

// ---------- Rubrics ----------
const RUBRICS: Record<'speaking' | 'writing', { criteria: string; bands: [string, string, string, string, string] }[]> = {
  speaking: [
    { criteria: 'Kelancaran & koherensi', bands: ['Banyak jeda, sulit dipahami', 'Jeda sering, ide terputus', 'Cukup lancar, kadang ragu', 'Lancar dengan sedikit jeda', 'Lancar, runtut, alami'] },
    { criteria: 'Kosakata', bands: ['Sangat terbatas', 'Dasar, sering salah pilih', 'Cukup untuk topik umum', 'Bervariasi, ada ungkapan', 'Luas dan tepat konteks'] },
    { criteria: 'Tata bahasa', bands: ['Hampir semua salah', 'Kalimat sederhana, banyak salah', 'Campur sederhana dan kompleks', 'Kompleks dengan sedikit salah', 'Akurat dan bervariasi'] },
    { criteria: 'Pelafalan', bands: ['Sulit dipahami', 'Sering mengganggu', 'Dapat dipahami', 'Jelas, intonasi baik', 'Sangat jelas dan natural'] },
  ],
  writing: [
    { criteria: 'Pemenuhan tugas', bands: ['Tidak menjawab tugas', 'Sebagian kecil terjawab', 'Terjawab, ide kurang berkembang', 'Terjawab lengkap', 'Lengkap dan mendalam'] },
    { criteria: 'Organisasi', bands: ['Tidak terstruktur', 'Paragraf tidak jelas', 'Struktur dasar ada', 'Runtut dengan penghubung', 'Sangat runtut dan kohesif'] },
    { criteria: 'Kosakata', bands: ['Sangat terbatas', 'Berulang', 'Memadai', 'Bervariasi', 'Kaya dan tepat'] },
    { criteria: 'Tata bahasa & ejaan', bands: ['Kesalahan menghalangi makna', 'Banyak kesalahan', 'Ada kesalahan, makna jelas', 'Sedikit kesalahan', 'Hampir tanpa kesalahan'] },
  ],
}

export function Rubrics() {
  const [tab, setTab] = useState<'speaking' | 'writing'>('speaking')
  return (
    <>
      <PageHeader title="Rubrik penilaian" description="Skor 1–5 per kriteria, dikonversi ke 0–100 (skor × 20). Dipakai untuk ujian level dan mock test." crumbs={[{ label: 'Akademik' }, { label: 'Rubrik' }]} />
      <Tabs label="Jenis rubrik" value={tab} onChange={setTab} tabs={[{ id: 'speaking', label: 'Speaking' }, { id: 'writing', label: 'Writing' }]} />
      <Card flush>
        <div className="table-wrap" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <table className="table">
            <caption className="sr-only">Rubrik {tab}</caption>
            <thead><tr><th scope="col">Kriteria</th>{[1, 2, 3, 4, 5].map((b) => <th key={b} scope="col">Skor {b}</th>)}</tr></thead>
            <tbody>
              {RUBRICS[tab].map((r) => (
                <tr key={r.criteria}><th scope="row">{r.criteria}</th>{r.bands.map((b, i) => <td key={i} className="small">{b}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Contoh perhitungan">
        <p className="small">Kelancaran 4 + Kosakata 3 + Tata bahasa 3 + Pelafalan 4 = 14 dari 20, jadi nilai {SKILL_LABEL[tab]} = 14 × 5 = <b>70</b>.</p>
      </Card>
    </>
  )
}

// ---------- Level promotion ----------
export function Promotions() {
  const toast = useToast()
  const state = useDemoState()
  const students = useStudents()
  const [lang, setLang] = useParam('bahasa')
  const candidates = useMemo(() => students.filter((s) => {
    const c = CLASSES.find((x) => x.id === s.classId)
    return s.status === 'aktif' && c && c.meetingsDone / c.meetings >= 0.7 && (!lang || s.lang === lang)
  }).map((s) => {
    const avg = Math.round((s.scores.listening + s.scores.speaking + s.scores.reading + s.scores.writing) / 4)
    const minSkill = Math.min(...SKILLS.map((k) => s.scores[k]))
    const levels = langByCode(s.lang).levels
    const idx = levels.findIndex((l) => l.code === s.level)
    const original = state.promotions[s.id] ? levels[Math.max(0, idx - 1)].code : s.level
    const next = levels[Math.min(levels.length - 1, levels.findIndex((l) => l.code === original) + 1)].code
    const eligible = avg >= 70 && minSkill >= 60 && s.attendance >= 75 && next !== original
    return { s, avg, minSkill, next, original, eligible, promoted: Boolean(state.promotions[s.id]) }
  }), [students, lang, state.promotions])
  type Row = (typeof candidates)[number]
  const promote = (rows: Row[]) => {
    const list = rows.filter((r) => r.eligible && !r.promoted)
    if (!list.length) return
    update((st) => ({ promotions: { ...st.promotions, ...Object.fromEntries(list.map((r) => [r.s.id, r.next])) } }))
    toast(list.length === 1 ? `${list[0].s.name} naik ke ${list[0].next}.` : `${list.length} siswa naik level.`)
  }
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Siswa', sort: (r) => r.s.name, render: (r) => <Person name={r.s.name} lang={r.s.lang} to={`/siswa/${r.s.id}`} sub={r.s.classId} /> },
    { key: 'level', header: 'Level', sort: (r) => r.original, render: (r) => <span className="nowrap"><LangTag code={r.s.lang} level={r.original} /> → <b>{r.next}</b></span> },
    { key: 'avg', header: 'Rata-rata', align: 'right', sort: (r) => r.avg, render: (r) => r.avg },
    { key: 'min', header: 'Skill terendah', align: 'right', hideSm: true, sort: (r) => r.minSkill, render: (r) => r.minSkill },
    { key: 'att', header: 'Hadir', align: 'right', hideSm: true, sort: (r) => r.s.attendance, render: (r) => `${r.s.attendance}%` },
    { key: 'status', header: 'Rekomendasi', sort: (r) => (r.promoted ? 2 : r.eligible ? 1 : 0), render: (r) => r.promoted ? <Badge tone="accent">Sudah naik</Badge> : r.eligible ? <Badge tone="good">Layak naik</Badge> : <Badge tone="warn">Remedial</Badge> },
    { key: 'act', header: <span className="sr-only">Aksi</span>, render: (r) => r.eligible && !r.promoted ? <button type="button" className="btn btn-sm btn-primary" onClick={() => promote([r])}>Naikkan</button> : null },
  ]
  const ready = candidates.filter((r) => r.eligible && !r.promoted)
  return (
    <>
      <PageHeader title="Kenaikan level" description="Siswa di kelas yang sudah melewati 70% pertemuan. Syarat: rata-rata ≥ 70, tiap skill ≥ 60, kehadiran ≥ 75%." crumbs={[{ label: 'Akademik' }, { label: 'Kenaikan level' }]}
        actions={<button type="button" className="btn btn-primary" disabled={!ready.length} onClick={() => promote(ready)}><Icon name="level" size={16} /> Naikkan {ready.length} siswa layak</button>} />
      <div className="grid grid-4">
        <Stat label="Kandidat" value={candidates.length} />
        <Stat label="Layak naik" value={candidates.filter((r) => r.eligible).length} />
        <Stat label="Perlu remedial" value={candidates.filter((r) => !r.eligible).length} />
        <Stat label="Sudah dinaikkan" value={Object.keys(state.promotions).length} />
      </div>
      <div className="toolbar"><LangSelect id="pr-lang" value={lang} onChange={setLang} /></div>
      <DataTable rows={candidates} columns={columns} rowKey={(r) => r.s.id} caption="Kandidat kenaikan level" pageSize={12} initialSort={{ key: 'status', dir: 'desc' }} />
    </>
  )
}
