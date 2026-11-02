import { useMemo } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { Card, LangTag, PageHeader, Person, Stat, StatusBadge } from '../components/ui.tsx'
import { BarChart, Funnel, HBars, LANG_COLOR, LineChart, Sparkline } from '../components/charts.tsx'
import { CLASSES, MONTHLY, TEACHERS } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, LANG_CODES, branchName } from '../data/school.ts'
import { addDays, bulanPendek, isoDate, num, pct, rupiah, rupiahShort, startOfWeek, tanggal, tanggalPanjang, tanggalPendek } from '../lib/format.ts'
import { arrears, attendanceStats, revenueSeries, sessionsBetween, sumPayments, trialFunnel, waLink } from '../lib/selectors.ts'
import { useAllSessions, useInvoices, usePayments, useStudents, useTrials } from '../lib/store.ts'

export function Overview() {
  const students = useStudents()
  const invoices = useInvoices()
  const payments = usePayments()
  const trials = useTrials()
  const sessions = useAllSessions()

  const data = useMemo(() => {
    const active = students.filter((s) => s.status === 'aktif')
    const lastMonthActive = active.filter((s) => s.joined < isoDate(addDays(DEMO_TODAY, -30))).length
    const monthStart = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1)
    const prevStart = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth() - 1, 1)
    const prevSameDay = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth() - 1, DEMO_TODAY.getDate())
    const revenueMtd = sumPayments(payments, monthStart, DEMO_TODAY)
    const revenuePrev = sumPayments(payments, prevStart, prevSameDay)
    const arr = arrears(invoices, students)
    const arrTotal = arr.reduce((s, a) => s + a.due, 0)
    const att30 = attendanceStats(sessionsBetween(sessions, addDays(DEMO_TODAY, -30), DEMO_TODAY))
    const attPrev = attendanceStats(sessionsBetween(sessions, addDays(DEMO_TODAY, -60), addDays(DEMO_TODAY, -31)))
    const funnel = trialFunnel(trials, 90)
    const funnelPrev = trialFunnel(trials.filter((t) => t.date < isoDate(addDays(DEMO_TODAY, -90))), 90, addDays(DEMO_TODAY, -90))
    // Level-ups in the last 30 days vs the 30 days before (finished levels in each student's history).
    const countEnds = (from: Date, to: Date) => students.reduce((sum, s) => sum + s.history.filter((h) => h.end && h.end >= isoDate(from) && h.end <= isoDate(to)).length, 0)
    const levelUpsThisMonth = countEnds(addDays(DEMO_TODAY, -29), DEMO_TODAY)
    const levelUpsPrev = countEnds(addDays(DEMO_TODAY, -59), addDays(DEMO_TODAY, -30))
    const revenue = revenueSeries(payments, students)
    // Weekly attendance rate for the last 10 weeks.
    const weekStart = startOfWeek(DEMO_TODAY)
    const weeks = Array.from({ length: 10 }, (_, i) => addDays(weekStart, (i - 9) * 7))
    const weekly = weeks.map((w) => attendanceStats(sessionsBetween(sessions, w, addDays(w, 6))).rate)
    const todayClasses = CLASSES.filter((c) => c.days.includes(DEMO_TODAY.getDay())).sort((a, b) => a.start.localeCompare(b.start))
    // Students enrolled at the end of each month: joined by then and not yet finished or dropped.
    const activeTrend = MONTHLY.map((m) => {
      const end = isoDate(new Date(new Date(m.month).getFullYear(), new Date(m.month).getMonth() + 1, 0))
      return students.filter((s) => s.joined <= end && (s.status === 'aktif' || s.status === 'cuti' || (s.history[s.history.length - 1].start > end))).length
    })
    const upcomingTrials = trials.filter((t) => t.status === 'terjadwal').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
    return { activeTrend, active, lastMonthActive, revenueMtd, revenuePrev, arr, arrTotal, att30, attPrev, funnel, funnelPrev, levelUpsThisMonth, levelUpsPrev, revenue, weeks, weekly, todayClasses, upcomingTrials }
  }, [students, invoices, payments, trials, sessions])

  const delta = (now: number, prev: number) => (prev ? ((now - prev) / prev) * 100 : 0)
  const revDelta = delta(data.revenueMtd, data.revenuePrev)
  const months = data.revenue.map((r, i) => `${bulanPendek(r.month)}${i === data.revenue.length - 1 ? '*' : ''}`)

  return (
    <>
      <PageHeader
        title="Overview"
        description={`${tanggalPanjang(DEMO_TODAY)} · Semua cabang · data demo fiktif`}
        actions={
          <>
            <Link className="btn" to="/keuangan/invoice/baru"><Icon name="file" size={16} /> Buat invoice</Link>
            <Link className="btn btn-primary" to="/siswa/baru"><Icon name="plus" size={16} /> Tambah siswa</Link>
          </>
        }
      />

      <div className="grid grid-6">
        <Stat label="Siswa aktif" icon="users" value={num(data.active.length)} delta={`+${data.active.length - data.lastMonthActive}`} good hint="vs 30 hari lalu" to="/siswa?status=aktif">
          <Sparkline values={data.activeTrend} label="Tren siswa aktif 12 bulan" />
        </Stat>
        <Stat label="Pendapatan bulan ini" icon="wallet" value={rupiahShort(data.revenueMtd)} delta={`${revDelta >= 0 ? '+' : ''}${pct(revDelta)}`} good={revDelta >= 0} hint={`s.d. ${tanggalPendek(DEMO_TODAY)}`} to="/keuangan/laporan">
          <Sparkline values={data.revenue.slice(0, -1).map((r) => r.total)} label="Pendapatan 11 bulan terakhir" />
        </Stat>
        <Stat label="Tunggakan" icon="alert" value={rupiahShort(data.arrTotal)} hint={`${data.arr.length} invoice lewat jatuh tempo`} to="/keuangan/tunggakan" />
        <Stat label="Kehadiran 30 hari" icon="attendance" value={pct(data.att30.rate)} delta={`${data.att30.rate - data.attPrev.rate >= 0 ? '+' : ''}${pct(data.att30.rate - data.attPrev.rate)} poin`} good={data.att30.rate >= data.attPrev.rate} to="/absensi/rekap-kelas" />
        <Stat label="Naik level (30 hari)" icon="level" value={num(data.levelUpsThisMonth)} hint={`30 hari sebelumnya: ${data.levelUpsPrev}`} to="/laporan/kenaikan-level" />
        <Stat label="Konversi trial (90 hari)" icon="trial" value={pct(data.funnel.rate)} delta={`${data.funnel.rate - data.funnelPrev.rate >= 0 ? '+' : ''}${pct(data.funnel.rate - data.funnelPrev.rate)} poin`} good={data.funnel.rate >= data.funnelPrev.rate} to="/laporan/konversi-trial" />
      </div>

      <div className="grid grid-main">
        <Card title="Pendapatan 12 bulan per bahasa" description="Pembayaran yang diterima. *Bulan berjalan sampai hari ini." actions={<Link className="btn btn-sm" to="/laporan/pendapatan">Laporan</Link>}>
          <BarChart
            label="Grafik batang bertumpuk pendapatan per bulan per bahasa"
            labels={months}
            stacked
            format={rupiahShort}
            series={LANG_CODES.map((c) => ({ id: c, name: LANGUAGES.find((l) => l.code === c)!.name, color: LANG_COLOR[c], values: data.revenue.map((r) => r.byLang[c]) }))}
            height={260}
          />
        </Card>
        <Card title="Siswa aktif per bahasa" description={`${num(data.active.length)} siswa di 3 lokasi`} actions={<Link className="btn btn-sm" to="/siswa">Semua</Link>}>
          <HBars
            label="Jumlah siswa aktif per bahasa"
            format={num}
            items={LANGUAGES.map((l) => ({ key: l.code, label: l.name, value: data.active.filter((s) => s.lang === l.code).length, color: LANG_COLOR[l.code], sub: l.track })).sort((a, b) => b.value - a.value)}
          />
        </Card>
      </div>

      <div className="grid grid-3">
        <Card title="Trial ke pendaftaran" description="90 hari terakhir" actions={<Link className="btn btn-sm" to="/trial">Booking</Link>}>
          <Funnel label="Funnel trial: booking, hadir, mendaftar" steps={[{ label: 'Booking trial', value: data.funnel.booked }, { label: 'Hadir di kelas trial', value: data.funnel.attended }, { label: 'Mendaftar', value: data.funnel.enrolled }]} />
        </Card>
        <Card title="Tingkat kehadiran mingguan" description="10 minggu terakhir, semua kelas">
          <LineChart label="Grafik garis tingkat kehadiran per minggu" labels={data.weeks.map((w) => tanggalPendek(w))} labelHeader="Minggu mulai" series={[{ id: 'att', name: 'Kehadiran', color: 'var(--accent)', values: data.weekly }]} format={(v) => pct(v, 0)} yMax={100} height={200} area />
        </Card>
        <Card title="Kelas hari ini" description={`${data.todayClasses.length} kelas · ${tanggalPendek(DEMO_TODAY)}`} actions={<Link className="btn btn-sm" to="/jadwal">Kalender</Link>}>
          <ul className="list" role="list">
            {data.todayClasses.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/kelas/${c.id}`} className="list-link">
                  <span className={`lang-dot lang-${c.lang}`} aria-hidden="true" />
                  <span className="grow"><b>{c.start.replace(':', '.')} · {c.level}</b> <span className="muted">{c.program}</span><small className="muted block">{TEACHERS.find((t) => t.id === c.teacherId)?.name} · {c.branch === 'online' ? 'Online' : c.room}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-main">
        <Card title="Tunggakan terbesar" description={`Total ${rupiah(data.arrTotal)}`} actions={<Link className="btn btn-sm" to="/keuangan/tunggakan">Semua tunggakan</Link>} flush>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Lima tunggakan terbesar</caption>
              <thead><tr><th scope="col">Siswa</th><th scope="col">Invoice</th><th scope="col" className="num">Sisa</th><th scope="col" className="num hide-sm">Telat</th><th scope="col"><span className="sr-only">Aksi</span></th></tr></thead>
              <tbody>
                {data.arr.slice(0, 5).map((a) => (
                  <tr key={a.invoice.id}>
                    <td>{a.student ? <Person name={a.student.name} lang={a.student.lang} to={`/siswa/${a.student.id}`} sub={`${a.student.level} · ${branchName(a.student.branch)}`} /> : '-'}</td>
                    <td><Link to={`/keuangan/invoice/${a.invoice.id}`} className="mono">{a.invoice.id}</Link></td>
                    <td className="num"><b>{rupiah(a.due)}</b></td>
                    <td className="num hide-sm">{a.days} hari</td>
                    <td>{a.student && <a className="btn btn-sm btn-wa" href={waLink(a.student.parent?.phone ?? a.student.phone, `Halo ${a.student.parent?.name ?? a.student.name}, pengingat tagihan ${a.invoice.id} sebesar ${rupiah(a.due)} sudah lewat jatuh tempo ${tanggal(a.invoice.due)}. Terima kasih.`)} target="_blank" rel="noopener" aria-label={`Kirim pengingat WhatsApp ke ${a.student.name}`}><Icon name="whatsapp" size={14} /> Ingatkan</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Trial mendatang" actions={<Link className="btn btn-sm" to="/trial?status=terjadwal">Semua</Link>}>
          <ul className="list" role="list">
            {data.upcomingTrials.map((t) => (
              <li key={t.id}>
                <Link to={`/trial/${t.id}`} className="list-link">
                  <span className="grow"><b>{t.name}</b><small className="muted block">{tanggal(t.date)} · {t.slot} · {branchName(t.mode)}</small></span>
                  <LangTag code={t.lang} />
                </Link>
              </li>
            ))}
          </ul>
          <p className="small muted"><StatusBadge status="terjadwal" /> {data.upcomingTrials.length} dari {trials.filter((t) => t.status === 'terjadwal').length} booking berikutnya</p>
        </Card>
      </div>
      <p className="muted xs">{CLASSES.length} kelas berjalan, {CLASSES.filter((c) => c.branch === 'online').length} di antaranya online. Angka dihitung dari data demo di browser ini.</p>
    </>
  )
}
