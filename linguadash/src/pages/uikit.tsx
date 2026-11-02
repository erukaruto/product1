import { useState } from 'react'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { Badge, Card, EmptyState, Field, LangTag, Modal, PageHeader, Pagination, Person, Progress, Segmented, Skeleton, StatusBadge, Tabs, Toggle, useToast } from '../components/ui.tsx'
import { BarChart, Funnel, HBars, LANG_COLOR, LineChart, SegmentBar, Sparkline } from '../components/charts.tsx'
import { STUDENTS, type Student } from '../data/demo.ts'
import { LANGUAGES } from '../data/school.ts'
import { num, rupiahShort } from '../lib/format.ts'

const crumbs = (label: string) => [{ label: 'UI kit' }, { label }]

export function UiButtons() {
  return (
    <>
      <PageHeader title="Tombol" description="Varian, ukuran, ikon, dan status. Semua tombol punya fokus terlihat untuk navigasi keyboard." crumbs={crumbs('Tombol')} />
      <Card title="Varian"><div className="ui-row"><button className="btn btn-primary" type="button">Primary</button><button className="btn" type="button">Default</button><button className="btn btn-soft" type="button">Soft</button><button className="btn btn-ghost" type="button">Ghost</button><button className="btn btn-danger" type="button">Danger</button><button className="btn btn-wa" type="button"><Icon name="whatsapp" size={16} /> WhatsApp</button></div></Card>
      <Card title="Ukuran"><div className="ui-row"><button className="btn btn-primary btn-sm" type="button">Kecil</button><button className="btn btn-primary" type="button">Normal</button><button className="btn btn-primary btn-lg" type="button">Besar</button></div></Card>
      <Card title="Dengan ikon"><div className="ui-row"><button className="btn btn-primary" type="button"><Icon name="plus" size={16} /> Tambah siswa</button><button className="btn" type="button"><Icon name="download" size={16} /> Ekspor CSV</button><button className="btn btn-icon" type="button" aria-label="Pengaturan"><Icon name="settings" /></button><button className="btn btn-ghost btn-icon" type="button" aria-label="Lainnya"><Icon name="more" /></button></div></Card>
      <Card title="Status"><div className="ui-row"><button className="btn btn-primary" type="button" disabled>Nonaktif</button><button className="btn" type="button" aria-busy="true"><span className="spinner" aria-hidden="true" /> Menyimpan…</button><button className="btn btn-block" type="button">Lebar penuh</button></div></Card>
      <Card title="Grup & segmented"><SegmentedDemo /></Card>
    </>
  )
}
function SegmentedDemo() {
  const [v, setV] = useState<'hari' | 'minggu' | 'bulan'>('minggu')
  return <Segmented label="Rentang" value={v} onChange={setV} options={[{ id: 'hari', label: 'Hari' }, { id: 'minggu', label: 'Minggu' }, { id: 'bulan', label: 'Bulan' }]} />
}

export function UiForms() {
  const [sw, setSw] = useState(true)
  return (
    <>
      <PageHeader title="Form" description="Setiap kontrol punya label. Pesan error dihubungkan lewat aria-describedby." crumbs={crumbs('Form')} />
      <div className="grid grid-2">
        <Card title="Input dasar">
          <div className="form-grid">
            <Field id="ui-text" label="Nama lengkap" required hint="Sesuai KTP atau akta"><input id="ui-text" className="input" placeholder="contoh: Aulia Pratama" /></Field>
            <Field id="ui-email" label="Email"><input id="ui-email" className="input" type="email" /></Field>
            <Field id="ui-select" label="Bahasa"><select id="ui-select" className="select">{LANGUAGES.map((l) => <option key={l.code}>{l.name}</option>)}</select></Field>
            <Field id="ui-date" label="Tanggal mulai"><input id="ui-date" className="input" type="date" /></Field>
            <Field id="ui-num" label="Nilai (0–100)"><input id="ui-num" className="input" type="number" min={0} max={100} defaultValue={78} /></Field>
            <Field id="ui-dis" label="Nonaktif"><input id="ui-dis" className="input" disabled defaultValue="Tidak bisa diubah" /></Field>
            <Field id="ui-area" label="Catatan" className="span-2"><textarea id="ui-area" className="textarea" rows={3} /></Field>
          </div>
        </Card>
        <div className="stack">
          <Card title="Validasi">
            <Field id="ui-err" label="Nomor WhatsApp" error="Gunakan nomor Indonesia, contoh: 0812 3456 7890."><input id="ui-err" className="input" defaultValue="12345" aria-invalid aria-describedby="ui-err-error" /></Field>
          </Card>
          <Card title="Pilihan">
            <fieldset><legend>Mode kelas</legend><div className="choices">{['Offline', 'Online', 'Privat'].map((m, i) => <label key={m} className="choice"><input type="radio" name="ui-mode" defaultChecked={i === 0} /><span>{m}<small>{['Di cabang', 'Via Zoom', '1-on-1'][i]}</small></span></label>)}</div></fieldset>
            <label className="check"><input type="checkbox" defaultChecked /> Kirim pengingat WhatsApp</label>
            <Toggle id="ui-switch" label="Notifikasi email" description="Ringkasan harian pukul 20.00" checked={sw} onChange={setSw} />
          </Card>
        </div>
      </div>
    </>
  )
}

export function UiTables() {
  const rows = STUDENTS.slice(0, 36)
  const columns: Column<Student>[] = [
    { key: 'name', header: 'Siswa', sort: (s) => s.name, render: (s) => <Person name={s.name} lang={s.lang} sub={s.id} /> },
    { key: 'lang', header: 'Bahasa', sort: (s) => s.lang, render: (s) => <LangTag code={s.lang} level={s.level} /> },
    { key: 'att', header: 'Kehadiran', align: 'right', sort: (s) => s.attendance, render: (s) => `${s.attendance}%` },
    { key: 'status', header: 'Status', sort: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
  ]
  const [page, setPage] = useState(3)
  return (
    <>
      <PageHeader title="Tabel" description="Tabel dengan sort (aria-sort), pagination, dan kolom yang disembunyikan di layar kecil." crumbs={crumbs('Tabel')} />
      <Card title="DataTable" description="Klik judul kolom untuk mengurutkan."><DataTable rows={rows} columns={columns} rowKey={(s) => s.id} caption="Contoh tabel siswa" pageSize={6} /></Card>
      <Card title="Tabel ringkas" flush>
        <div className="table-wrap"><table className="table table-compact"><caption className="sr-only">Tabel ringkas</caption><thead><tr><th scope="col">Bahasa</th><th scope="col" className="num">Siswa</th><th scope="col" className="num">Kelas</th></tr></thead><tbody>{LANGUAGES.map((l, i) => <tr key={l.code}><th scope="row"><LangTag code={l.code} /></th><td className="num">{[96, 61, 55, 35, 24, 27][i]}</td><td className="num">{[14, 9, 9, 6, 6, 6][i]}</td></tr>)}</tbody></table></div>
      </Card>
      <Card title="Pagination"><Pagination page={page} pages={12} onPage={setPage} from={(page - 1) * 10 + 1} to={page * 10} total={118} /></Card>
    </>
  )
}

export function UiCharts() {
  const labels = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov']
  const series = LANGUAGES.slice(0, 3).map((l, i) => ({ id: l.code, name: l.name, color: LANG_COLOR[l.code], values: labels.map((_, j) => 40 + i * 12 + j * (3 - i) + ((j * 7 + i * 5) % 9)) }))
  return (
    <>
      <PageHeader title="Chart" description="SVG buatan sendiri tanpa library. Warna mengikuti bahasa, legenda untuk 2+ seri, tooltip saat hover, dan tabel data." crumbs={crumbs('Chart')} />
      <div className="grid grid-2">
        <Card title="Garis (3 seri)"><LineChart label="Contoh grafik garis" labels={labels} series={series} format={(v) => num(Math.round(v))} /></Card>
        <Card title="Batang berkelompok"><BarChart label="Contoh grafik batang" labels={labels} series={series} format={(v) => num(Math.round(v))} /></Card>
        <Card title="Batang bertumpuk"><BarChart label="Contoh batang bertumpuk" labels={labels} stacked series={LANGUAGES.map((l, i) => ({ id: l.code, name: l.name, color: LANG_COLOR[l.code], values: labels.map((_, j) => (6 - i) * 4_000_000 + j * 600_000) }))} format={rupiahShort} /></Card>
        <Card title="Batang horizontal"><HBars label="Contoh batang horizontal" format={(v) => num(v)} items={LANGUAGES.map((l, i) => ({ key: l.code, label: l.name, value: [96, 61, 55, 35, 24, 27][i], color: LANG_COLOR[l.code] }))} /></Card>
        <Card title="Funnel"><Funnel label="Contoh funnel" steps={[{ label: 'Booking', value: 120 }, { label: 'Hadir', value: 94 }, { label: 'Mendaftar', value: 51 }]} /></Card>
        <Card title="Segmen & sparkline">
          <SegmentBar label="Contoh komposisi" parts={[{ name: 'Hadir', value: 412, color: 'var(--good)' }, { name: 'Izin', value: 21, color: 'var(--c-zh)' }, { name: 'Sakit', value: 12, color: 'var(--c-en)' }, { name: 'Alpa', value: 9, color: 'var(--bad)' }]} />
          <div className="ui-row"><Sparkline values={[3, 5, 4, 6, 7, 6, 8, 9, 8, 10, 11, 12]} label="Contoh sparkline naik" /><Sparkline values={[12, 11, 12, 10, 9, 9, 8, 8, 7, 7, 6, 6]} label="Contoh sparkline turun" /></div>
        </Card>
      </div>
    </>
  )
}

export function UiOverlays() {
  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  return (
    <>
      <PageHeader title="Overlay" description="Modal dan drawer memakai elemen dialog bawaan browser: fokus terkunci di dalam, tombol Escape menutup." crumbs={crumbs('Overlay')} />
      <div className="grid grid-2">
        <Card title="Modal & drawer"><div className="ui-row"><button className="btn btn-primary" type="button" onClick={() => setModal(true)}>Buka modal</button><button className="btn" type="button" onClick={() => setDrawer(true)}>Buka drawer</button></div></Card>
        <Card title="Toast"><div className="ui-row"><button className="btn" type="button" onClick={() => toast('Data tersimpan.')}>Toast sukses</button><button className="btn" type="button" onClick={() => toast('Sinkronisasi berjalan di latar.', 'accent')}>Toast info</button><button className="btn" type="button" onClick={() => toast('Gagal menyimpan, coba lagi.', 'bad')}>Toast error</button></div></Card>
        <Card title="Menu dropdown">
          <details className="menu" style={{ justifySelf: 'start' }}>
            <summary className="btn">Aksi <Icon name="down" size={14} /></summary>
            <div className="menu-list"><button type="button">Edit</button><button type="button">Duplikat</button><button type="button">Arsipkan</button></div>
          </details>
        </Card>
        <Card title="Tab"><TabsDemo /></Card>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Hapus kelas K-140?" size="sm" footer={<><button className="btn btn-ghost" type="button" onClick={() => setModal(false)}>Batal</button><button className="btn btn-danger" type="button" onClick={() => { setModal(false); toast('Contoh: kelas dihapus.', 'bad') }}>Hapus</button></>}>
        <p className="small">Siswa di kelas ini akan dipindah ke daftar tunggu. Tindakan ini tidak bisa dibatalkan.</p>
      </Modal>
      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filter lanjutan" drawer footer={<button className="btn btn-primary" type="button" onClick={() => setDrawer(false)}>Terapkan</button>}>
        <Field id="dr-lang" label="Bahasa"><select id="dr-lang" className="select">{LANGUAGES.map((l) => <option key={l.code}>{l.name}</option>)}</select></Field>
        <Field id="dr-min" label="Kehadiran minimal (%)"><input id="dr-min" className="input" type="number" defaultValue={75} /></Field>
      </Modal>
    </>
  )
}
function TabsDemo() {
  const [t, setT] = useState<'a' | 'b' | 'c'>('a')
  return (
    <div className="stack-sm">
      <Tabs label="Contoh tab" value={t} onChange={setT} tabs={[{ id: 'a', label: 'Ringkasan' }, { id: 'b', label: 'Nilai', count: 4 }, { id: 'c', label: 'Riwayat' }]} />
      <p className="small muted" role="tabpanel" aria-labelledby={`tab-${t}`}>Panel {t === 'a' ? 'ringkasan' : t === 'b' ? 'nilai' : 'riwayat'}. Gunakan panah kiri/kanan untuk pindah tab.</p>
    </div>
  )
}

export function UiStates() {
  return (
    <>
      <PageHeader title="State" description="Kosong, memuat, error, sukses, badge status, dan progres." crumbs={crumbs('State')} />
      <div className="grid grid-2">
        <Card title="Kosong"><EmptyState icon="users" title="Belum ada siswa" action={<button className="btn btn-primary" type="button"><Icon name="plus" size={16} /> Tambah siswa</button>}>Tambahkan siswa pertama atau impor dari CSV.</EmptyState></Card>
        <Card title="Memuat"><Skeleton lines={5} /></Card>
        <Card title="Pesan">
          <p className="notice"><Icon name="info" size={16} /> <span>Info: jadwal libur nasional sudah diperbarui.</span></p>
          <p className="notice notice-good"><Icon name="check" size={16} /> <span>Sukses: 12 nilai disimpan.</span></p>
          <p className="notice notice-warn"><Icon name="alert" size={16} /> <span>Peringatan: 3 siswa di bawah kehadiran 75%.</span></p>
          <p className="notice notice-bad"><Icon name="alert" size={16} /> <span>Error: koneksi ke server terputus.</span></p>
        </Card>
        <Card title="Badge status">
          <div className="ui-row">{['aktif', 'cuti', 'lulus', 'berhenti', 'lunas', 'belum-bayar', 'jatuh-tempo', 'sebagian', 'terjadwal', 'mendaftar', 'tidak-lanjut', 'hadir', 'izin', 'alpa'].map((s) => <StatusBadge key={s} status={s} />)}</div>
          <div className="ui-row">{LANGUAGES.map((l) => <LangTag key={l.code} code={l.code} level={l.levels[0].code} />)}</div>
          <div className="ui-row"><Badge>Netral</Badge><Badge tone="accent">Aksen</Badge><Badge tone="good">Baik</Badge><Badge tone="warn">Peringatan</Badge><Badge tone="bad">Bahaya</Badge></div>
        </Card>
        <Card title="Progres">
          <Progress value={92} label="Contoh progres baik" tone="good" />
          <Progress value={78} label="Contoh progres peringatan" tone="warn" />
          <Progress value={54} label="Contoh progres buruk" tone="bad" />
        </Card>
        <Card title="Token warna"><div className="swatch-grid">{['bg', 'surface', 'surface-2', 'ink', 'muted', 'line', 'accent', 'pop', 'good', 'warn', 'bad', 'c-en', 'c-ja', 'c-ko', 'c-zh', 'c-ar', 'c-de'].map((t) => <div key={t} className="swatch-card"><span style={{ background: `var(--${t})` }} /><p className="mono">--{t}</p></div>)}</div></Card>
      </div>
    </>
  )
}
