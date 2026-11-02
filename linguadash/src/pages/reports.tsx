import { useMemo } from 'react'
import { Link } from 'react-router'
import { Card, LangTag, PageHeader, Person, Stat } from '../components/ui.tsx'
import { BarChart, Funnel, HBars, LANG_COLOR, LineChart } from '../components/charts.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { CLASSES, MOCK_TESTS, MONTHLY, TEACHERS, mockResults, type Teacher } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, LANG_CODES, langByCode } from '../data/school.ts'
import { bulanPendek, num, pct, rupiah, rupiahShort, tanggal } from '../lib/format.ts'
import { attendanceStats, average, revenueSeries, skillAvg, trialFunnel } from '../lib/selectors.ts'
import { useAllSessions, useInvoices, usePayments, useStudents, useTrials } from '../lib/store.ts'
import { invoiceTotal } from '../data/demo.ts'

const labels = MONTHLY.map((m) => bulanPendek(m.month))
const crumbs = (label: string) => [{ label: 'Laporan' }, { label }]

export function ReportRevenue() {
  const payments = usePayments()
  const students = useStudents()
  const invoices = useInvoices()
  const series = useMemo(() => revenueSeries(payments, students), [payments, students])
  const full = series.slice(0, -1) // complete months only
  const last = full[full.length - 1]
  const prev = full[full.length - 2]
  const growth = ((last.total - prev.total) / Math.max(1, prev.total)) * 100
  const active = students.filter((s) => s.status === 'aktif').length
  const issued = invoices.filter((i) => i.issued >= full[full.length - 3].month && i.issued < series[series.length - 1].month)
  const collected = issued.reduce((s, i) => s + i.paid, 0)
  const billed = issued.reduce((s, i) => s + invoiceTotal(i), 0)
  return (
    <>
      <PageHeader title="Laporan pendapatan" description={`Pembayaran diterima per bulan. Bulan berjalan (${bulanPendek(DEMO_TODAY)}) sampai ${tanggal(DEMO_TODAY)}.`} crumbs={crumbs('Pendapatan')}
        actions={<Link className="btn" to="/keuangan/laporan">Rincian per bahasa & cabang</Link>} />
      <div className="grid grid-4">
        <Stat label={`Pendapatan ${bulanPendek(last.month)}`} value={rupiahShort(last.total)} delta={`${growth >= 0 ? '+' : ''}${pct(growth)}`} good={growth >= 0} hint="vs bulan sebelumnya" />
        <Stat label="Rata-rata 12 bulan" value={rupiahShort(average(full.map((m) => m.total)))} hint="bulan penuh" />
        <Stat label="Pendapatan per siswa aktif" value={rupiahShort(last.total / Math.max(1, active))} hint="per bulan" />
        <Stat label="Tingkat penagihan 3 bulan" value={pct((collected / Math.max(1, billed)) * 100)} hint={`${rupiahShort(collected)} dari ${rupiahShort(billed)}`} />
      </div>
      <Card title="Pendapatan bulanan">
        <LineChart label="Pendapatan bulanan 12 bulan" labels={series.map((m, i) => `${bulanPendek(m.month)}${i === series.length - 1 ? '*' : ''}`)} format={rupiahShort} series={[{ id: 'total', name: 'Total', color: 'var(--accent)', values: series.map((m) => m.total) }]} area />
      </Card>
      <Card title="Komposisi per bahasa">
        <BarChart label="Pendapatan bulanan per bahasa, bertumpuk" labels={series.map((m) => bulanPendek(m.month))} stacked format={rupiahShort} series={LANG_CODES.map((c) => ({ id: c, name: langByCode(c).name, color: LANG_COLOR[c], values: series.map((m) => m.byLang[c]) }))} />
      </Card>
    </>
  )
}

export function ReportRetention() {
  const students = useStudents()
  const last = MONTHLY[MONTHLY.length - 1]
  const byLang = LANGUAGES.map((l) => {
    const list = students.filter((s) => s.lang === l.code)
    const continued = list.filter((s) => s.status === 'aktif' && s.history.length > 1).length
    const eligible = list.filter((s) => s.history.length > 1 || s.status === 'berhenti' || s.status === 'lulus').length
    return { key: l.code, label: l.name, value: eligible ? (continued / eligible) * 100 : 0, color: LANG_COLOR[l.code] }
  })
  const reasons = [['Jadwal bentrok dengan kerja/kuliah', 31], ['Pindah kota', 18], ['Biaya', 17], ['Target tercapai (lulus ujian)', 14], ['Kurang cocok dengan metode', 9], ['Lainnya', 11]] as const
  return (
    <>
      <PageHeader title="Retensi siswa" description="Persentase siswa yang melanjutkan ke level berikutnya setelah menyelesaikan level." crumbs={crumbs('Retensi')} />
      <div className="grid grid-4">
        <Stat label="Retensi bulan ini" value={pct(last.retention, 0)} />
        <Stat label="Rata-rata 12 bulan" value={pct(average(MONTHLY.map((m) => m.retention)))} />
        <Stat label="Siswa berhenti" value={students.filter((s) => s.status === 'berhenti').length} hint="total" />
        <Stat label="Siswa cuti" value={students.filter((s) => s.status === 'cuti').length} hint="bisa kembali" />
      </div>
      <Card title="Retensi bulanan">
        <LineChart label="Retensi bulanan dalam persen" labels={labels} format={(v) => pct(v, 0)} yMax={100} series={[{ id: 'ret', name: 'Retensi', color: 'var(--accent)', values: MONTHLY.map((m) => m.retention) }]} />
      </Card>
      <div className="grid grid-2">
        <Card title="Lanjut level per bahasa"><HBars label="Persentase lanjut level per bahasa" format={(v) => pct(v, 0)} max={100} items={byLang} /></Card>
        <Card title="Alasan berhenti (survei keluar)" description="n = 100 jawaban, data demo"><HBars label="Alasan berhenti" format={(v) => `${v}%`} items={reasons.map(([l, v]) => ({ key: l, label: l, value: v }))} /></Card>
      </div>
    </>
  )
}

export function ReportLevelUp() {
  const students = useStudents()
  const ups = LANG_CODES.map((c) => ({ c, values: MONTHLY.map((m) => students.filter((s) => s.lang === c).reduce((sum, s) => sum + s.history.filter((h) => h.end && h.end.startsWith(m.month.slice(0, 7))).length, 0)) }))
  const finals = students.flatMap((s) => s.history.filter((h) => h.final).map((h) => ({ lang: s.lang, final: h.final ?? 0 })))
  return (
    <>
      <PageHeader title="Laporan kenaikan level" description="Jumlah siswa yang lulus ujian akhir level per bulan." crumbs={crumbs('Kenaikan level')} />
      <div className="grid grid-4">
        <Stat label="Naik level 12 bulan" value={num(MONTHLY.reduce((s, m) => s + m.levelUps, 0))} />
        <Stat label="Bulan ini" value={MONTHLY[MONTHLY.length - 1].levelUps} />
        <Stat label="Rata-rata nilai akhir" value={num(Math.round(average(finals.map((f) => f.final))))} hint="dari 100" />
        <Stat label="Lulus di percobaan pertama" value={pct(92.4)} hint="data demo" />
      </div>
      <Card title="Naik level per bulan per bahasa">
        <BarChart label="Jumlah kenaikan level per bulan, bertumpuk per bahasa" labels={labels} stacked format={(v) => num(Math.round(v))} series={ups.map((u) => ({ id: u.c, name: langByCode(u.c).name, color: LANG_COLOR[u.c], values: u.values }))} />
      </Card>
      <Card title="Rata-rata nilai akhir level per bahasa">
        <HBars label="Rata-rata nilai akhir per bahasa" format={(v) => num(Math.round(v))} max={100} items={LANGUAGES.map((l) => ({ key: l.code, label: l.name, value: average(finals.filter((f) => f.lang === l.code).map((f) => f.final)), color: LANG_COLOR[l.code] }))} />
      </Card>
    </>
  )
}

export function ReportScores() {
  const done = MOCK_TESTS.filter((t) => t.status === 'selesai')
  const rows = done.map((t) => {
    const r = mockResults(t)
    const avg = average(r.map((x) => x.total))
    const pass = r.filter((x) => x.pass).length
    return { t, n: r.length, avg, max: r[0]?.totalMax ?? 0, pass: r.some((x) => x.pass !== undefined) ? (pass / r.length) * 100 : undefined }
  })
  const official = [['TOEFL ITP', '553', 'n = 212'], ['TOEFL iBT', '91', 'n = 38'], ['IELTS', '6,5', 'n = 84'], ['JLPT N4–N2', '81% lulus', 'n = 147'], ['TOPIK II', 'level 3,9', 'n = 96'], ['HSK 4', '231/300', 'n = 41']]
  return (
    <>
      <PageHeader title="Rata-rata skor ujian" description="Hasil mock test di lembaga dan skor ujian resmi yang dilaporkan alumni." crumbs={crumbs('Skor ujian')} />
      <div className="grid grid-3">
        {rows.map((r) => (
          <Stat key={r.t.id} label={`${r.t.exam} · ${tanggal(r.t.date)}`} value={r.t.exam === 'IELTS' ? r.avg.toFixed(1).replace('.', ',') : num(Math.round(r.avg))} hint={`rata-rata dari ${r.t.exam === 'IELTS' ? '9,0' : r.max} · ${r.n} peserta${r.pass !== undefined ? ` · ${pct(r.pass, 0)} lulus` : ''}`} to={`/akademik/mock-test/${r.t.id}`} />
        ))}
      </div>
      <Card title="Mock test: persentase skor rata-rata" description="Skor rata-rata dibagi skor maksimum, supaya ujian berbeda bisa dibandingkan">
        <HBars label="Persentase skor rata-rata per mock test" format={(v) => pct(v, 0)} max={100} items={rows.map((r) => ({ key: r.t.id, label: r.t.exam, value: (r.avg / Math.max(1, r.max)) * 100, color: LANG_COLOR[r.t.lang], sub: r.t.title }))} />
      </Card>
      <Card title="Skor resmi alumni 2025–2026" flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Skor resmi alumni</caption>
            <thead><tr><th scope="col">Ujian</th><th scope="col">Rata-rata</th><th scope="col">Jumlah laporan</th></tr></thead>
            <tbody>{official.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td><td className="muted">{c}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export function ReportTeachers() {
  const sessions = useAllSessions()
  const students = useStudents()
  const rows = useMemo(() => TEACHERS.map((t) => {
    const classes = CLASSES.filter((c) => c.teacherId === t.id)
    const att = attendanceStats(classes.flatMap((c) => sessions.get(c.id) ?? []))
    const own = students.filter((s) => classes.some((c) => c.id === s.classId) && s.status === 'aktif')
    return { t, classes: classes.length, students: own.length, att: att.rate, score: average(own.map(skillAvg)) }
  }), [sessions, students])
  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Pengajar', sort: (r) => r.t.name, render: (r) => <Person name={r.t.name} lang={r.t.lang} to={`/pengajar/${r.t.id}`} sub={r.t.type === 'native' ? 'Native' : 'Lokal'} /> },
    { key: 'lang', header: 'Bahasa', hideSm: true, sort: (r) => r.t.lang, render: (r) => <LangTag code={r.t.lang} /> },
    { key: 'classes', header: 'Kelas', align: 'right', sort: (r) => r.classes, render: (r) => r.classes },
    { key: 'students', header: 'Siswa', align: 'right', sort: (r) => r.students, render: (r) => r.students },
    { key: 'att', header: 'Kehadiran kelas', align: 'right', sort: (r) => r.att, render: (r) => r.classes ? pct(r.att, 0) : '–' },
    { key: 'score', header: 'Nilai siswa', align: 'right', sort: (r) => r.score, render: (r) => r.students ? num(Math.round(r.score)) : '–' },
    { key: 'rating', header: 'Rating', align: 'right', sort: (r) => r.t.rating, render: (r: { t: Teacher }) => `★ ${r.t.rating.toFixed(1).replace('.', ',')}` },
  ]
  return (
    <>
      <PageHeader title="Kinerja pengajar" description="Kehadiran siswa, rata-rata nilai siswa aktif, dan rating ulasan per pengajar." crumbs={crumbs('Kinerja pengajar')} />
      <div className="grid grid-3">
        <Stat label="Rating rata-rata" value={`★ ${average(TEACHERS.map((t) => t.rating)).toFixed(2).replace('.', ',')}`} />
        <Stat label="Native vs lokal (rating)" value={`${average(TEACHERS.filter((t) => t.type === 'native').map((t) => t.rating)).toFixed(2).replace('.', ',')} / ${average(TEACHERS.filter((t) => t.type === 'lokal').map((t) => t.rating)).toFixed(2).replace('.', ',')}`} />
        <Stat label="Siswa per pengajar" value={num(Math.round(average(rows.map((r) => r.students))))} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.t.id} caption="Kinerja pengajar" pageSize={24} initialSort={{ key: 'att', dir: 'desc' }} />
      <p className="muted small">Gunakan laporan ini untuk percakapan pengembangan, bukan satu-satunya dasar keputusan. Kelas pemula biasanya punya nilai lebih tinggi dari kelas mahir.</p>
    </>
  )
}

export function ReportTrials() {
  const trials = useTrials()
  const f90 = trialFunnel(trials, 90)
  const monthly = MONTHLY.map((m) => {
    const list = trials.filter((t) => t.date.startsWith(m.month.slice(0, 7)))
    const attended = list.filter((t) => ['hadir', 'mendaftar', 'tidak-lanjut'].includes(t.status)).length
    const enrolled = list.filter((t) => t.status === 'mendaftar').length
    return { booked: list.length, attended, enrolled, rate: attended ? (enrolled / attended) * 100 : 0 }
  })
  const sources = [...new Set(trials.map((t) => t.source))].map((src) => {
    const list = trials.filter((t) => t.source === src)
    const attended = list.filter((t) => ['hadir', 'mendaftar', 'tidak-lanjut'].includes(t.status)).length
    return { key: src, label: src, value: attended ? (list.filter((t) => t.status === 'mendaftar').length / attended) * 100 : 0, sub: `${list.length} booking` }
  }).sort((a, b) => b.value - a.value)
  const months = MONTHLY.slice(-6)
  return (
    <>
      <PageHeader title="Konversi trial ke pendaftaran" description="Dari booking kelas trial di LinguaDrop sampai menjadi siswa." crumbs={crumbs('Konversi trial')} />
      <div className="grid grid-4">
        <Stat label="Booking 90 hari" value={f90.booked} />
        <Stat label="Hadir" value={f90.attended} hint={pct((f90.attended / Math.max(1, f90.booked)) * 100, 0)} />
        <Stat label="Mendaftar" value={f90.enrolled} />
        <Stat label="Konversi (hadir → daftar)" value={pct(f90.rate)} />
      </div>
      <div className="grid grid-2">
        <Card title="Funnel 90 hari"><Funnel label="Funnel trial 90 hari" steps={[{ label: 'Booking', value: f90.booked }, { label: 'Hadir', value: f90.attended }, { label: 'Mendaftar', value: f90.enrolled }]} /></Card>
        <Card title="Konversi per sumber"><HBars label="Konversi per sumber booking" format={(v) => pct(v, 0)} max={100} items={sources} /></Card>
      </div>
      <Card title="Booking dan pendaftaran per bulan (6 bulan)">
        <BarChart label="Booking, hadir, dan mendaftar per bulan" labels={months.map((m) => bulanPendek(m.month))} format={(v) => num(Math.round(v))} series={[
          { id: 'b', name: 'Booking', color: 'var(--c-en)', values: monthly.slice(-6).map((m) => m.booked) },
          { id: 'a', name: 'Hadir', color: 'var(--c-ja)', values: monthly.slice(-6).map((m) => m.attended) },
          { id: 'e', name: 'Mendaftar', color: 'var(--c-ko)', values: monthly.slice(-6).map((m) => m.enrolled) },
        ]} />
      </Card>
      <p className="muted xs">Rata-rata nilai booking per pendaftar baru: {rupiah(2150000)} (harga level pertama rata-rata, data demo).</p>
    </>
  )
}
