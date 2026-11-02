/*
  Demo data for "Polyglot Nusantara Language Center" (fictional).
  Languages, levels, branches and teachers are the same as in LinguaDrop (src/data/school.js),
  so the landing site and the dashboard tell the same story. Edit both files together.
*/

export type LangCode = 'en' | 'ja' | 'ko' | 'zh' | 'ar' | 'de'
export type BranchId = 'bdg' | 'jkt' | 'online'
export interface Level { code: string; name: string; weeks: number; meetings: number; price: number; cefr: string; can: string }
export interface Language { code: LangCode; name: string; slug: string; native: string; hello: string; track: string; levels: Level[] }
export interface Branch { id: 'bdg' | 'jkt'; name: string; city: string; address: string; rooms: number; hours: string }
export interface TeacherBase { id: string; name: string; lang: LangCode; type: 'native' | 'lokal'; origin: string; years: number; cert: string; branch: BranchId; focus: string; quote: string; rating: number; students: number }

export const SCHOOL = {
  name: 'Polyglot Nusantara Language Center',
  short: 'Polyglot Nusantara',
  email: 'halo@polyglotnusantara.example',
  founded: 2014,
}

/** The dashboard's "today". Fixed so every screen and screenshot shows the same numbers. */
export const DEMO_TODAY = new Date(2026, 10, 18) // Rabu, 18 November 2026

export const LANGUAGES: Language[] = [
  {
    code: 'en', name: 'Inggris', slug: 'bahasa-inggris', native: 'English', hello: 'Hello', track: 'CEFR',
    levels: [
      { code: 'A1', name: 'Beginner', weeks: 12, meetings: 24, price: 1850000, cefr: 'A1', can: 'Memperkenalkan diri dan memahami kalimat sehari-hari yang sederhana.' },
      { code: 'A2', name: 'Elementary', weeks: 12, meetings: 24, price: 1850000, cefr: 'A2', can: 'Bercerita tentang rutinitas, belanja, dan arah jalan.' },
      { code: 'B1', name: 'Intermediate', weeks: 12, meetings: 24, price: 1950000, cefr: 'B1', can: 'Menangani situasi saat bepergian dan menulis teks pendek yang runtut.' },
      { code: 'B2', name: 'Upper Intermediate', weeks: 12, meetings: 24, price: 2150000, cefr: 'B2', can: 'Berdiskusi dengan lancar dan memahami ide utama teks kompleks.' },
      { code: 'C1', name: 'Advanced', weeks: 14, meetings: 28, price: 2350000, cefr: 'C1', can: 'Presentasi, negosiasi, dan menulis esai akademik terstruktur.' },
      { code: 'C2', name: 'Proficiency', weeks: 14, meetings: 28, price: 2450000, cefr: 'C2', can: 'Memahami hampir semua yang didengar dan dibaca dengan nuansa.' },
    ],
  },
  {
    code: 'ja', name: 'Jepang', slug: 'bahasa-jepang', native: '日本語', hello: 'こんにちは', track: 'JLPT',
    levels: [
      { code: 'N5', name: 'Dasar 1', weeks: 16, meetings: 32, price: 2250000, cefr: '≈ A1', can: 'Membaca hiragana, katakana, dan sekitar 100 kanji dasar.' },
      { code: 'N4', name: 'Dasar 2', weeks: 16, meetings: 32, price: 2250000, cefr: '≈ A2', can: 'Percakapan sehari-hari pelan dan sekitar 300 kanji.' },
      { code: 'N3', name: 'Menengah', weeks: 20, meetings: 40, price: 2650000, cefr: '≈ B1', can: 'Memahami percakapan normal dan artikel sederhana.' },
      { code: 'N2', name: 'Menengah atas', weeks: 24, meetings: 48, price: 2950000, cefr: '≈ B2', can: 'Membaca koran dan bekerja di lingkungan berbahasa Jepang.' },
      { code: 'N1', name: 'Mahir', weeks: 24, meetings: 48, price: 3150000, cefr: '≈ C1', can: 'Memahami teks abstrak dan wacana lisan dalam berbagai konteks.' },
    ],
  },
  {
    code: 'ko', name: 'Korea', slug: 'bahasa-korea', native: '한국어', hello: '안녕하세요', track: 'TOPIK',
    levels: [
      { code: 'TOPIK 1', name: 'Pemula', weeks: 12, meetings: 24, price: 2150000, cefr: '≈ A1', can: 'Membaca hangeul dan menyapa dengan sopan.' },
      { code: 'TOPIK 2', name: 'Dasar', weeks: 12, meetings: 24, price: 2150000, cefr: '≈ A2', can: 'Menggunakan sekitar 1.500 kosakata untuk kebutuhan harian.' },
      { code: 'TOPIK 3', name: 'Menengah 1', weeks: 16, meetings: 32, price: 2450000, cefr: '≈ B1', can: 'Bercakap di tempat umum dan menjaga relasi sosial.' },
      { code: 'TOPIK 4', name: 'Menengah 2', weeks: 16, meetings: 32, price: 2450000, cefr: '≈ B2', can: 'Memahami berita dan teks umum di tempat kerja.' },
      { code: 'TOPIK 5', name: 'Mahir 1', weeks: 20, meetings: 40, price: 2850000, cefr: '≈ C1', can: 'Bekerja dan meneliti dalam bahasa Korea.' },
      { code: 'TOPIK 6', name: 'Mahir 2', weeks: 20, meetings: 40, price: 2850000, cefr: '≈ C1+', can: 'Berbahasa hampir setara penutur asli di bidang profesional.' },
    ],
  },
  {
    code: 'zh', name: 'Mandarin', slug: 'bahasa-mandarin', native: '中文', hello: '你好', track: 'HSK',
    levels: [
      { code: 'HSK 1', name: 'Pemula', weeks: 10, meetings: 20, price: 2050000, cefr: '≈ A1', can: 'Menguasai pinyin, nada, dan 150 kosakata.' },
      { code: 'HSK 2', name: 'Dasar', weeks: 10, meetings: 20, price: 2050000, cefr: '≈ A1+', can: 'Komunikasi sederhana sekitar 300 kosakata.' },
      { code: 'HSK 3', name: 'Menengah 1', weeks: 14, meetings: 28, price: 2350000, cefr: '≈ A2', can: 'Bertahan di perjalanan dan pekerjaan dasar di Tiongkok.' },
      { code: 'HSK 4', name: 'Menengah 2', weeks: 16, meetings: 32, price: 2550000, cefr: '≈ B1', can: 'Diskusi topik umum dengan sekitar 1.200 kosakata.' },
      { code: 'HSK 5', name: 'Mahir 1', weeks: 20, meetings: 40, price: 2850000, cefr: '≈ B2', can: 'Membaca koran dan menonton film berbahasa Mandarin.' },
      { code: 'HSK 6', name: 'Mahir 2', weeks: 20, meetings: 40, price: 2950000, cefr: '≈ C1', can: 'Mengekspresikan diri dengan lancar secara lisan dan tulisan.' },
    ],
  },
  {
    code: 'ar', name: 'Arab', slug: 'bahasa-arab', native: 'العربية', hello: 'مرحبا', track: 'CEFR',
    levels: [
      { code: 'A1', name: 'Mubtadi 1', weeks: 12, meetings: 24, price: 1750000, cefr: 'A1', can: 'Membaca huruf hijaiah bersambung dan menyapa.' },
      { code: 'A2', name: 'Mubtadi 2', weeks: 12, meetings: 24, price: 1750000, cefr: 'A2', can: 'Percakapan dasar tentang keluarga, pekerjaan, dan belanja.' },
      { code: 'B1', name: 'Mutawassith 1', weeks: 14, meetings: 28, price: 1950000, cefr: 'B1', can: 'Memahami teks berita pendek dan bercerita di masa lampau.' },
      { code: 'B2', name: 'Mutawassith 2', weeks: 14, meetings: 28, price: 2150000, cefr: 'B2', can: 'Berdiskusi dan menulis paragraf argumentatif.' },
      { code: 'C1', name: 'Mutaqaddim', weeks: 16, meetings: 32, price: 2350000, cefr: 'C1', can: 'Membaca teks akademik dan presentasi formal.' },
    ],
  },
  {
    code: 'de', name: 'Jerman', slug: 'bahasa-jerman', native: 'Deutsch', hello: 'Hallo', track: 'CEFR',
    levels: [
      { code: 'A1', name: 'Grundstufe 1', weeks: 10, meetings: 30, price: 2350000, cefr: 'A1', can: 'Memperkenalkan diri dan mengisi formulir sederhana.' },
      { code: 'A2', name: 'Grundstufe 2', weeks: 10, meetings: 30, price: 2350000, cefr: 'A2', can: 'Menangani urusan sehari-hari dan janji temu.' },
      { code: 'B1', name: 'Mittelstufe 1', weeks: 12, meetings: 36, price: 2750000, cefr: 'B1', can: 'Syarat umum Ausbildung dan visa kerja tertentu.' },
      { code: 'B2', name: 'Mittelstufe 2', weeks: 12, meetings: 36, price: 2950000, cefr: 'B2', can: 'Syarat banyak program studi dan profesi kesehatan.' },
      { code: 'C1', name: 'Oberstufe', weeks: 14, meetings: 42, price: 3150000, cefr: 'C1', can: 'Kuliah di universitas berbahasa Jerman.' },
    ],
  },
]

export const LANG_CODES: LangCode[] = ['en', 'ja', 'ko', 'zh', 'ar', 'de']
export const langByCode = (code: string): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
export const langName = (code: string) => langByCode(code).name
/** HTML lang value for foreign text samples. */
export const HTML_LANG: Record<LangCode, string> = { en: 'en', ja: 'ja', ko: 'ko', zh: 'zh-Hans', ar: 'ar', de: 'de' }

export const BRANCHES: Branch[] = [
  { id: 'bdg', name: 'Bandung – Dago', city: 'Bandung', address: 'Jl. Ir. H. Juanda No. 118, Dago, Coblong, Bandung 40135', rooms: 9, hours: 'Senin–Jumat 08.00–21.00, Sabtu 08.00–17.00' },
  { id: 'jkt', name: 'Jakarta – Tebet', city: 'Jakarta Selatan', address: 'Jl. Tebet Raya No. 45, Tebet, Jakarta Selatan 12820', rooms: 7, hours: 'Senin–Jumat 09.00–21.00, Sabtu 08.00–16.00' },
]
export const branchName = (id: string) => (id === 'online' ? 'Online' : BRANCHES.find((b) => b.id === id)?.name ?? id)

export const TEACHERS_BASE: TeacherBase[] = [
  { id: 'daniel-whitmore', name: 'Daniel Whitmore', lang: 'en', type: 'native', origin: 'Manchester, Inggris', years: 11, cert: 'CELTA, DELTA Modul 2', branch: 'bdg', focus: 'IELTS dan Business English', quote: 'Kelas yang bagus terasa seperti obrolan yang punya arah.', rating: 4.9, students: 612 },
  { id: 'grace-oconnell', name: "Grace O'Connell", lang: 'en', type: 'native', origin: 'Cork, Irlandia', years: 8, cert: 'CELTA, TKT', branch: 'jkt', focus: 'Conversation dan Kids & Teens', quote: 'Kesalahan adalah data. Kita pakai untuk melangkah.', rating: 4.8, students: 438 },
  { id: 'sarah-mitchell', name: 'Sarah Mitchell', lang: 'en', type: 'native', origin: 'Perth, Australia', years: 6, cert: 'CELTA', branch: 'online', focus: 'TOEFL iBT dan kelas online', quote: 'Rutin 20 menit sehari lebih kuat dari 3 jam sekali seminggu.', rating: 4.8, students: 351 },
  { id: 'rizky-pratama', name: 'Rizky Pratama', lang: 'en', type: 'lokal', origin: 'Bandung', years: 9, cert: 'S2 TESOL, TOEFL ITP 640', branch: 'bdg', focus: 'TOEFL ITP dan General English', quote: 'Grammar itu peta, bukan pagar.', rating: 4.9, students: 724 },
  { id: 'anindya-kusuma', name: 'Anindya Kusuma', lang: 'en', type: 'lokal', origin: 'Jakarta', years: 7, cert: 'S1 Sastra Inggris, IELTS 8.0', branch: 'jkt', focus: 'IELTS Writing dan Speaking', quote: 'Writing band 7 itu soal struktur, bukan kosakata langka.', rating: 4.8, students: 509 },
  { id: 'haruka-tanaka', name: 'Haruka Tanaka', lang: 'ja', type: 'native', origin: 'Osaka, Jepang', years: 10, cert: 'Sertifikat Pengajar Bahasa Jepang (420 jam)', branch: 'bdg', focus: 'JLPT N3–N1 dan persiapan kerja', quote: '一歩ずつ。Selangkah demi selangkah.', rating: 4.9, students: 455 },
  { id: 'kenji-morimoto', name: 'Kenji Morimoto', lang: 'ja', type: 'native', origin: 'Sapporo, Jepang', years: 5, cert: 'J.TEST Pengajar', branch: 'online', focus: 'Kaiwa (percakapan) dan budaya kerja', quote: 'Bahasa Jepang terasa hidup saat dipakai bercanda.', rating: 4.7, students: 268 },
  { id: 'dewi-anggraini', name: 'Dewi Anggraini', lang: 'ja', type: 'lokal', origin: 'Yogyakarta', years: 12, cert: 'JLPT N1, S2 Pendidikan Bahasa Jepang', branch: 'jkt', focus: 'JLPT N5–N3 dan kanji', quote: 'Kanji itu cerita bergambar. Hafalkan ceritanya.', rating: 4.9, students: 803 },
  { id: 'fajar-nugroho', name: 'Fajar Nugroho', lang: 'ja', type: 'lokal', origin: 'Semarang', years: 6, cert: 'JLPT N2, eks-pekerja magang Jepang', branch: 'bdg', focus: 'Program kerja (Tokutei Ginou)', quote: 'Saya pernah duduk di kursi kalian. Kita bisa.', rating: 4.8, students: 390 },
  { id: 'kim-jiyeon', name: 'Kim Ji-yeon', lang: 'ko', type: 'native', origin: 'Busan, Korea Selatan', years: 7, cert: 'Sertifikat Pengajar Bahasa Korea Tingkat 2', branch: 'jkt', focus: 'TOPIK II dan pelafalan', quote: '천천히 해도 괜찮아요. Pelan-pelan tidak apa-apa.', rating: 4.9, students: 377 },
  { id: 'park-minjun', name: 'Park Min-jun', lang: 'ko', type: 'native', origin: 'Seoul, Korea Selatan', years: 4, cert: 'S1 Pendidikan Bahasa Korea', branch: 'online', focus: 'Percakapan dan EPS-TOPIK', quote: 'Belajar dari drama boleh, asal tahu konteksnya.', rating: 4.7, students: 214 },
  { id: 'salsabila-putri', name: 'Salsabila Putri', lang: 'ko', type: 'lokal', origin: 'Bandung', years: 5, cert: 'TOPIK 6, S1 Bahasa dan Kebudayaan Korea', branch: 'bdg', focus: 'TOPIK I dan kelas remaja', quote: 'Hangeul bisa dibaca dalam satu sore. Serius.', rating: 4.8, students: 466 },
  { id: 'yoga-saputra', name: 'Yoga Adi Saputra', lang: 'ko', type: 'lokal', origin: 'Bekasi', years: 3, cert: 'TOPIK 5', branch: 'jkt', focus: 'EPS-TOPIK untuk kerja', quote: 'Target jelas, jadwal jelas, hasil jelas.', rating: 4.6, students: 182 },
  { id: 'li-mei', name: 'Li Mei', lang: 'zh', type: 'native', origin: 'Chengdu, Tiongkok', years: 9, cert: 'Sertifikat Guru Bahasa Mandarin Internasional', branch: 'jkt', focus: 'HSK 4–6 dan Business Mandarin', quote: '学而时习之。Belajar lalu mengulang.', rating: 4.9, students: 420 },
  { id: 'chen-wei', name: 'Chen Wei', lang: 'zh', type: 'native', origin: 'Xiamen, Tiongkok', years: 6, cert: 'S2 Pengajaran Bahasa Mandarin', branch: 'online', focus: 'Nada dan percakapan', quote: 'Nada yang tepat membuat orang langsung paham.', rating: 4.8, students: 301 },
  { id: 'vania-halim', name: 'Vania Halim', lang: 'zh', type: 'lokal', origin: 'Medan', years: 8, cert: 'HSK 6, S1 Sastra Tiongkok', branch: 'bdg', focus: 'HSK 1–3 dan Kids Mandarin', quote: 'Anak-anak belajar nada lewat lagu lebih cepat dari kita.', rating: 4.8, students: 512 },
  { id: 'steven-gunawan', name: 'Steven Gunawan', lang: 'zh', type: 'lokal', origin: 'Surabaya', years: 4, cert: 'HSK 5', branch: 'jkt', focus: 'Mandarin untuk bisnis dan dagang', quote: 'Satu kalimat Mandarin yang tepat bisa membuka negosiasi.', rating: 4.7, students: 205 },
  { id: 'yusuf-mahmoud', name: 'Yusuf Mahmoud', lang: 'ar', type: 'native', origin: 'Alexandria, Mesir', years: 10, cert: 'S2 Pengajaran Bahasa Arab untuk Non-Arab', branch: 'bdg', focus: "Fusha, muhadatsah, dan qira'ah", quote: 'Bahasa Arab itu matematika yang bernyanyi.', rating: 4.9, students: 388 },
  { id: 'nurul-hidayah', name: 'Nurul Hidayah', lang: 'ar', type: 'lokal', origin: 'Malang', years: 9, cert: 'S2 Pendidikan Bahasa Arab', branch: 'jkt', focus: 'Nahwu-sharaf dan persiapan studi Timur Tengah', quote: 'Pahami pola, maka ribuan kata terbuka.', rating: 4.8, students: 497 },
  { id: 'ilham-fauzi', name: 'Muhammad Ilham Fauzi', lang: 'ar', type: 'lokal', origin: 'Garut', years: 4, cert: 'Lulusan Universitas di Kairo (fiktif)', branch: 'online', focus: 'Arab percakapan untuk umrah dan kerja', quote: 'Mulai dari kalimat yang langsung terpakai.', rating: 4.7, students: 233 },
  { id: 'lukas-becker', name: 'Lukas Becker', lang: 'de', type: 'native', origin: 'Hamburg, Jerman', years: 8, cert: 'Sertifikat Pengajar DaF', branch: 'bdg', focus: 'B1–C1 dan persiapan studi', quote: 'Grammatik ist kein Monster. Grammar bukan monster.', rating: 4.8, students: 342 },
  { id: 'anna-schneider', name: 'Anna Schneider', lang: 'de', type: 'native', origin: 'Leipzig, Jerman', years: 5, cert: 'S2 Deutsch als Fremdsprache', branch: 'online', focus: 'Pelafalan dan Sprechen', quote: 'Bicara dulu, sempurnakan kemudian.', rating: 4.8, students: 256 },
  { id: 'teguh-santoso', name: 'Teguh Santoso', lang: 'de', type: 'lokal', origin: 'Solo', years: 11, cert: 'Sertifikat B2/C1, S1 Pendidikan Bahasa Jerman', branch: 'jkt', focus: 'A1–B1 dan program Ausbildung', quote: 'Konsisten 6 bulan bisa mengubah karier.', rating: 4.9, students: 689 },
  { id: 'maria-siregar', name: 'Maria Christina Siregar', lang: 'de', type: 'lokal', origin: 'Pematangsiantar', years: 6, cert: 'Sertifikat C1, eks-au pair di Jerman', branch: 'bdg', focus: 'Pflege (perawat) dan Au Pair', quote: 'Bahasa adalah tiket. Saya bantu kalian mencetaknya.', rating: 4.8, students: 318 },
]

export const PRIVATE_RATES = [
  { teacher: 'Pengajar lokal', mode: 'Online', price: 165000 },
  { teacher: 'Pengajar lokal', mode: 'Offline di cabang', price: 185000 },
  { teacher: 'Pengajar native', mode: 'Online', price: 245000 },
  { teacher: 'Pengajar native', mode: 'Offline di cabang', price: 275000 },
]
export const REGISTRATION_FEE = 150000
