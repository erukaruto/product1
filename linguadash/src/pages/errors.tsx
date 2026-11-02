import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/Icon.tsx'
import { useTitle } from '../components/ui.tsx'

function ErrorScreen({ code, title, text, children }: { code: string; title: string; text: string; children?: ReactNode }) {
  useTitle(title)
  return (
    <section className="card panel error-screen">
      <p className="error-code" aria-hidden="true">{code}</p>
      <h1>{title}</h1>
      <p className="muted">{text}</p>
      <div className="row">
        <Link className="btn btn-primary" to="/"><Icon name="home" size={16} /> Ke overview</Link>
        {children}
      </div>
    </section>
  )
}

export function NotFound() {
  return (
    <ErrorScreen code="404" title="Halaman tidak ditemukan" text="Alamat ini tidak ada atau sudah dipindahkan. Cek lagi tautannya, atau buka daftar semua layar.">
      <Link className="btn" to="/screens">Lihat semua layar</Link>
    </ErrorScreen>
  )
}

export function Forbidden() {
  return (
    <ErrorScreen code="403" title="Akses ditolak" text="Peran Anda (Staf) tidak punya izin membuka laporan keuangan. Minta admin lembaga menambahkan izin di Pengaturan, Tim & peran.">
      <Link className="btn" to="/pengaturan/tim">Lihat peran</Link>
    </ErrorScreen>
  )
}

export function ServerError() {
  return (
    <ErrorScreen code="500" title="Terjadi kesalahan di server" text="Permintaan tidak bisa diproses. Ini contoh layar error; di demo ini tidak ada server sungguhan. Coba muat ulang halaman.">
      <button type="button" className="btn" onClick={() => window.location.reload()}><Icon name="refresh" size={16} /> Muat ulang</button>
    </ErrorScreen>
  )
}
