# Panduan menjual LinguaDrop + LinguaDash di Gumroad

Panduan ini untuk Anda sebagai penjual (Hanshi Studio). Isinya: menyiapkan file, membuat 3 produk di Gumroad,
mengisi halaman produk dari `LISTING.md`, dan merilis update gratis.

## 1. Isi folder ini

| File / folder | Untuk apa |
| --- | --- |
| `README.md` | README di dalam ZIP untuk pembeli (bagian "khusus penjual" otomatis dibuang saat ZIP dibuat) |
| `LICENSE.md` | Lisensi: Hanshi Studio, alihasanash@gmail.com, update gratis selamanya, refund 7 hari |
| `AUDIT.md` | Angka nyata dari kode dan hasil tes, ikut dikirim di dalam ZIP |
| `LISTING.md` | Teks halaman Gumroad dalam bahasa Inggris: nama, ringkasan, deskripsi, tag, harga, FAQ, post peluncuran |
| `verify-results.json` | Hasil tes Playwright lengkap (bukti untuk AUDIT.md) |
| `images/` | Cover 1280×720, thumbnail 600×600, dan 5 gambar galeri 1280×720 dari screenshot asli |
| `screenshots/` | Screenshot mentah (2×) yang dipakai untuk gambar galeri |
| `scripts/` | `run-verify.sh` (tes), `serve.sh` + `screenshots.cjs` + `render-images.cjs` (gambar), `make-zip.sh` (ZIP) |

## 2. Sebelum upload: cek ulang dan buat ZIP

Jalankan dari folder repo (butuh Node 20.19+ dan Playwright Chromium).

```bash
# 1) Tes semua halaman, tema, ukuran layar, aksesibilitas, dan alur form
bash bundle-kit-lingua/scripts/run-verify.sh
#    Hasilnya di bundle-kit-lingua/verify-results.json. Kode keluar 0 berarti tidak ada masalah.

# 2) (Opsional) buat ulang screenshot dan gambar Gumroad
bash bundle-kit-lingua/scripts/serve.sh            # biarkan berjalan di terminal ini
node bundle-kit-lingua/scripts/screenshots.cjs     # di terminal lain
node bundle-kit-lingua/scripts/render-images.cjs

# 3) Buat ZIP tanpa node_modules dan dist, sekaligus cek placeholder yang tersisa
bash bundle-kit-lingua/scripts/make-zip.sh
```

`make-zip.sh` berhenti dengan peringatan jika masih ada `{{PLACEHOLDER}}`, `TODO`, `FIXME`, atau "lorem ipsum" di dalam ZIP.

ZIP bundle berisi `linguadrop/`, `linguadash/`, `README.md`, `LICENSE.md`, dan `AUDIT.md`. Untuk produk satuan, buat ZIP terpisah:

```bash
cd linguadrop && zip -qr ../LinguaDrop.zip . -x 'node_modules/*' 'dist/*' '.env' && cd ..
cd linguadash && zip -qr ../LinguaDash.zip . -x 'node_modules/*' 'dist/*' '.env' '*.tsbuildinfo' && cd ..
```

## 3. Buat 3 produk di Gumroad

Buat **LinguaDrop**, **LinguaDash**, dan **LinguaDrop + LinguaDash Bundle** sebagai tiga produk terpisah.
Untuk tiap produk:

1. Buka **Products → New product → Digital product**.
2. **Name**: ambil dari `LISTING.md` bagian "Product names".
3. **Price**: lihat saran harga di `LISTING.md`. Untuk harga Rupiah, atur mata uang di Settings, atau tetap pakai USD (Gumroad mengonversi sendiri).
4. **Description**: salin blok deskripsi produk itu dari `LISTING.md`. Editor Gumroad menerima heading, daftar, dan tautan.
5. **Cover**: unggah `images/cover-1280x720.png` lebih dulu, lalu `gallery-1` sampai `gallery-5` (urutan galeri = urutan unggah).
6. **Thumbnail**: `images/thumbnail-600x600.png`.
7. **Content → Upload files**: unggah ZIP yang sesuai.
8. **Summary**: isi satu kalimat dari "Short summary" di `LISTING.md`.
9. **Tags**: salin dari bagian "Tags" (maksimal 5 tag yang paling relevan untuk tiap produk).
10. **Refund policy**: pilih **7-day refund**, sama dengan isi `LICENSE.md`.
11. Klik **Publish**, lalu buka halaman produk dalam mode logout untuk mengecek tampilannya.

Untuk bundle, tambahkan juga **Upsell** atau **Offer code** di produk satuan, misalnya kode `BUNDLE15` untuk pembeli
LinguaDrop yang ingin menambah LinguaDash. Teks ajakannya ada di `LISTING.md`.

## 4. Klaim yang boleh dan tidak boleh

Selalu jujur di halaman produk, di media sosial, dan saat membalas pembeli.

**Boleh** (semuanya terbukti di `AUDIT.md` dan `verify-results.json`):
- 47 halaman LinguaDrop, 74 layar LinguaDash (73 rute + 404)
- 3 tema, responsif sampai lebar 360 px
- TypeScript strict, chart SVG buatan sendiri
- angka hasil tes otomatis persis seperti di AUDIT.md

**Jangan diklaim:**
- ada backend, database, atau login sungguhan;
- ada payment gateway, WhatsApp API, atau pengiriman email;
- "100% accessible" atau "WCAG compliant" tanpa catatan. Tulis "lolos pemeriksaan otomatis axe-core WCAG 2.x A/AA di 3 tema", lalu sebutkan bahwa audit manual dengan pembaca layar belum dilakukan;
- data alumni, testimoni, dan skor sebagai data nyata. Semuanya fiktif.

## 5. Merilis update (gratis selamanya)

1. Ubah kode, jalankan lagi `run-verify.sh`, perbarui `AUDIT.md` jika angkanya berubah.
2. Jalankan `make-zip.sh`.
3. Di Gumroad, buka produk → **Content**, ganti file ZIP lama.
4. Kirim pemberitahuan lewat **Emails → New email → Customers of …**: isinya daftar perubahan singkat dan pengingat bahwa update gratis.

## 6. Menjawab pembeli

- **Refund**: dalam 7 hari sejak pembelian, setujui tanpa pertanyaan lewat **Sales → Refund**.
- **Pertanyaan teknis**: arahkan ke README tiap produk (cara pakai, struktur, cara menyambungkan API).
- **Permintaan UI bahasa Inggris**: jelaskan bahwa teks antarmuka berbahasa Indonesia dan perlu diterjemahkan. Semua teks ada di file `.html` (LinguaDrop) dan `src/pages/*.tsx` (LinguaDash).
