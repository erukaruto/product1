import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { AuthLayout } from '../components/Layout.tsx'
import { Icon } from '../components/Icon.tsx'
import { Field, useTitle, useToast } from '../components/ui.tsx'
import { LANGUAGES, BRANCHES, type LangCode } from '../data/school.ts'
import { rupiah } from '../lib/format.ts'

/** Reads a form and reports the first invalid field (custom Indonesian messages). */
function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const check = (form: HTMLFormElement, rules: Record<string, (value: string, data: FormData) => string | undefined>) => {
    const data = new FormData(form)
    const next: Record<string, string> = {}
    for (const [name, rule] of Object.entries(rules)) {
      const message = rule(String(data.get(name) ?? ''), data)
      if (message) next[name] = message
    }
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus?.()
    return Object.keys(next).length === 0
  }
  return { errors, check }
}
const required = (label: string) => (v: string) => (v.trim() ? undefined : `${label} wajib diisi.`)
const email = (v: string) => (!v.trim() ? 'Email wajib diisi.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : 'Format email belum benar, contoh: nama@lembaga.com.')
const password = (v: string) => (v.length >= 8 ? undefined : 'Kata sandi minimal 8 karakter.')
const invalid = (errors: Record<string, string>, name: string) => ({
  'aria-invalid': errors[name] ? true : undefined,
  'aria-describedby': errors[name] ? `${name}-error` : undefined,
})

function DemoNote({ children }: { children: ReactNode }) {
  return <p className="notice small"><Icon name="info" size={16} /> <span>{children}</span></p>
}

export function Login() {
  useTitle('Masuk')
  const navigate = useNavigate()
  const { errors, check } = useFormErrors()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (check(e.currentTarget, { email, password })) navigate('/')
  }
  return (
    <AuthLayout>
      <div className="stack-sm">
        <h1>Masuk ke LinguaDash</h1>
        <p className="muted">Kelola siswa, kelas, dan keuangan Polyglot Nusantara.</p>
      </div>
      <DemoNote>Demo: email dan kata sandi sudah terisi. Tidak ada login sungguhan, tombol Masuk langsung membuka dashboard.</DemoNote>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue="rina@polyglotnusantara.example" {...invalid(errors, 'email')} />
        </Field>
        <Field id="password" label="Kata sandi" error={errors.password}>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" defaultValue="demo12345" {...invalid(errors, 'password')} />
        </Field>
        <div className="row between">
          <label className="check"><input type="checkbox" name="remember" defaultChecked /> Ingat saya</label>
          <Link to="/lupa-password" className="small">Lupa kata sandi?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block">Masuk</button>
      </form>
      <p className="small center muted">Belum punya akun lembaga? <Link to="/daftar">Daftar gratis</Link></p>
    </AuthLayout>
  )
}

export function Register() {
  useTitle('Daftar')
  const navigate = useNavigate()
  const { errors, check } = useFormErrors()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = check(e.currentTarget, {
      name: required('Nama lengkap'),
      institution: required('Nama lembaga'),
      email,
      password,
      agree: (v) => (v ? undefined : 'Centang persetujuan untuk melanjutkan.'),
    })
    if (ok) navigate('/verifikasi-email')
  }
  return (
    <AuthLayout title="Mulai kelola lembaga kursus Anda dalam 5 menit.">
      <div className="stack-sm">
        <h1>Buat akun lembaga</h1>
        <p className="muted">Uji coba 14 hari. Tidak perlu kartu kredit.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="name" label="Nama lengkap" required error={errors.name}>
          <input id="name" name="name" className="input" autoComplete="name" {...invalid(errors, 'name')} />
        </Field>
        <Field id="institution" label="Nama lembaga" required error={errors.institution}>
          <input id="institution" name="institution" className="input" placeholder="contoh: Polyglot Nusantara" autoComplete="organization" {...invalid(errors, 'institution')} />
        </Field>
        <Field id="reg-email" label="Email kerja" required error={errors.email}>
          <input id="reg-email" name="email" type="email" className="input" autoComplete="email" {...invalid(errors, 'email')} />
        </Field>
        <Field id="reg-password" label="Kata sandi" required hint="Minimal 8 karakter." error={errors.password}>
          <input id="reg-password" name="password" type="password" className="input" autoComplete="new-password" {...invalid(errors, 'password')} />
        </Field>
        <div className="field">
          <label className="check"><input type="checkbox" name="agree" aria-describedby={errors.agree ? 'agree-error' : undefined} /> Saya setuju dengan syarat layanan dan kebijakan privasi.</label>
          {errors.agree && <p className="error" id="agree-error" role="alert">{errors.agree}</p>}
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block">Buat akun</button>
      </form>
      <p className="small center muted">Sudah punya akun? <Link to="/login">Masuk</Link></p>
    </AuthLayout>
  )
}

export function ForgotPassword() {
  useTitle('Lupa kata sandi')
  const [sent, setSent] = useState('')
  const { errors, check } = useFormErrors()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (check(e.currentTarget, { email })) setSent(String(new FormData(e.currentTarget).get('email')))
  }
  return (
    <AuthLayout>
      <div className="stack-sm">
        <h1>Lupa kata sandi</h1>
        <p className="muted">Masukkan email akun. Kami kirim tautan untuk membuat kata sandi baru.</p>
      </div>
      {sent ? (
        <div className="stack" role="status">
          <p className="notice notice-good"><Icon name="check" size={16} /> <span>Jika <b>{sent}</b> terdaftar, tautan reset sudah dikirim. Cek folder spam juga.</span></p>
          <DemoNote>Demo: tidak ada email yang terkirim. Buka langsung halaman reset untuk melihat langkah berikutnya.</DemoNote>
          <Link className="btn btn-primary btn-block" to="/reset-password">Buka halaman reset (demo)</Link>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <Field id="forgot-email" label="Email" error={errors.email}>
            <input id="forgot-email" name="email" type="email" className="input" autoComplete="email" {...invalid(errors, 'email')} />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg btn-block">Kirim tautan reset</button>
        </form>
      )}
      <p className="small center"><Link to="/login">← Kembali ke halaman masuk</Link></p>
    </AuthLayout>
  )
}

export function ResetPassword() {
  useTitle('Buat kata sandi baru')
  const navigate = useNavigate()
  const toast = useToast()
  const { errors, check } = useFormErrors()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = check(e.currentTarget, {
      password,
      confirm: (v, data) => (v === data.get('password') ? undefined : 'Konfirmasi belum sama dengan kata sandi baru.'),
    })
    if (ok) {
      toast('Kata sandi diperbarui. Silakan masuk.')
      navigate('/login')
    }
  }
  return (
    <AuthLayout>
      <div className="stack-sm">
        <h1>Buat kata sandi baru</h1>
        <p className="muted">Untuk akun rina@polyglotnusantara.example</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="new-password" label="Kata sandi baru" hint="Minimal 8 karakter, campur huruf dan angka." error={errors.password}>
          <input id="new-password" name="password" type="password" className="input" autoComplete="new-password" {...invalid(errors, 'password')} />
        </Field>
        <Field id="confirm-password" label="Ulangi kata sandi" error={errors.confirm}>
          <input id="confirm-password" name="confirm" type="password" className="input" autoComplete="new-password" {...invalid(errors, 'confirm')} />
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block">Simpan kata sandi</button>
      </form>
    </AuthLayout>
  )
}

export function VerifyEmail() {
  useTitle('Verifikasi email')
  const toast = useToast()
  return (
    <AuthLayout>
      <span className="stat-icon" style={{ width: 48, height: 48 }}><Icon name="mail" size={22} /></span>
      <div className="stack-sm">
        <h1>Cek email Anda</h1>
        <p className="muted">Kami mengirim tautan verifikasi ke email yang Anda daftarkan. Tautan berlaku 24 jam.</p>
      </div>
      <DemoNote>Demo: tidak ada email sungguhan. Lanjutkan ke onboarding untuk melihat langkah berikutnya.</DemoNote>
      <div className="stack-sm">
        <Link className="btn btn-primary btn-lg btn-block" to="/onboarding/profil">Saya sudah verifikasi, lanjutkan</Link>
        <button type="button" className="btn btn-block" onClick={() => toast('Email verifikasi dikirim ulang (demo).', 'accent')}>Kirim ulang email</button>
      </div>
    </AuthLayout>
  )
}

// ---------- Onboarding (3 steps) ----------
const ONBOARD_KEY = 'linguadash-onboarding'
interface Onboarding { name: string; city: string; phone: string; branches: string; langs: LangCode[]; prices: Record<string, number> }
const readOnboarding = (): Onboarding => {
  try {
    const raw = sessionStorage.getItem(ONBOARD_KEY)
    if (raw) return JSON.parse(raw) as Onboarding
  } catch { /* ignore */ }
  return { name: 'Polyglot Nusantara Language Center', city: 'Bandung', phone: '+62 800-0000-0000', branches: '2', langs: ['en', 'ja', 'ko'], prices: {} }
}
const saveOnboarding = (data: Onboarding) => {
  try { sessionStorage.setItem(ONBOARD_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

function OnboardSteps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ['Profil lembaga', 'Bahasa yang diajarkan', 'Paket harga']
  return (
    <ol className="steps-bar" aria-label={`Langkah ${step} dari 3`}>
      {labels.map((l, i) => (
        <li key={l} aria-current={i + 1 === step ? 'step' : undefined} data-done={i + 1 < step}>{i + 1}. {l}</li>
      ))}
    </ol>
  )
}

export function OnboardingProfile() {
  useTitle('Onboarding: profil lembaga')
  const navigate = useNavigate()
  const data = readOnboarding()
  const { errors, check } = useFormErrors()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!check(form, { name: required('Nama lembaga'), city: required('Kota'), phone: required('Nomor WhatsApp') })) return
    const fd = new FormData(form)
    saveOnboarding({ ...data, name: String(fd.get('name')), city: String(fd.get('city')), phone: String(fd.get('phone')), branches: String(fd.get('branches')) })
    navigate('/onboarding/bahasa')
  }
  return (
    <AuthLayout wide title="Tiga langkah singkat, lalu dashboard siap dipakai.">
      <OnboardSteps step={1} />
      <div className="stack-sm">
        <h1>Profil lembaga</h1>
        <p className="muted">Data ini muncul di invoice, sertifikat, dan pesan WhatsApp.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field id="ob-name" label="Nama lembaga" required error={errors.name} className="span-2">
            <input id="ob-name" name="name" className="input" defaultValue={data.name} {...invalid(errors, 'name')} />
          </Field>
          <Field id="ob-city" label="Kota kantor pusat" required error={errors.city}>
            <input id="ob-city" name="city" className="input" defaultValue={data.city} {...invalid(errors, 'city')} />
          </Field>
          <Field id="ob-phone" label="Nomor WhatsApp admin" required error={errors.phone}>
            <input id="ob-phone" name="phone" className="input" inputMode="tel" defaultValue={data.phone} {...invalid(errors, 'phone')} />
          </Field>
          <Field id="ob-branches" label="Jumlah cabang offline">
            <select id="ob-branches" name="branches" className="select" defaultValue={data.branches}>
              <option value="0">Hanya online</option>
              <option value="1">1 cabang</option>
              <option value="2">2 cabang</option>
              <option value="3">3 cabang atau lebih</option>
            </select>
          </Field>
          <Field id="ob-type" label="Jenis lembaga">
            <select id="ob-type" name="type" className="select" defaultValue="lkp">
              <option value="lkp">Lembaga kursus (LKP)</option>
              <option value="sekolah">Sekolah / pesantren</option>
              <option value="kampus">Pusat bahasa kampus</option>
              <option value="lpk">LPK (pelatihan kerja)</option>
            </select>
          </Field>
        </div>
        <div className="row between">
          <Link to="/verifikasi-email" className="btn btn-ghost">Kembali</Link>
          <button type="submit" className="btn btn-primary">Lanjut: bahasa <Icon name="arrowRight" size={16} /></button>
        </div>
      </form>
    </AuthLayout>
  )
}

export function OnboardingLanguages() {
  useTitle('Onboarding: bahasa')
  const navigate = useNavigate()
  const data = readOnboarding()
  const [langs, setLangs] = useState<LangCode[]>(data.langs)
  const [error, setError] = useState('')
  const toggle = (code: LangCode) => setLangs((list) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (langs.length === 0) { setError('Pilih minimal satu bahasa.'); return }
    saveOnboarding({ ...data, langs })
    navigate('/onboarding/paket')
  }
  return (
    <AuthLayout wide title="Level mengikuti CEFR, plus JLPT, TOPIK, dan HSK.">
      <OnboardSteps step={2} />
      <div className="stack-sm">
        <h1>Bahasa yang diajarkan</h1>
        <p className="muted">Level tiap bahasa bisa diubah nanti di Pengaturan, Bahasa & level.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <fieldset aria-describedby={error ? 'langs-error' : undefined}>
          <legend>Pilih bahasa (bisa lebih dari satu)</legend>
          <div className="choices">
            {LANGUAGES.map((l) => (
              <label key={l.code} className="choice">
                <input type="checkbox" name="langs" value={l.code} checked={langs.includes(l.code)} onChange={() => toggle(l.code)} />
                <span>
                  {l.name} <span lang={l.code === 'zh' ? 'zh-Hans' : l.code} dir={l.code === 'ar' ? 'rtl' : undefined}>{l.native}</span>
                  <small>{l.track} · {l.levels.length} level ({l.levels[0].code}–{l.levels[l.levels.length - 1].code})</small>
                </span>
              </label>
            ))}
          </div>
          {error && <p className="error" id="langs-error" role="alert">{error}</p>}
        </fieldset>
        <div className="row between">
          <Link to="/onboarding/profil" className="btn btn-ghost">Kembali</Link>
          <button type="submit" className="btn btn-primary">Lanjut: paket harga <Icon name="arrowRight" size={16} /></button>
        </div>
      </form>
    </AuthLayout>
  )
}

export function OnboardingPricing() {
  useTitle('Onboarding: paket harga')
  const navigate = useNavigate()
  const toast = useToast()
  const data = readOnboarding()
  const langs = LANGUAGES.filter((l) => data.langs.includes(l.code))
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const prices = Object.fromEntries(langs.map((l) => [l.code, Number(fd.get(`price-${l.code}`)) || l.levels[0].price]))
    saveOnboarding({ ...data, prices })
    toast(`${data.name} siap. Selamat datang di LinguaDash!`)
    navigate('/')
  }
  return (
    <AuthLayout wide title="Harga bisa dibedakan per level, intensif, dan privat per jam.">
      <OnboardSteps step={3} />
      <div className="stack-sm">
        <h1>Paket harga awal</h1>
        <p className="muted">Isi harga kursus reguler per level (1 level). Harga intensif dan privat bisa ditambah nanti.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="form-grid">
          {langs.map((l) => (
            <Field key={l.code} id={`price-${l.code}`} label={`Bahasa ${l.name}, per level`} hint={`Saran: ${rupiah(l.levels[0].price)} untuk ${l.levels[0].meetings} pertemuan`}>
              <input id={`price-${l.code}`} name={`price-${l.code}`} className="input" type="number" min={0} step={50000} defaultValue={l.levels[0].price} />
            </Field>
          ))}
          <Field id="price-private" label="Privat per jam (pengajar lokal)">
            <input id="price-private" name="private" className="input" type="number" min={0} step={5000} defaultValue={185000} />
          </Field>
          <Field id="price-registration" label="Biaya pendaftaran">
            <input id="price-registration" name="registration" className="input" type="number" min={0} step={10000} defaultValue={150000} />
          </Field>
        </div>
        <p className="muted small">Cabang yang akan dibuat: {BRANCHES.slice(0, Number(data.branches) || 0).map((b) => b.name).join(', ') || 'tidak ada (online saja)'}.</p>
        <div className="row between">
          <Link to="/onboarding/bahasa" className="btn btn-ghost">Kembali</Link>
          <button type="submit" className="btn btn-primary">Selesai, buka dashboard</button>
        </div>
      </form>
    </AuthLayout>
  )
}
