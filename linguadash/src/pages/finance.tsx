import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { SearchInput, SelectFilter } from '../components/filters.tsx'
import { Badge, Card, Dl, EmptyState, Field, LangTag, Modal, PageHeader, Person, Progress, Segmented, Stat, StatusBadge, Toggle, useToast } from '../components/ui.tsx'
import { BarChart, HBars, LANG_COLOR, LineChart } from '../components/charts.tsx'
import { BRANCH_LIST, CLASSES, PROMOS, invoiceStatus, invoiceTotal, type Invoice, type InvoiceItem, type Payment } from '../data/demo.ts'
import { DEMO_TODAY, LANGUAGES, LANG_CODES, REGISTRATION_FEE, SCHOOL, BRANCHES, branchName, langByCode } from '../data/school.ts'
import { addDays, bulanPendek, isoDate, num, pct, rupiah, rupiahShort, tanggal, tanggalPanjang } from '../lib/format.ts'
import { useParam } from '../lib/params.ts'
import { arrears, revenueSeries, waLink } from '../lib/selectors.ts'
import { nextInvoiceId, update, useDemoState, useInvoices, usePayments, useStudents } from '../lib/store.ts'

const METHODS = ['Transfer BCA', 'Virtual Account Mandiri', 'QRIS', 'Tunai di cabang', 'GoPay', 'Transfer BNI']

// ---------- Bills: what is due soon ----------
export function Bills() {
  const students = useStudents()
  const invoices = useInvoices()
  const rows = useMemo(() => {
    const out: { key: string; student: (typeof students)[number]; kind: string; amount: number; due: string; invoice?: string }[] = []
    const soon = isoDate(addDays(DEMO_TODAY, 21))
    for (const inv of invoices) {
      const st = invoiceStatus(inv)
      if ((st === 'belum-bayar' || st === 'sebagian') && inv.due <= soon) {
        const s = students.find((x) => x.id === inv.studentId)
        if (s) out.push({ key: inv.id, student: s, kind: st === 'sebagian' ? 'Sisa pembayaran' : 'Invoice belum dibayar', amount: invoiceTotal(inv) - inv.paid, due: inv.due, invoice: inv.id })
      }
    }
    for (const s of students) {
      if (s.status !== 'aktif') continue
      const c = CLASSES.find((x) => x.id === s.classId)
      if (!c || c.meetingsDone / c.meetings < 0.8) continue
      const levels = langByCode(s.lang).levels
      const next = levels[levels.findIndex((l) => l.code === s.level) + 1]
      if (!next) continue
      const remaining = Math.ceil((c.meetings - c.meetingsDone) / c.days.length) * 7
      out.push({ key: `renew-${s.id}`, student: s, kind: `Perpanjangan ke ${next.code}`, amount: next.price + 125000, due: isoDate(addDays(DEMO_TODAY, remaining)) })
    }
    return out.sort((a, b) => a.due.localeCompare(b.due))
  }, [students, invoices])
  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Siswa', sort: (r) => r.student.name, render: (r) => <Person name={r.student.name} lang={r.student.lang} to={`/siswa/${r.student.id}`} sub={`${r.student.level} · ${r.student.classId}`} /> },
    { key: 'kind', header: 'Jenis tagihan', sort: (r) => r.kind, render: (r) => r.invoice ? <span>{r.kind}<small className="block"><Link to={`/keuangan/invoice/${r.invoice}`} className="mono">{r.invoice}</Link></small></span> : r.kind },
    { key: 'due', header: 'Jatuh tempo', sort: (r) => r.due, render: (r) => tanggal(r.due) },
    { key: 'amount', header: 'Jumlah', align: 'right', sort: (r) => r.amount, render: (r) => <b>{rupiah(r.amount)}</b> },
    { key: 'act', header: <span className="sr-only">Aksi</span>, render: (r) => r.invoice ? <a className="btn btn-sm btn-wa" href={waLink(r.student.parent?.phone ?? r.student.phone, `Halo, pengingat tagihan ${r.invoice} sebesar ${rupiah(r.amount)} jatuh tempo ${tanggal(r.due)}.`)} target="_blank" rel="noopener">Ingatkan</a> : <Link className="btn btn-sm btn-primary" to={`/keuangan/invoice/baru?siswa=${r.student.id}&perpanjang=1`}>Buat invoice</Link> },
  ]
  return (
    <>
      <PageHeader title="Tagihan" description="Tagihan yang jatuh tempo dalam 21 hari: invoice belum lunas dan perpanjangan level berikutnya." crumbs={[{ label: 'Keuangan' }, { label: 'Tagihan' }]}
        actions={<Link className="btn btn-primary" to="/keuangan/invoice/baru"><Icon name="plus" size={16} /> Buat invoice</Link>} />
      <div className="grid grid-3">
        <Stat label="Total tagihan 21 hari" value={rupiahShort(rows.reduce((s, r) => s + r.amount, 0))} hint={`${rows.length} tagihan`} />
        <Stat label="Perpanjangan level" value={rows.filter((r) => !r.invoice).length} hint="belum dibuatkan invoice" />
        <Stat label="Invoice belum lunas" value={rows.filter((r) => r.invoice).length} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.key} caption="Tagihan jatuh tempo" pageSize={12} initialSort={{ key: 'due', dir: 'asc' }} />
    </>
  )
}

// ---------- Invoice list ----------
export function InvoiceList() {
  const invoices = useInvoices()
  const students = useStudents()
  const byId = useMemo(() => new Map(students.map((s) => [s.id, s])), [students])
  const [status, setStatus] = useParam('status')
  const [q, setQ] = useParam('q')
  const rows = useMemo(() => invoices.filter((inv) => {
    const s = byId.get(inv.studentId)
    return (!status || invoiceStatus(inv) === status) && (!q || inv.id.toLowerCase().includes(q.toLowerCase()) || (s?.name.toLowerCase().includes(q.toLowerCase()) ?? false))
  }), [invoices, byId, status, q])
  const month = isoDate(DEMO_TODAY).slice(0, 7)
  const thisMonth = invoices.filter((i) => i.issued.startsWith(month))
  const columns: Column<Invoice>[] = [
    { key: 'id', header: 'Invoice', sort: (i) => i.id, render: (i) => <Link className="mono strong-link" to={`/keuangan/invoice/${i.id}`}>{i.id}</Link> },
    { key: 'student', header: 'Siswa', sort: (i) => byId.get(i.studentId)?.name ?? '', render: (i) => { const s = byId.get(i.studentId); return s ? <Person name={s.name} lang={s.lang} sub={s.id} /> : i.studentId } },
    { key: 'issued', header: 'Terbit', hideSm: true, sort: (i) => i.issued, render: (i) => tanggal(i.issued) },
    { key: 'due', header: 'Jatuh tempo', sort: (i) => i.due, render: (i) => tanggal(i.due) },
    { key: 'total', header: 'Total', align: 'right', sort: (i) => invoiceTotal(i), render: (i) => rupiah(invoiceTotal(i)) },
    { key: 'paid', header: 'Dibayar', align: 'right', hideSm: true, sort: (i) => i.paid, render: (i) => rupiah(i.paid) },
    { key: 'status', header: 'Status', sort: (i) => invoiceStatus(i), render: (i) => <StatusBadge status={invoiceStatus(i)} /> },
  ]
  return (
    <>
      <PageHeader title="Invoice" description={`${num(invoices.length)} invoice dalam 13 bulan terakhir`} crumbs={[{ label: 'Keuangan' }, { label: 'Invoice' }]}
        actions={<Link className="btn btn-primary" to="/keuangan/invoice/baru"><Icon name="plus" size={16} /> Buat invoice</Link>} />
      <div className="grid grid-4">
        <Stat label="Ditagih bulan ini" value={rupiahShort(thisMonth.reduce((s, i) => s + invoiceTotal(i), 0))} hint={`${thisMonth.length} invoice`} />
        <Stat label="Lunas" value={invoices.filter((i) => invoiceStatus(i) === 'lunas').length} />
        <Stat label="Belum bayar" value={invoices.filter((i) => invoiceStatus(i) === 'belum-bayar').length} />
        <Stat label="Jatuh tempo" value={invoices.filter((i) => invoiceStatus(i) === 'jatuh-tempo').length} to="/keuangan/tunggakan" />
      </div>
      <div className="toolbar">
        <SearchInput id="inv-q" value={q} onChange={setQ} placeholder="No. invoice atau nama siswa" />
        <SelectFilter id="inv-status" label="Status" value={status} onChange={setStatus} options={[['', 'Semua status'], ['lunas', 'Lunas'], ['belum-bayar', 'Belum bayar'], ['sebagian', 'Dibayar sebagian'], ['jatuh-tempo', 'Jatuh tempo']]} />
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(i) => i.id} caption="Daftar invoice" pageSize={12} initialSort={{ key: 'issued', dir: 'desc' }} />
    </>
  )
}

// ---------- New invoice ----------
interface ItemDraft extends InvoiceItem { key: number }
export function InvoiceNew() {
  const students = useStudents()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const active = useMemo(() => students.filter((s) => s.status === 'aktif' || s.status === 'cuti').sort((a, b) => a.name.localeCompare(b.name)), [students])
  const [studentId, setStudentId] = useState(params.get('siswa') ?? '')
  const student = students.find((s) => s.id === studentId)
  const [items, setItems] = useState<ItemDraft[]>(() => {
    const s = students.find((x) => x.id === params.get('siswa'))
    if (!s) return [{ key: 1, desc: '', qty: 1, price: 0 }]
    const levels = langByCode(s.lang).levels
    const lvl = params.get('perpanjang') ? levels[levels.findIndex((l) => l.code === s.level) + 1] ?? levels[0] : levels.find((l) => l.code === s.level) ?? levels[0]
    return [{ key: 1, desc: `Kursus ${langByCode(s.lang).name} ${lvl.code} (${lvl.meetings} pertemuan)`, qty: 1, price: lvl.price }, { key: 2, desc: `Buku & modul ${lvl.code}`, qty: 1, price: 125000 }]
  })
  const [promo, setPromo] = useState('')
  const [due, setDue] = useState(isoDate(addDays(DEMO_TODAY, 14)))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0)
  const p = PROMOS.find((x) => x.code === promo)
  const discount = p ? (p.type === 'persen' ? Math.round((subtotal * p.value) / 100 / 1000) * 1000 : Math.min(p.value, subtotal)) : 0
  const total = subtotal - discount
  const setItem = (key: number, patch: Partial<ItemDraft>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)))
  const addItem = (desc = '', price = 0) => setItems((list) => [...list.filter((i) => i.desc || i.price), { key: Date.now(), desc, qty: 1, price }])
  const courseItem = () => {
    if (!student) return
    const lvl = langByCode(student.lang).levels.find((l) => l.code === student.level)
    if (lvl) addItem(`Kursus ${langByCode(student.lang).name} ${lvl.code} (${lvl.meetings} pertemuan)`, lvl.price)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!student) next.student = 'Pilih siswa.'
    const filled = items.filter((i) => i.desc.trim() || i.price)
    if (!filled.length) next.items = 'Tambahkan minimal satu item.'
    filled.forEach((i) => { if (!i.desc.trim() || !(i.price > 0) || !(i.qty > 0)) next.items = 'Setiap item perlu deskripsi, jumlah, dan harga lebih dari 0.' })
    if (!due) next.due = 'Pilih tanggal jatuh tempo.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById(next.student ? 'inv-student' : next.items ? 'inv-items' : 'inv-due')?.focus(); return }
    const invoice: Invoice = { id: nextInvoiceId(), studentId, items: filled.map(({ desc, qty, price }) => ({ desc: desc.trim(), qty, price })), discount, promo: p?.code, issued: isoDate(DEMO_TODAY), due, paid: 0 }
    update((st) => ({ invoices: [invoice, ...st.invoices] }))
    toast(`Invoice ${invoice.id} dibuat: ${rupiah(total)}.`)
    navigate(`/keuangan/invoice/${invoice.id}`)
  }

  return (
    <>
      <PageHeader title="Buat invoice" description="Invoice tersimpan di browser ini (demo) dan bisa dicetak atau dikirim lewat WhatsApp." crumbs={[{ label: 'Invoice', to: '/keuangan/invoice' }, { label: 'Buat invoice' }]} />
      <form className="grid grid-main" onSubmit={submit} noValidate>
        <div className="stack">
          <Card title="Ditagihkan kepada">
            <div className="form-grid">
              <Field id="inv-student" label="Siswa" required error={errors.student} className="span-2">
                <select id="inv-student" className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-invalid={errors.student ? true : undefined}>
                  <option value="">Pilih siswa</option>
                  {active.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.id} · {langByCode(s.lang).name} {s.level}</option>)}
                </select>
              </Field>
              {student && <p className="small muted span-2">{student.parent ? `Wali: ${student.parent.name} · ${student.parent.phone}` : `WhatsApp: ${student.phone}`} · {branchName(student.branch)}</p>}
            </div>
          </Card>
          <Card title="Item" actions={
            <div className="row">
              <button type="button" className="btn btn-sm" onClick={courseItem} disabled={!student}>+ Kursus level</button>
              <button type="button" className="btn btn-sm" onClick={() => addItem('Buku & modul', 125000)}>+ Buku</button>
              <button type="button" className="btn btn-sm" onClick={() => addItem('Biaya pendaftaran', REGISTRATION_FEE)}>+ Pendaftaran</button>
              <button type="button" className="btn btn-sm" onClick={() => addItem('Privat 10 jam (pengajar lokal)', 1850000)}>+ Privat</button>
            </div>
          }>
            <div id="inv-items" tabIndex={-1} className="stack-sm" aria-describedby={errors.items ? 'inv-items-error' : undefined}>
              {items.map((i, n) => (
                <div key={i.key} className="item-row">
                  <Field id={`it-desc-${i.key}`} label={`Deskripsi item ${n + 1}`}><input id={`it-desc-${i.key}`} className="input" value={i.desc} onChange={(e) => setItem(i.key, { desc: e.target.value })} /></Field>
                  <Field id={`it-qty-${i.key}`} label="Jumlah"><input id={`it-qty-${i.key}`} className="input" type="number" min={1} value={i.qty} onChange={(e) => setItem(i.key, { qty: Number(e.target.value) })} /></Field>
                  <Field id={`it-price-${i.key}`} label="Harga (Rp)"><input id={`it-price-${i.key}`} className="input" type="number" min={0} step={5000} value={i.price || ''} onChange={(e) => setItem(i.key, { price: Number(e.target.value) })} /></Field>
                  <button type="button" className="btn btn-ghost btn-icon item-remove" onClick={() => setItems((list) => (list.length > 1 ? list.filter((x) => x.key !== i.key) : [{ key: Date.now(), desc: '', qty: 1, price: 0 }]))} aria-label={`Hapus item ${n + 1}`}><Icon name="trash" size={16} /></button>
                </div>
              ))}
              {errors.items && <p className="error" id="inv-items-error" role="alert">{errors.items}</p>}
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => addItem()} style={{ justifySelf: 'start' }}><Icon name="plus" size={14} /> Item kosong</button>
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card title="Ringkasan">
            <Field id="inv-promo" label="Promo">
              <select id="inv-promo" className="select" value={promo} onChange={(e) => setPromo(e.target.value)}>
                <option value="">Tanpa promo</option>
                {PROMOS.filter((x) => x.active).map((x) => <option key={x.code} value={x.code}>{x.code} · {x.type === 'persen' ? `${x.value}%` : rupiah(x.value)}</option>)}
              </select>
            </Field>
            <Field id="inv-due" label="Jatuh tempo" required error={errors.due}>
              <input id="inv-due" type="date" className="input" value={due} min={isoDate(DEMO_TODAY)} onChange={(e) => setDue(e.target.value)} />
            </Field>
            <div className="totals" aria-live="polite">
              <div><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
              <div><span>Diskon {p ? p.code : ''}</span><span>− {rupiah(discount)}</span></div>
              <div className="grand"><span>Total</span><span>{rupiah(total)}</span></div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">Simpan invoice</button>
            <Link className="btn btn-ghost btn-block" to="/keuangan/invoice">Batal</Link>
          </Card>
        </div>
      </form>
    </>
  )
}

// ---------- Invoice detail ----------
export function InvoiceDetail() {
  const { id } = useParams()
  const invoices = useInvoices()
  const payments = usePayments()
  const students = useStudents()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const inv = invoices.find((i) => i.id === id)
  if (!inv) return (<><PageHeader title="Invoice tidak ditemukan" crumbs={[{ label: 'Invoice', to: '/keuangan/invoice' }, { label: 'Tidak ditemukan' }]} /><Card><EmptyState icon="file" title="Nomor invoice tidak ada" action={<Link className="btn" to="/keuangan/invoice">Kembali</Link>} /></Card></>)
  const s = students.find((x) => x.id === inv.studentId)
  const total = invoiceTotal(inv)
  const status = invoiceStatus(inv)
  const paid = payments.filter((p) => p.invoiceId === inv.id)
  const record = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const amount = Number(fd.get('amount'))
    if (!(amount > 0)) return
    const payment: Payment = { id: `PAY-L${Date.now().toString().slice(-6)}`, invoiceId: inv.id, studentId: inv.studentId, amount, date: String(fd.get('date')), method: String(fd.get('method')) }
    update((st) => ({ payments: [payment, ...st.payments], invoicePaid: { ...st.invoicePaid, [inv.id]: Math.min(total, inv.paid + amount) } }))
    setOpen(false)
    toast(`Pembayaran ${rupiah(amount)} dicatat untuk ${inv.id}.`)
  }
  return (
    <>
      <PageHeader title={`Invoice ${inv.id}`} description={<><StatusBadge status={status} /> · terbit {tanggal(inv.issued)} · jatuh tempo {tanggal(inv.due)}</>} crumbs={[{ label: 'Invoice', to: '/keuangan/invoice' }, { label: inv.id }]}
        actions={
          <>
            <button type="button" className="btn" onClick={() => window.print()}><Icon name="printer" size={16} /> Cetak</button>
            {s && <a className="btn btn-wa" href={waLink(s.parent?.phone ?? s.phone, `Halo ${s.parent?.name ?? s.name}, berikut invoice ${inv.id} sebesar ${rupiah(total - inv.paid)}, jatuh tempo ${tanggal(inv.due)}.`)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> Kirim</a>}
            {status !== 'lunas' && <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="wallet" size={16} /> Catat pembayaran</button>}
          </>
        } />
      <div className="grid grid-main">
        <Card className="invoice-doc">
          <div className="invoice-head">
            <div><b>{SCHOOL.name}</b><p className="small muted">{BRANCHES[0].address}<br />{SCHOOL.email}</p></div>
            <div className="right"><p className="xs muted">INVOICE</p><p className="mono strong">{inv.id}</p><p className="small muted">{tanggalPanjang(inv.issued)}</p></div>
          </div>
          <div><p className="xs muted">DITAGIHKAN KEPADA</p>{s ? <p><b>{s.parent?.name ?? s.name}</b>{s.parent && <> untuk {s.name}</>}<br /><span className="small muted">{s.id} · {langByCode(s.lang).name} {s.level} · {branchName(s.branch)}</span></p> : <p>{inv.studentId}</p>}</div>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Item invoice</caption>
              <thead><tr><th scope="col">Deskripsi</th><th scope="col" className="num">Jml</th><th scope="col" className="num">Harga</th><th scope="col" className="num">Subtotal</th></tr></thead>
              <tbody>{inv.items.map((it, i) => <tr key={i}><td>{it.desc}</td><td className="num">{it.qty}</td><td className="num">{rupiah(it.price)}</td><td className="num">{rupiah(it.qty * it.price)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="totals">
            <div><span>Subtotal</span><span>{rupiah(total + inv.discount)}</span></div>
            {inv.discount > 0 && <div><span>Diskon {inv.promo}</span><span>− {rupiah(inv.discount)}</span></div>}
            <div className="grand"><span>Total</span><span>{rupiah(total)}</span></div>
            <div><span>Sudah dibayar</span><span>{rupiah(inv.paid)}</span></div>
            <div><span><b>Sisa</b></span><span><b>{rupiah(total - inv.paid)}</b></span></div>
          </div>
          <p className="xs muted">Pembayaran: virtual account, QRIS, transfer, atau tunai di cabang. Nomor rekening di template ini fiktif.</p>
        </Card>
        <Card title="Riwayat pembayaran">
          {paid.length ? (
            <ul className="list" role="list">{paid.map((p) => <li key={p.id} className="list-row"><Icon name="check" size={16} /><span className="grow">{rupiah(p.amount)}<small className="muted block">{tanggal(p.date)} · {p.method}</small></span><span className="mono xs">{p.id}</span></li>)}</ul>
          ) : <EmptyState icon="wallet" title="Belum ada pembayaran" />}
          <Progress value={inv.paid} max={total} label="Persentase terbayar" tone={status === 'lunas' ? 'good' : 'warn'} />
        </Card>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`Catat pembayaran ${inv.id}`} size="sm">
        <form className="stack" onSubmit={record} id="pay-form">
          <Field id="pay-amount" label="Jumlah (Rp)"><input id="pay-amount" name="amount" type="number" className="input" min={1} max={total - inv.paid} defaultValue={total - inv.paid} required /></Field>
          <Field id="pay-date" label="Tanggal"><input id="pay-date" name="date" type="date" className="input" defaultValue={isoDate(DEMO_TODAY)} required /></Field>
          <Field id="pay-method" label="Metode"><select id="pay-method" name="method" className="select">{METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
          <div className="row between"><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan pembayaran</button></div>
        </form>
      </Modal>
    </>
  )
}

// ---------- Payments ----------
export function Payments() {
  const payments = usePayments()
  const students = useStudents()
  const byId = useMemo(() => new Map(students.map((s) => [s.id, s])), [students])
  const [method, setMethod] = useParam('metode')
  const [month, setMonth] = useParam('bulan', isoDate(DEMO_TODAY).slice(0, 7))
  const months = Array.from({ length: 6 }, (_, i) => isoDate(new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth() - i, 1)).slice(0, 7))
  const rows = payments.filter((p) => (!method || p.method === method) && (!month || p.date.startsWith(month)))
  const byMethod = METHODS.map((m) => ({ key: m, label: m, value: rows.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0) })).sort((a, b) => b.value - a.value)
  const columns: Column<Payment>[] = [
    { key: 'date', header: 'Tanggal', sort: (p) => p.date, render: (p) => tanggal(p.date) },
    { key: 'student', header: 'Siswa', sort: (p) => byId.get(p.studentId)?.name ?? '', render: (p) => { const s = byId.get(p.studentId); return s ? <Person name={s.name} lang={s.lang} to={`/siswa/${s.id}`} sub={s.id} /> : p.studentId } },
    { key: 'invoice', header: 'Invoice', hideSm: true, sort: (p) => p.invoiceId, render: (p) => <Link className="mono" to={`/keuangan/invoice/${p.invoiceId}`}>{p.invoiceId}</Link> },
    { key: 'method', header: 'Metode', sort: (p) => p.method, render: (p) => <span className="small">{p.method}</span> },
    { key: 'amount', header: 'Jumlah', align: 'right', sort: (p) => p.amount, render: (p) => <b>{rupiah(p.amount)}</b> },
  ]
  return (
    <>
      <PageHeader title="Pembayaran masuk" description={`${rows.length} pembayaran · total ${rupiah(rows.reduce((s, p) => s + p.amount, 0))}`} crumbs={[{ label: 'Keuangan' }, { label: 'Pembayaran' }]} />
      <div className="toolbar">
        <SelectFilter id="pm-month" label="Bulan" value={month} onChange={setMonth} options={[['', 'Semua bulan'], ...months.map((m) => [m, new Date(`${m}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })] as [string, string])]} />
        <SelectFilter id="pm-method" label="Metode" value={method} onChange={setMethod} options={[['', 'Semua metode'], ...METHODS.map((m) => [m, m] as [string, string])]} />
      </div>
      <div className="grid grid-main">
        <DataTable rows={rows} columns={columns} rowKey={(p) => p.id} caption="Pembayaran masuk" pageSize={12} initialSort={{ key: 'date', dir: 'desc' }} />
        <Card title="Per metode"><HBars label="Total pembayaran per metode" format={rupiahShort} items={byMethod} /></Card>
      </div>
    </>
  )
}

// ---------- Arrears ----------
export function Arrears() {
  const invoices = useInvoices()
  const students = useStudents()
  const rows = useMemo(() => arrears(invoices, students), [invoices, students])
  type Row = (typeof rows)[number]
  const buckets = [['1–7 hari', 1, 7], ['8–30 hari', 8, 30], ['31–60 hari', 31, 60], ['> 60 hari', 61, 9999]] as const
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Siswa', sort: (r) => r.student?.name ?? '', render: (r) => r.student ? <Person name={r.student.name} lang={r.student.lang} to={`/siswa/${r.student.id}`} sub={r.student.parent ? `Wali: ${r.student.parent.name}` : r.student.phone} /> : '–' },
    { key: 'inv', header: 'Invoice', sort: (r) => r.invoice.id, render: (r) => <Link className="mono" to={`/keuangan/invoice/${r.invoice.id}`}>{r.invoice.id}</Link> },
    { key: 'due', header: 'Jatuh tempo', hideSm: true, sort: (r) => r.invoice.due, render: (r) => tanggal(r.invoice.due) },
    { key: 'days', header: 'Telat', align: 'right', sort: (r) => r.days, render: (r) => <Badge tone={r.days > 30 ? 'bad' : 'warn'}>{r.days} hari</Badge> },
    { key: 'amount', header: 'Sisa', align: 'right', sort: (r) => r.due, render: (r) => <b>{rupiah(r.due)}</b> },
    { key: 'act', header: <span className="sr-only">Aksi</span>, render: (r) => r.student && <a className="btn btn-sm btn-wa" target="_blank" rel="noopener" href={waLink(r.student.parent?.phone ?? r.student.phone, `Halo ${r.student.parent?.name ?? r.student.name}, kami mengingatkan invoice ${r.invoice.id} sebesar ${rupiah(r.due)} sudah lewat ${r.days} hari dari jatuh tempo. Abaikan jika sudah membayar. Terima kasih.`)}><Icon name="whatsapp" size={14} /> Ingatkan</a> },
  ]
  return (
    <>
      <PageHeader title="Tunggakan" description={`${rows.length} invoice lewat jatuh tempo · total ${rupiah(rows.reduce((s, r) => s + r.due, 0))}`} crumbs={[{ label: 'Keuangan' }, { label: 'Tunggakan' }]}
        actions={<Link className="btn" to="/komunikasi/template"><Icon name="whatsapp" size={16} /> Template pengingat</Link>} />
      <div className="grid grid-4">
        {buckets.map(([label, a, b]) => { const list = rows.filter((r) => r.days >= a && r.days <= b); return <Stat key={label} label={`Telat ${label}`} value={rupiahShort(list.reduce((s, r) => s + r.due, 0))} hint={`${list.length} invoice`} /> })}
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(r) => r.invoice.id} caption="Daftar tunggakan" pageSize={12} initialSort={{ key: 'days', dir: 'desc' }} empty={<EmptyState icon="check" title="Tidak ada tunggakan">Semua invoice lunas atau belum jatuh tempo.</EmptyState>} />
    </>
  )
}

// ---------- Promos ----------
export function Promos() {
  const state = useDemoState()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState<typeof PROMOS>([])
  const list = [...extra, ...PROMOS].map((p) => ({ ...p, active: state.promoActive[p.code] ?? p.active }))
  const create = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const code = String(fd.get('code') ?? '').trim().toUpperCase()
    if (!/^[A-Z0-9]{4,12}$/.test(code)) { (e.currentTarget.elements.namedItem('code') as HTMLElement).focus(); return }
    setExtra((x) => [{ code, name: String(fd.get('name')), type: fd.get('type') as 'persen' | 'nominal', value: Number(fd.get('value')), used: 0, quota: Number(fd.get('quota')), until: String(fd.get('until')), active: true, scope: 'Semua kelas' }, ...x])
    setOpen(false)
    toast(`Promo ${code} dibuat.`)
  }
  return (
    <>
      <PageHeader title="Diskon & promo" description="Kode promo bisa dipakai di formulir pendaftaran LinguaDrop dan saat membuat invoice." crumbs={[{ label: 'Keuangan' }, { label: 'Promo' }]}
        actions={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Buat promo</button>} />
      <div className="grid grid-3">
        {list.map((p) => (
          <Card key={p.code} title={<span className="mono">{p.code}</span>} description={p.name} actions={<Badge tone={p.active ? 'good' : 'neutral'} dot>{p.active ? 'Aktif' : 'Nonaktif'}</Badge>}>
            <p className="stat-value">{p.type === 'persen' ? `${p.value}%` : rupiah(p.value)}</p>
            <Dl items={[['Berlaku untuk', p.scope], ['Sampai', tanggal(p.until)], ['Dipakai', `${p.used} dari ${p.quota}`]]} />
            <Progress value={p.used} max={p.quota} label={`Kuota ${p.code} terpakai`} />
            <Toggle id={`promo-${p.code}`} label="Aktifkan promo" checked={p.active} onChange={(v) => { update((st) => ({ promoActive: { ...st.promoActive, [p.code]: v } })); toast(`${p.code} ${v ? 'diaktifkan' : 'dinonaktifkan'}.`, 'accent') }} />
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Buat promo">
        <form className="stack" onSubmit={create} noValidate id="promo-form">
          <div className="form-grid">
            <Field id="pr-code" label="Kode" hint="4–12 huruf/angka, tanpa spasi"><input id="pr-code" name="code" className="input mono" style={{ textTransform: 'uppercase' }} /></Field>
            <Field id="pr-name" label="Nama promo"><input id="pr-name" name="name" className="input" defaultValue="Promo akhir tahun" /></Field>
            <Field id="pr-type" label="Jenis"><select id="pr-type" name="type" className="select"><option value="persen">Persen</option><option value="nominal">Nominal (Rp)</option></select></Field>
            <Field id="pr-value" label="Nilai"><input id="pr-value" name="value" type="number" className="input" defaultValue={10} min={1} /></Field>
            <Field id="pr-quota" label="Kuota"><input id="pr-quota" name="quota" type="number" className="input" defaultValue={50} min={1} /></Field>
            <Field id="pr-until" label="Berlaku sampai"><input id="pr-until" name="until" type="date" className="input" defaultValue={isoDate(addDays(DEMO_TODAY, 45))} /></Field>
          </div>
          <div className="row between"><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button><button type="submit" className="btn btn-primary">Simpan promo</button></div>
        </form>
      </Modal>
    </>
  )
}

// ---------- Revenue by language & branch ----------
export function RevenueBreakdown() {
  const payments = usePayments()
  const students = useStudents()
  const [range, setRange] = useState<'3' | '6' | '12'>('6')
  const series = useMemo(() => revenueSeries(payments, students), [payments, students])
  const slice = series.slice(-Number(range))
  const total = slice.reduce((s, m) => s + m.total, 0)
  const langTotals = LANG_CODES.map((c) => ({ code: c, value: slice.reduce((s, m) => s + m.byLang[c], 0) }))
  const branchTotals = BRANCH_LIST.map((b) => ({ ...b, value: slice.reduce((s, m) => s + m.byBranch[b.id], 0) }))
  return (
    <>
      <PageHeader title="Pendapatan per bahasa & cabang" description={`${range} bulan terakhir · total ${rupiah(total)} · bulan berjalan sampai ${tanggal(DEMO_TODAY)}`} crumbs={[{ label: 'Keuangan' }, { label: 'Pendapatan' }]}
        actions={<Segmented label="Rentang waktu" value={range} onChange={setRange} options={[{ id: '3', label: '3 bulan' }, { id: '6', label: '6 bulan' }, { id: '12', label: '12 bulan' }]} />} />
      <div className="grid grid-2">
        <Card title="Per bahasa">
          <HBars label="Pendapatan per bahasa" format={rupiahShort} items={langTotals.map((l) => ({ key: l.code, label: langByCode(l.code).name, value: l.value, color: LANG_COLOR[l.code], sub: pct((l.value / Math.max(1, total)) * 100) })).sort((a, b) => b.value - a.value)} />
        </Card>
        <Card title="Per cabang">
          <HBars label="Pendapatan per cabang" format={rupiahShort} items={branchTotals.map((b) => ({ key: b.id, label: b.name, value: b.value, sub: pct((b.value / Math.max(1, total)) * 100) }))} />
        </Card>
      </div>
      <Card title="Tren per cabang">
        <LineChart label="Pendapatan bulanan per cabang" labels={slice.map((m) => bulanPendek(m.month))} format={rupiahShort} series={BRANCH_LIST.map((b, i) => ({ id: b.id, name: b.name, color: ['var(--c-en)', 'var(--c-ja)', 'var(--c-ko)'][i], values: slice.map((m) => m.byBranch[b.id]) }))} />
      </Card>
      <Card title="Tabel per bahasa per bulan" flush>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Pendapatan per bahasa per bulan</caption>
            <thead><tr><th scope="col">Bulan</th>{LANGUAGES.map((l) => <th key={l.code} scope="col" className="num"><LangTag code={l.code} /></th>)}<th scope="col" className="num">Total</th></tr></thead>
            <tbody>{slice.map((m) => <tr key={m.month}><th scope="row">{new Date(m.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</th>{LANG_CODES.map((c) => <td key={c} className="num">{rupiahShort(m.byLang[c])}</td>)}<td className="num"><b>{rupiahShort(m.total)}</b></td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Card title="Komposisi bulanan per bahasa">
        <BarChart label="Pendapatan per bulan per bahasa (bertumpuk)" labels={slice.map((m) => bulanPendek(m.month))} stacked format={rupiahShort} series={LANG_CODES.map((c) => ({ id: c, name: langByCode(c).name, color: LANG_COLOR[c], values: slice.map((m) => m.byLang[c]) }))} />
      </Card>
    </>
  )
}
