import { useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon.tsx'
import { Avatar, Badge, Card, EmptyState, Field, PageHeader, Segmented, useToast } from '../components/ui.tsx'
import { STUDENTS } from '../data/demo.ts'
import { DEMO_TODAY, SCHOOL, langByCode } from '../data/school.ts'
import { addDays, isoDate, rupiah, tanggal, tanggalPanjang } from '../lib/format.ts'
import { waLink } from '../lib/selectors.ts'
import { update, useDemoState, type Announcement } from '../lib/store.ts'

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'AN-12', title: 'Libur nasional 25 Desember', body: 'Kelas tanggal 25 Desember diganti hari Sabtu, 27 Desember di jam yang sama. Kelas online tetap libur.', audience: 'Semua siswa', channel: 'WhatsApp + email', date: isoDate(addDays(DEMO_TODAY, -2)), author: 'Rina Kartika', pinned: true },
  { id: 'AN-11', title: 'Simulasi JLPT N3 dan N4 hari Minggu', body: 'Simulasi lengkap di Lab Listening Dago, mulai 08.30. Bawa pensil 2B dan penghapus.', audience: 'Siswa Bahasa Jepang', channel: 'WhatsApp', date: isoDate(addDays(DEMO_TODAY, -6)), author: 'Haruka Tanaka' },
  { id: 'AN-10', title: 'Pendaftaran level berikutnya dibuka', body: 'Daftar sebelum 30 November untuk diskon EARLYBIRD 10%. Kursi kelas malam terbatas.', audience: 'Semua siswa', channel: 'WhatsApp + email', date: isoDate(addDays(DEMO_TODAY, -9)), author: 'Rina Kartika' },
  { id: 'AN-09', title: 'Pertemuan orang tua Kids & Teens', body: 'Sabtu pukul 10.00 di Kids Corner Dago dan via Zoom. Pengajar menyampaikan rapor tengah level.', audience: 'Orang tua Kids & Teens', channel: 'WhatsApp', date: isoDate(addDays(DEMO_TODAY, -14)), author: 'Agus Firmansyah' },
]

export function Announcements() {
  const state = useDemoState()
  const toast = useToast()
  const [error, setError] = useState('')
  const list = [...state.announcements, ...SEED_ANNOUNCEMENTS]
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const title = String(fd.get('title') ?? '').trim()
    const body = String(fd.get('body') ?? '').trim()
    if (title.length < 5 || body.length < 10) { setError('Judul minimal 5 karakter dan isi minimal 10 karakter.'); (form.elements.namedItem(title.length < 5 ? 'title' : 'body') as HTMLElement).focus(); return }
    setError('')
    const item: Announcement = { id: `AN-${13 + state.announcements.length}`, title, body, audience: String(fd.get('audience')), channel: String(fd.get('channel')), date: isoDate(DEMO_TODAY), author: 'Rina Kartika', pinned: fd.get('pinned') === 'on' }
    update((st) => ({ announcements: [item, ...st.announcements] }))
    form.reset()
    toast(`Pengumuman "${title}" dikirim ke ${item.audience.toLowerCase()} (demo).`)
  }
  return (
    <>
      <PageHeader title="Pengumuman" description="Kirim informasi ke siswa, orang tua, atau pengajar. Demo: tidak ada pesan yang benar-benar terkirim." crumbs={[{ label: 'Komunikasi' }, { label: 'Pengumuman' }]} />
      <div className="grid grid-main">
        <div className="stack">
          {list.map((a) => (
            <Card key={a.id} title={a.title} description={`${tanggalPanjang(a.date)} · ${a.author}`} actions={a.pinned ? <Badge tone="accent">Disematkan</Badge> : undefined}>
              <p className="small">{a.body}</p>
              <div className="row"><Badge>{a.audience}</Badge><Badge>{a.channel}</Badge></div>
            </Card>
          ))}
        </div>
        <Card title="Buat pengumuman">
          <form className="stack" onSubmit={submit} noValidate>
            <Field id="an-title" label="Judul" required><input id="an-title" name="title" className="input" /></Field>
            <Field id="an-body" label="Isi" required error={error}><textarea id="an-body" name="body" className="textarea" rows={5} /></Field>
            <Field id="an-audience" label="Penerima"><select id="an-audience" name="audience" className="select">{['Semua siswa', 'Orang tua Kids & Teens', 'Siswa Bahasa Inggris', 'Siswa Bahasa Jepang', 'Siswa Bahasa Korea', 'Siswa Bahasa Mandarin', 'Siswa Bahasa Arab', 'Siswa Bahasa Jerman', 'Semua pengajar'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field id="an-channel" label="Kanal"><select id="an-channel" name="channel" className="select"><option>WhatsApp + email</option><option>WhatsApp</option><option>Email</option></select></Field>
            <label className="check"><input type="checkbox" name="pinned" /> Sematkan di atas</label>
            <button type="submit" className="btn btn-primary"><Icon name="send" size={16} /> Kirim pengumuman</button>
          </form>
        </Card>
      </div>
    </>
  )
}

interface Template { id: string; name: string; to: 'Siswa' | 'Orang tua'; text: string }
const TEMPLATES: Template[] = [
  { id: 'reminder-invoice', name: 'Pengingat tagihan', to: 'Orang tua', text: 'Halo {wali}, kami mengingatkan tagihan {invoice} untuk {nama} sebesar {nominal} jatuh tempo {tanggal}. Abaikan jika sudah membayar. Terima kasih. – {lembaga}' },
  { id: 'absent', name: 'Tidak hadir di kelas', to: 'Orang tua', text: 'Halo {wali}, {nama} tidak hadir di kelas {kelas} hari ini. Jika sakit atau izin, mohon kabari kami agar materi bisa dikirim. – {lembaga}' },
  { id: 'trial-confirm', name: 'Konfirmasi kelas trial', to: 'Siswa', text: 'Halo {nama}, kelas trial Bahasa {bahasa} Anda dijadwalkan {tanggal}. Datang 10 menit lebih awal ya. Sampai jumpa! – {lembaga}' },
  { id: 'level-up', name: 'Selamat naik level', to: 'Siswa', text: 'Selamat {nama}! Anda lulus level {level} dengan nilai rata-rata {nilai}. Sertifikat bisa diambil di cabang atau diunduh dari link berikut. – {lembaga}' },
  { id: 'report', name: 'Laporan bulanan anak', to: 'Orang tua', text: 'Halo {wali}, laporan bulan ini untuk {nama}: kehadiran {hadir}, nilai rata-rata {nilai}. Saran latihan di rumah: 10 menit membaca bersama setiap malam. – {lembaga}' },
  { id: 'new-class', name: 'Info kelas baru', to: 'Siswa', text: 'Halo {nama}, kelas {kelas} mulai {tanggal}. Link kelas online dan materi akan dikirim H-1. – {lembaga}' },
]

export function WaTemplates() {
  const toast = useToast()
  const sample = STUDENTS.find((s) => s.parent && s.status === 'aktif') ?? STUDENTS[0]
  const [active, setActive] = useState(TEMPLATES[0].id)
  const [custom, setCustom] = useState<Record<string, string>>({})
  const tpl = TEMPLATES.find((t) => t.id === active) ?? TEMPLATES[0]
  const text = custom[tpl.id] ?? tpl.text
  const vars: Record<string, string> = {
    nama: sample.name, wali: sample.parent?.name ?? sample.name, invoice: 'INV-2026-0412', nominal: rupiah(2375000), tanggal: tanggal(addDays(DEMO_TODAY, 3)),
    kelas: sample.classId, bahasa: langByCode(sample.lang).name, level: sample.level, nilai: '82', hadir: '92%', lembaga: SCHOOL.short,
  }
  const preview = text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m)
  return (
    <>
      <PageHeader title="Template pesan WhatsApp" description="Variabel dalam kurung kurawal diganti otomatis. Tombol kirim membuka WhatsApp dengan pesan terisi." crumbs={[{ label: 'Komunikasi' }, { label: 'Template WhatsApp' }]} />
      <div className="grid grid-main">
        <Card title="Template" flush>
          <ul className="list" role="list" style={{ padding: 'var(--space-2) var(--space-4)' }}>
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <button type="button" className="list-link" style={{ width: '100%', border: 0, background: active === t.id ? 'var(--accent-soft)' : 'transparent', textAlign: 'left' }} aria-pressed={active === t.id} onClick={() => setActive(t.id)}>
                  <Icon name="whatsapp" size={16} />
                  <span className="grow"><b>{t.name}</b><small className="muted block">Untuk {t.to.toLowerCase()}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={tpl.name} description={`Contoh dengan data ${sample.name}`}>
          <Field id="tpl-text" label="Isi template" hint="Variabel: {nama} {wali} {invoice} {nominal} {tanggal} {kelas} {bahasa} {level} {nilai} {hadir} {lembaga}">
            <textarea id="tpl-text" className="textarea" rows={5} value={text} onChange={(e) => setCustom((c) => ({ ...c, [tpl.id]: e.target.value }))} />
          </Field>
          <div className="wa-preview" aria-label="Pratinjau pesan"><p>{preview}</p><time>{tanggal(DEMO_TODAY)} 09.41</time></div>
          <div className="row">
            <button type="button" className="btn" onClick={() => { void navigator.clipboard?.writeText(preview); toast('Pesan disalin.') }}><Icon name="copy" size={16} /> Salin</button>
            <a className="btn btn-wa" href={waLink(tpl.to === 'Orang tua' ? sample.parent?.phone ?? sample.phone : sample.phone, preview)} target="_blank" rel="noopener"><Icon name="whatsapp" size={16} /> Buka di WhatsApp</a>
            {custom[tpl.id] && <button type="button" className="btn btn-ghost" onClick={() => setCustom((c) => { const n = { ...c }; delete n[tpl.id]; return n })}>Kembalikan teks awal</button>}
          </div>
        </Card>
      </div>
    </>
  )
}

interface Thread { id: string; name: string; role: string; lang: string; messages: { me: boolean; text: string; time: string }[] }
const THREADS: Thread[] = [
  { id: 't1', name: 'Ibu Ratna Wulandari', role: 'Orang tua · Kids Mandarin', lang: 'zh', messages: [{ me: false, text: 'Selamat pagi, apakah kelas Sabtu ini tetap ada?', time: '08.12' }, { me: true, text: 'Pagi Bu Ratna, tetap ada pukul 09.00 di Kids Corner ya.', time: '08.20' }, { me: false, text: 'Baik, terima kasih. Anak saya mungkin telat 10 menit.', time: '08.24' }] },
  { id: 't2', name: 'Dimas Pratama', role: 'Siswa · Inggris B1', lang: 'en', messages: [{ me: false, text: 'Kak, saya mau pindah ke kelas malam bisa?', time: 'Kemarin' }, { me: false, text: 'Yang Selasa & Kamis 19.30 kalau ada.', time: 'Kemarin' }] },
  { id: 't3', name: 'Salma Rahman', role: 'Calon siswa · trial Korea', lang: 'ko', messages: [{ me: false, text: 'Halo, untuk trial online pakai Zoom atau Meet?', time: 'Senin' }, { me: true, text: 'Halo Salma, pakai Zoom. Link dikirim H-1.', time: 'Senin' }] },
  { id: 't4', name: 'Bapak Andre Tanjung', role: 'Orang tua · Kids English', lang: 'en', messages: [{ me: false, text: 'Invoice bulan ini sudah saya bayar lewat VA, mohon dicek.', time: 'Senin' }] },
  { id: 't5', name: 'Haruka Tanaka', role: 'Pengajar · Jepang', lang: 'ja', messages: [{ me: false, text: 'Lab Listening bisa dipakai Minggu untuk simulasi JLPT?', time: 'Jumat' }, { me: true, text: 'Bisa, sudah saya kunci 08.00–12.00.', time: 'Jumat' }] },
]

export function Inbox() {
  const state = useDemoState()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [activeId, setActiveId] = useState(THREADS[0].id)
  const [replies, setReplies] = useState<Record<string, string[]>>({})
  const [draft, setDraft] = useState('')
  const unread = (t: Thread) => !t.messages[t.messages.length - 1].me && !state.readThreads.includes(t.id)
  const list = THREADS.filter((t) => filter === 'all' || unread(t))
  const thread = THREADS.find((t) => t.id === activeId) ?? THREADS[0]
  const open = (id: string) => { setActiveId(id); if (!state.readThreads.includes(id)) update((st) => ({ readThreads: [...st.readThreads, id] })) }
  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setReplies((r) => ({ ...r, [thread.id]: [...(r[thread.id] ?? []), draft.trim()] }))
    setDraft('')
    if (!state.readThreads.includes(thread.id)) update((st) => ({ readThreads: [...st.readThreads, thread.id] }))
  }
  return (
    <>
      <PageHeader title="Inbox" description={`${THREADS.filter(unread).length} percakapan belum dibaca · pesan WhatsApp masuk (contoh, tanpa integrasi sungguhan)`} crumbs={[{ label: 'Komunikasi' }, { label: 'Inbox' }]}
        actions={<Segmented label="Saring percakapan" value={filter} onChange={setFilter} options={[{ id: 'all', label: 'Semua' }, { id: 'unread', label: 'Belum dibaca' }]} />} />
      <Card flush className="inbox">
        <ul className="inbox-list" role="list" aria-label="Daftar percakapan">
          {list.length ? list.map((t) => (
            <li key={t.id}>
              <button type="button" className="inbox-item" aria-current={t.id === thread.id} onClick={() => open(t.id)}>
                <span className="row between"><span className="row"><Avatar name={t.name} size={28} /><b>{t.name}</b></span>{unread(t) && <Badge tone="accent">Baru</Badge>}</span>
                <small className="muted">{t.role}</small>
                <p>{t.messages[t.messages.length - 1].text}</p>
              </button>
            </li>
          )) : <li><EmptyState icon="inbox" title="Semua pesan sudah dibaca" /></li>}
        </ul>
        <section className="inbox-thread" aria-label={`Percakapan dengan ${thread.name}`}>
          <div className="thread-head"><b>{thread.name}</b><small className="muted block">{thread.role}</small></div>
          <div className="thread-body" aria-live="polite">
            {thread.messages.map((m, i) => <p key={i} className={`bubble${m.me ? ' me' : ''}`}>{m.text}<time>{m.time}</time></p>)}
            {(replies[thread.id] ?? []).map((m, i) => <p key={`r${i}`} className="bubble me">{m}<time>Baru saja</time></p>)}
          </div>
          <form className="thread-form" onSubmit={send}>
            <label htmlFor="reply" className="sr-only">Balas {thread.name}</label>
            <input id="reply" className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tulis balasan…" autoComplete="off" />
            <button type="submit" className="btn btn-primary" aria-label="Kirim balasan"><Icon name="send" size={16} /></button>
          </form>
        </section>
      </Card>
    </>
  )
}
