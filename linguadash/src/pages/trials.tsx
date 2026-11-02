import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { LangSelect, SearchInput } from '../components/filters.tsx'
import { Card, Dl, EmptyState, LangTag, PageHeader, Person, StatusBadge, Tabs, useToast } from '../components/ui.tsx'
import { teacherById, type Trial, type TrialStatus } from '../data/demo.ts'
import { branchName, langByCode } from '../data/school.ts'
import { num, pct, tanggal, tanggalPanjang } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { trialFunnel, waLink } from '../lib/selectors.ts'
import { update, useTrials } from '../lib/store.ts'

const STATUSES: { id: TrialStatus | ''; label: string }[] = [
  { id: '', label: 'Semua' }, { id: 'terjadwal', label: 'Terjadwal' }, { id: 'hadir', label: 'Hadir' },
  { id: 'mendaftar', label: 'Mendaftar' }, { id: 'tidak-lanjut', label: 'Tidak lanjut' }, { id: 'tidak-hadir', label: 'Tidak hadir' },
]

function setStatus(id: string, status: TrialStatus) {
  update((st) => ({ trials: { ...st.trials, [id]: status } }))
}

function StatusSelect({ trial, compact }: { trial: Trial; compact?: boolean }) {
  const toast = useToast()
  const id = `status-${trial.id}`
  return (
    <span className="row nowrap">
      <label htmlFor={id} className={compact ? 'sr-only' : 'small strong'}>Status {compact ? trial.name : ''}</label>
      <select id={id} className="select" style={{ minHeight: 34, width: 'auto' }} value={trial.status} onChange={(e) => { setStatus(trial.id, e.target.value as TrialStatus); toast(`Status ${trial.name}: ${e.target.selectedOptions[0].text}.`) }}>
        {STATUSES.slice(1).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </span>
  )
}

export function TrialList() {
  const trials = useTrials()
  const [status, setFilter] = useParam('status')
  const [lang, setLang] = useParam('bahasa')
  const [q, setQ] = useParam('q')
  const rows = useMemo(() => trials.filter((t) => (!status || t.status === status) && (!lang || t.lang === lang) && (!q || t.name.toLowerCase().includes(q.toLowerCase()))), [trials, status, lang, q])
  const f = trialFunnel(trials, 90)
  const columns: Column<Trial>[] = [
    { key: 'name', header: 'Calon siswa', sort: (t) => t.name, render: (t) => <Person name={t.name} lang={t.lang} to={`/trial/${t.id}`} sub={`${t.id} · ${t.age} th`} /> },
    { key: 'date', header: 'Jadwal trial', sort: (t) => `${t.date}${t.slot}`, render: (t) => <span className="nowrap">{tanggal(t.date)}<small className="muted block">{t.slot} WIB · {branchName(t.mode)}</small></span> },
    { key: 'lang', header: 'Bahasa', sort: (t) => t.lang, render: (t) => <LangTag code={t.lang} level={t.level} /> },
    { key: 'source', header: 'Sumber', hideSm: true, sort: (t) => t.source, render: (t) => <span className="small">{t.source}</span> },
    { key: 'status', header: 'Status', sort: (t) => t.status, render: (t) => <StatusSelect trial={t} compact /> },
    { key: 'wa', header: <span className="sr-only">WhatsApp</span>, render: (t) => <a className="btn btn-sm btn-ghost btn-icon" href={waLink(t.phone, `Halo ${t.name.split(' ')[0]}, kami dari Polyglot Nusantara ingin mengonfirmasi kelas trial ${tanggal(t.date)} pukul ${t.slot}.`)} target="_blank" rel="noopener" aria-label={`WhatsApp ${t.name}`}><Icon name="whatsapp" size={16} /></a> },
  ]
  return (
    <>
      <PageHeader title="Trial class" description={`${num(trials.length)} booking · konversi 90 hari ${pct(f.rate)} (${f.enrolled} dari ${f.attended} yang hadir mendaftar)`} crumbs={[{ label: 'Overview', to: '/' }, { label: 'Trial class' }]}
        actions={<Link className="btn" to="/laporan/konversi-trial"><Icon name="chart" size={16} /> Laporan konversi</Link>} />
      <Tabs label="Status booking" value={status as TrialStatus | ''} onChange={(v) => setFilter(v)} tabs={STATUSES.map((s) => ({ id: s.id, label: s.label, count: s.id ? trials.filter((t) => t.status === s.id).length : trials.length }))} />
      <div className="toolbar">
        <SearchInput id="tr-q" value={q} onChange={setQ} placeholder="Nama calon siswa" />
        <LangSelect id="tr-lang" value={lang} onChange={setLang} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} caption="Booking trial class" pageSize={12} initialSort={{ key: 'date', dir: 'desc' }} />
    </>
  )
}

export function TrialDetail() {
  const { id } = useParams()
  const trials = useTrials()
  const t = trials.find((x) => x.id === id)
  if (!t) {
    return (
      <>
        <PageHeader title="Booking tidak ditemukan" crumbs={[{ label: 'Trial class', to: '/trial' }, { label: 'Tidak ditemukan' }]} />
        <Card><EmptyState icon="trial" title="ID booking tidak ada" action={<Link className="btn" to="/trial">Kembali</Link>} /></Card>
      </>
    )
  }
  const teacher = teacherById(t.teacherId)
  const steps: { label: string; done: boolean }[] = [
    { label: 'Booking masuk dari situs', done: true },
    { label: 'Dikonfirmasi via WhatsApp', done: true },
    { label: 'Hadir di kelas trial', done: t.status === 'hadir' || t.status === 'mendaftar' || t.status === 'tidak-lanjut' },
    { label: 'Mendaftar sebagai siswa', done: t.status === 'mendaftar' },
  ]
  return (
    <>
      <PageHeader
        title={`Trial ${t.name}`}
        description={`${t.id} · ${tanggalPanjang(t.date)} · ${t.slot} WIB`}
        crumbs={[{ label: 'Trial class', to: '/trial' }, { label: t.name }]}
        actions={
          <>
            <a className="btn btn-wa" href={waLink(t.phone, `Halo ${t.name.split(' ')[0]}, terima kasih sudah booking trial Bahasa ${langByCode(t.lang).name}.`)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> WhatsApp</a>
            <Link className="btn btn-primary" to="/siswa/baru"><Icon name="plus" size={16} /> Jadikan siswa</Link>
          </>
        }
      />
      <div className="grid grid-main">
        <div className="stack">
          <Card title="Status booking" actions={<StatusSelect trial={t} />}>
            <ol className="timeline-list" role="list">
              {steps.map((s) => (
                <li key={s.label} data-done={s.done}><span className="tl-dot" aria-hidden="true">{s.done && <Icon name="check" size={12} />}</span>{s.label}<span className="sr-only">{s.done ? ' (selesai)' : ' (belum)'}</span></li>
              ))}
            </ol>
            <p className="small muted">Status sekarang: <StatusBadge status={t.status} /></p>
          </Card>
          <Card title="Catatan">
            <p className="small">{t.note || 'Tidak ada catatan dari calon siswa.'}</p>
          </Card>
        </div>
        <Card title="Detail">
          <Dl items={[
            ['Nama', t.name], ['Umur', `${t.age} tahun`], ['WhatsApp', t.phone], ['Email', <span style={{ overflowWrap: 'anywhere' }}>{t.email}</span>],
            ['Bahasa', <LangTag code={t.lang} level={t.level} />], ['Tempat', branchName(t.mode)], ['Pengajar', teacher ? <Link to={`/pengajar/${teacher.id}`}>{teacher.name}</Link> : '–'], ['Sumber', t.source],
          ]} />
        </Card>
      </div>
    </>
  )
}
