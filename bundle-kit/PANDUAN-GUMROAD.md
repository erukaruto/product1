# Panduan upload ke Gumroad: SaaSDrop + DashDrop

Panduan langkah demi langkah untuk memasang bundle di Gumroad, plus daftar periksa sebelum publish.

Catatan: saya tidak bisa membuka Gumroad dari lingkungan ini. Nama menu di bawah mengikuti tampilan Gumroad yang saya ketahui. Kalau ada label yang sedikit berbeda, cari menu dengan fungsi yang sama.

---

## Bagian A. Persiapan file (di komputer Anda)

### 1. Isi placeholder di dalam ZIP

File yang dikirim ke pembeli masih berisi placeholder berikut:

| Placeholder | Ada di file | Isi dengan |
| --- | --- | --- |
| `{{SELLER_NAME}}` | `LICENSE.md` (3 salinan) | Nama Anda atau nama usaha, untuk hak cipta |
| `{{SUPPORT_EMAIL}}` | `LICENSE.md`, `bundle-kit/bundle/README.md` | Email dukungan |
| `{{UPDATE_POLICY}}` | `LICENSE.md`, `bundle-kit/bundle/README.md` | Kebijakan update |
| `{{REFUND_POLICY}}` | `LICENSE.md` | Kebijakan refund |

Ketiga file `LICENSE.md` (`saasdrop/LICENSE.md`, `dashdrop/LICENSE.md`, `bundle-kit/bundle/LICENSE.md`) harus tetap sama persis. Edit satu, lalu salin ke dua lokasi lain.

### 2. Buat ulang ZIP

```bash
bash bundle-kit/scripts/make-zip.sh
```

Script ini membuat `bundle-kit/bundle.zip` tanpa `node_modules`, `dist` dan `.env`. Kalau masih ada placeholder, script menampilkan **WARNING** beserta nama filenya. Ulangi sampai tidak ada WARNING.

### 3. Uji ZIP seperti pembeli

Ekstrak `bundle.zip` ke folder baru, lalu jalankan:

```bash
cd saasdrop && npm install && npm run build
cd ../dashdrop && npm install && npm run build
```

Keduanya harus selesai dengan pesan `built in ...` tanpa error. Build DashDrop juga menjalankan pengecekan TypeScript; kalau ada error tipe, build berhenti dan menampilkan file serta barisnya.

### 4. Pasang demo online (disarankan)

Pembeli template hampir selalu ingin melihat demo. Deploy kedua produk (lihat bagian "Deploying both" di `bundle-kit/bundle/README.md`), lalu catat URL-nya untuk `{{DEMO_URL_SAASDROP}}` dan `{{DEMO_URL_DASHDROP}}`.

Saran: pakai dua subdomain, misalnya `saasdrop-demo.domainanda.com` dan `dashdrop-demo.domainanda.com`. Set `VITE_APP_URL` di demo SaaSDrop ke URL demo DashDrop, dan `VITE_SITE_URL` di demo DashDrop ke URL demo SaaSDrop. Dengan begitu tombol "Get started" di demo langsung membuka demo dashboard.

### 5. Siapkan teks

Buka `bundle-kit/LISTING.md` dan ganti semua placeholder (`{{DEMO_URL_...}}`, `{{SUPPORT_EMAIL}}`, `{{UPDATE_POLICY}}`, `{{REFUND_POLICY}}`, `{{GUMROAD_USERNAME}}`, `{{LAUNCH_END_DATE}}`). `{{GUMROAD_URL_BUNDLE}}` baru bisa diisi setelah produk dibuat.

---

## Bagian B. Produk satuan (kalau belum ada)

Agar perbandingan harga dan email upsell masuk akal, SaaSDrop ($25) dan DashDrop ($39) sebaiknya juga dijual sendiri-sendiri. Kalau keduanya belum ada di Gumroad, buat dulu dengan cara yang sama seperti Bagian C. Pakai ZIP berisi satu folder saja: `saasdrop/` atau `dashdrop/`, masing-masing sudah punya `README.md` dan `LICENSE.md` sendiri.

---

## Bagian C. Membuat produk bundle

### Pilihan jenis produk

Gumroad punya dua cara:

- **Produk digital biasa** dengan `bundle.zip` (disarankan). Pembeli mendapat satu ZIP berisi kedua template, README gabungan, dan lisensi. Semua materi dalam kit ini dibuat untuk cara ini.
- **Jenis produk "Bundle" bawaan Gumroad**, yang menggabungkan produk satuan yang sudah ada. Pembeli mendapat file masing-masing produk, tetapi tidak mendapat README gabungan. Kalau memilih cara ini, upload README gabungan sebagai file tambahan.

Langkah di bawah memakai cara pertama.

### Langkah

1. Masuk ke Gumroad, buka **Products**, klik **New product**.
2. Pilih jenis **Digital product**.
3. **Name:** salin dari bagian "Name" di `LISTING.md`.
4. **Price:** isi **49** (USD). Harga peluncuran diatur lewat kode diskon di langkah 15.
5. Klik lanjut ke halaman edit produk.
6. **Description:** salin bagian "Description" dari `LISTING.md`, per subjudul. Editor Gumroad mendukung judul, teks tebal dan daftar. Periksa daftar berbutir setelah ditempel.
7. **URL:** ganti permalink menjadi `saas-landing-dashboard-kit`.
8. **Cover:** upload gambar dari `bundle-kit/images/` dengan urutan berikut:
   1. `cover-1280x720.png`
   2. `gallery-1-same-look-1280x720.png`
   3. `gallery-2-whats-inside-1280x720.png`
   4. `gallery-3-themes-1280x720.png` (opsional)
   5. `gallery-4-mobile-1280x720.png` (opsional)
   6. `gallery-5-screens-1280x720.png` (opsional, menampilkan 8 dari 55 layar DashDrop)
9. **Thumbnail:** upload `thumbnail-600x600.png`.
10. **Summary:** salin dari bagian "Summary" di `LISTING.md`.
11. **Additional details:** isi pasangan key/value dari tabel di `LISTING.md`.
12. **Call to action:** pilih **Buy this** (atau biarkan **I want this!**).
13. **Content:** upload `bundle-kit/bundle.zip`. Tambahkan catatan singkat untuk pembeli, misalnya: "Mulai dari README.md di dalam ZIP. Butuh Node.js 20.19+ atau 22.12+."
14. **Tags dan kategori (Discover):** masukkan tag dari `LISTING.md`. Pilih kategori yang paling dekat, misalnya kategori desain atau pengembangan software untuk template web.
15. **Harga peluncuran:** buka **Checkout → Discounts → New discount**.
    - Code: misalnya `LAUNCH`
    - Product: hanya bundle ini
    - Potongan tetap **$10** (49 − 10 = 39)
    - Tanggal berakhir: `{{LAUNCH_END_DATE}}`

    Dengan cara ini harga kembali ke $49 secara otomatis. Bagikan link dengan kode terpasang: `https://{{GUMROAD_USERNAME}}.gumroad.com/l/saas-landing-dashboard-kit/LAUNCH`. Uji dulu di jendela private.
16. **Refund policy:** atur di pengaturan produk atau akun, sesuai `{{REFUND_POLICY}}`. Isinya harus sama dengan teks di deskripsi dan di `LICENSE.md`.
17. **Uji pembelian:** buat kode diskon 100% sekali pakai, beli produk sendiri, unduh ZIP, lalu periksa isinya. Hapus kode itu setelah selesai.
18. Klik **Publish**.
19. Salin URL produk, isi `{{GUMROAD_URL_BUNDLE}}` di posting peluncuran (`LISTING.md`), lalu posting di X dan LinkedIn.
20. Untuk pembeli lama, ikuti langkah kode diskon dan email di `UPSELL-EMAIL.md`.

---

## Daftar periksa sebelum publish

**File**
- [ ] Semua placeholder di `LICENSE.md` dan `bundle/README.md` sudah diisi.
- [ ] Ketiga `LICENSE.md` sama persis.
- [ ] `make-zip.sh` dijalankan ulang tanpa WARNING.
- [ ] ZIP sudah diuji: ekstrak, `npm install`, `npm run build` di kedua folder tanpa error.
- [ ] ZIP tidak berisi `node_modules`, `dist` atau `.env`. Script sudah mengecualikannya; cek ulang kalau Anda membuat ZIP secara manual.
- [ ] Teks contoh di `saasdrop/terms.html` dan `saasdrop/privacy.html` tetap ditandai sebagai contoh (ini untuk pembeli template, jadi biarkan peringatannya).

**Demo online**
- [ ] Halaman UI kit dan "All screens" di demo DashDrop boleh tetap ada (berguna untuk calon pembeli). README menjelaskan cara menghapusnya untuk pembeli yang tidak membutuhkannya.

**Halaman produk**
- [ ] Nama, summary, deskripsi dan FAQ sudah ditempel. Tidak ada `{{...}}` yang tersisa.
- [ ] Cover (urutan benar) dan thumbnail sudah terpasang.
- [ ] Harga $49, dan kode `LAUNCH` sudah diuji (harga menjadi $39, dengan tanggal berakhir).
- [ ] Halaman `saasdrop/security.html` tetap ditandai sebagai contoh. Jangan menulis sertifikasi keamanan yang tidak Anda miliki di demo Anda sendiri.
- [ ] Link demo bisa dibuka. Tombol "Get started" di demo SaaSDrop membuka demo DashDrop.
- [ ] Refund policy di Gumroad sama dengan teks di deskripsi dan lisensi.
- [ ] Email dukungan aktif dan bisa menerima pesan.

**Isi dan klaim**
- [ ] Deskripsi hanya berisi hal yang sudah diuji (lihat `AUDIT.md`). Kalau Anda menambah klaim, misalnya "teruji di Safari", uji dulu.
- [ ] Tidak ada testimoni, angka penjualan, atau logo "trusted by" yang tidak nyata. Kutipan Amara Okafor di template adalah konten demo dan jangan dipakai sebagai testimoni produk.
- [ ] Teks lisensi sudah Anda baca dan setujui. Teks itu draf, bukan nasihat hukum; pertimbangkan meminta orang yang paham hukum untuk memeriksanya.

**Setelah publish**
- [ ] Uji pembelian dengan kode 100% sudah dilakukan dan kodenya sudah dihapus.
- [ ] Posting peluncuran sudah memakai URL produk yang benar.
- [ ] Ingat tanggal berakhir harga peluncuran.
