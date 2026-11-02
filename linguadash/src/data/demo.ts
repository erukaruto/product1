/*
  Generated demo data. Everything comes from one fixed seed (SEED in lib/prng.ts), so the
  dashboard shows the same students, invoices and numbers on every load and in every screenshot.
  To plug in a real API, replace the exports of this file with fetch calls that return the same shapes.
*/
import { seeded } from '../lib/prng.ts'
import { addDays, isoDate } from '../lib/format.ts'
import {
  BRANCHES, DEMO_TODAY, LANGUAGES, LANG_CODES, TEACHERS_BASE, langByCode,
  type BranchId, type LangCode, type TeacherBase,
} from './school.ts'
import { PLACEMENT_QUESTIONS } from './placement.ts'

const rng = seeded(20260417)
const TODAY = DEMO_TODAY

// ---------- Types ----------
export type StudentStatus = 'aktif' | 'cuti' | 'lulus' | 'berhenti'
export type Skill = 'listening' | 'speaking' | 'reading' | 'writing'
export const SKILLS: Skill[] = ['listening', 'speaking', 'reading', 'writing']
export const SKILL_LABEL: Record<Skill, string> = { listening: 'Listening', speaking: 'Speaking', reading: 'Reading', writing: 'Writing' }
export type Scores = Record<Skill, number>

export interface LevelStep { level: string; start: string; end?: string; final?: number; result: 'lulus' | 'berjalan' | 'mengulang' }
export interface Student {
  id: string
  name: string
  gender: 'P' | 'L'
  birth: string
  phone: string
  email: string
  parent?: { name: string; phone: string }
  lang: LangCode
  level: string
  program: string
  branch: BranchId
  classId: string
  status: StudentStatus
  joined: string
  attendance: number
  scores: Scores
  history: LevelStep[]
  source: string
  note?: string
}
export interface Teacher extends TeacherBase {
  email: string
  phone: string
  rate: number
  joined: string
}
export interface ClassGroup {
  id: string
  name: string
  lang: LangCode
  level: string
  program: string
  branch: BranchId
  room: string
  link?: string
  teacherId: string
  days: number[] // 1 = Senin ... 6 = Sabtu, 0 = Minggu
  start: string // "18:30"
  minutes: number
  capacity: number
  startDate: string
  meetings: number
  meetingsDone: number
}
export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa'
export interface Session { classId: string; meeting: number; date: string; topic: string; records: Record<string, AttendanceStatus> }
export type InvoiceStatus = 'lunas' | 'belum-bayar' | 'jatuh-tempo' | 'sebagian' | 'draf'
export interface InvoiceItem { desc: string; qty: number; price: number }
export interface Invoice { id: string; studentId: string; items: InvoiceItem[]; discount: number; promo?: string; issued: string; due: string; paid: number; note?: string }
export interface Payment { id: string; invoiceId: string; studentId: string; amount: number; date: string; method: string }
export type TrialStatus = 'terjadwal' | 'hadir' | 'mendaftar' | 'tidak-lanjut' | 'tidak-hadir'
export interface Trial { id: string; name: string; phone: string; email: string; age: number; lang: LangCode; level: string; mode: BranchId; date: string; slot: string; teacherId: string; status: TrialStatus; source: string; note: string }
export interface PlacementResult {
  id: string
  name: string
  phone: string
  email: string
  lang: LangCode
  date: string
  type: 'Online (situs)' | 'Tertulis + lisan di cabang'
  sections: { name: string; score: number; max: number }[]
  answers?: number[] // index chosen per question, for the online English test
  level: string
  status: 'menunggu' | 'ditetapkan'
  classId?: string
}
export interface MockTest { id: string; exam: 'TOEFL ITP' | 'IELTS' | 'JLPT N3' | 'JLPT N4' | 'TOPIK II' | 'HSK 4'; lang: LangCode; date: string; title: string; status: 'selesai' | 'terjadwal'; studentIds: string[] }
export interface Promo { code: string; name: string; type: 'persen' | 'nominal'; value: number; used: number; quota: number; until: string; active: boolean; scope: string }

// ---------- Names ----------
const FEMALE = ['Aulia', 'Nadia', 'Putri', 'Salma', 'Kirana', 'Alya', 'Zahra', 'Nabila', 'Rania', 'Citra', 'Intan', 'Shafira', 'Tiara', 'Amanda', 'Laras', 'Maharani', 'Sekar', 'Dinda', 'Keisha', 'Naura', 'Clarissa', 'Felicia', 'Michelle', 'Gita', 'Yuliana', 'Fitri', 'Anisa', 'Ratna', 'Elsa', 'Hana', 'Jihan', 'Melati', 'Olivia', 'Priska', 'Qonita', 'Sinta', 'Talitha', 'Wulan']
const MALE = ['Rafi', 'Dimas', 'Arya', 'Bagas', 'Fikri', 'Raka', 'Galih', 'Haikal', 'Iqbal', 'Kevin', 'Nathan', 'Rizal', 'Satria', 'Taufik', 'Wahyu', 'Yudha', 'Akbar', 'Daffa', 'Farhan', 'Gilang', 'Hendra', 'Ivan', 'Jonathan', 'Kenzie', 'Raditya', 'Bima', 'Reza', 'Andre', 'Evan', 'Lutfi', 'Naufal', 'Oscar', 'Pandu', 'Rendy', 'Timotius', 'Umar']
const LAST = ['Pratama', 'Saputra', 'Wijaya', 'Santoso', 'Hidayat', 'Nugraha', 'Kusuma', 'Siregar', 'Nasution', 'Harahap', 'Lubis', 'Gunawan', 'Halim', 'Setiawan', 'Permana', 'Ramadhan', 'Firmansyah', 'Purnomo', 'Wibisono', 'Hutapea', 'Simanjuntak', 'Situmorang', 'Sinaga', 'Rahman', 'Maulana', 'Syahputra', 'Anggraeni', 'Lestari', 'Puspita', 'Wulandari', 'Utami', 'Rahmawati', 'Kurniawan', 'Susanto', 'Sutanto', 'Pangestu', 'Sudrajat', 'Suherman', 'Tanjung', 'Hakim']
const SOURCES = ['Instagram', 'Google', 'Rekomendasi teman', 'TikTok', 'Situs web', 'Sekolah/kampus']
const PHONE = () => `+62 800-${rng.int(1000, 9999)}-${rng.int(1000, 9999)}`
const mailOf = (name: string, n: number) => `${name.toLowerCase().replace(/[^a-z ]/g, '').trim().split(/\s+/).join('.')}${n % 3 === 0 ? n % 100 : ''}@mail.example`

function personName(gender: 'P' | 'L') {
  const first = gender === 'P' ? rng.pick(FEMALE) : rng.pick(MALE)
  return rng.chance(0.15) ? `${first} ${rng.pick(LAST)} ${rng.pick(LAST)}`.replace(/(\w+) (\w+) \2/, '$1 $2') : `${first} ${rng.pick(LAST)}`
}
const dateBack = (days: number) => isoDate(addDays(TODAY, -days))

// ---------- Teachers ----------
export const TEACHERS: Teacher[] = TEACHERS_BASE.map((t, i) => ({
  ...t,
  email: `${t.id.split('-')[0]}@polyglotnusantara.example`,
  phone: PHONE(),
  rate: t.type === 'native' ? 185000 + (t.years % 4) * 10000 : 110000 + Math.min(t.years, 12) * 4000,
  joined: dateBack(200 + ((i * 97) % 2400)),
}))
export const teacherById = (id: string) => TEACHERS.find((t) => t.id === id)

// ---------- Rooms & classes ----------
export const ROOMS: Record<'bdg' | 'jkt', { name: string; capacity: number; facility: string }[]> = {
  bdg: [
    { name: 'Ruang London', capacity: 12, facility: 'TV 55", whiteboard' },
    { name: 'Ruang Tokyo', capacity: 12, facility: 'TV 55", tatami corner' },
    { name: 'Ruang Seoul', capacity: 10, facility: 'Proyektor' },
    { name: 'Ruang Beijing', capacity: 10, facility: 'Proyektor' },
    { name: 'Ruang Kairo', capacity: 10, facility: 'Whiteboard' },
    { name: 'Ruang Berlin', capacity: 12, facility: 'TV 55"' },
    { name: 'Lab Listening', capacity: 16, facility: '16 headset, PC' },
    { name: 'Kids Corner', capacity: 8, facility: 'Karpet, rak buku' },
    { name: 'Ruang Privat 1', capacity: 2, facility: 'Meja kecil' },
  ],
  jkt: [
    { name: 'Ruang Oxford', capacity: 12, facility: 'TV 65"' },
    { name: 'Ruang Kyoto', capacity: 10, facility: 'Proyektor' },
    { name: 'Ruang Busan', capacity: 10, facility: 'Proyektor' },
    { name: 'Ruang Shanghai', capacity: 10, facility: 'Whiteboard' },
    { name: 'Ruang Madinah', capacity: 10, facility: 'Whiteboard' },
    { name: 'Ruang München', capacity: 12, facility: 'TV 55"' },
    { name: 'Studio Rekaman', capacity: 4, facility: 'Mikrofon, peredam' },
  ],
}

const DAY_SETS: number[][] = [[1, 3], [2, 4], [3, 5], [6], [1, 4], [2, 5], [6, 0]]
const STARTS = ['09:00', '10:30', '13:00', '15:30', '16:00', '18:30', '19:00']
const PROGRAM_BY_LANG: Record<LangCode, string[]> = {
  en: ['General', 'General', 'Conversation', 'Business English', 'Kids & Teens', 'Persiapan IELTS', 'Persiapan TOEFL'],
  ja: ['General', 'General', 'Persiapan JLPT', 'Kids & Teens'],
  ko: ['General', 'General', 'Persiapan TOPIK', 'Conversation'],
  zh: ['General', 'Persiapan HSK', 'Kids & Teens'],
  ar: ['General', 'Conversation'],
  de: ['General', 'General', 'Persiapan studi & kerja'],
}
const LANG_WEIGHT: [LangCode, number][] = [['en', 34], ['ja', 20], ['ko', 18], ['zh', 11], ['ar', 8], ['de', 9]]

const classes: ClassGroup[] = []
{
  let n = 100
  const roomUse: Record<string, number> = {}
  for (const code of LANG_CODES) {
    const lang = langByCode(code)
    const count = code === 'en' ? 14 : code === 'ja' || code === 'ko' ? 9 : 6
    for (let i = 0; i < count; i++) {
      const level = lang.levels[Math.min(lang.levels.length - 1, Math.floor((i / count) * lang.levels.length * 0.85 + rng.next() * 1.2))]
      const branch: BranchId = rng.weighted([['bdg', 45], ['jkt', 35], ['online', 20]] as const)
      const teachers = TEACHERS.filter((t) => t.lang === code)
      const teacher = teachers.find((t) => t.branch === branch && rng.chance(0.7)) ?? rng.pick(teachers)
      const days = rng.pick(DAY_SETS)
      const start = rng.pick(STARTS)
      const program = rng.pick(PROGRAM_BY_LANG[code])
      const meetings = level.meetings
      const startDate = addDays(TODAY, -rng.int(7, Math.round(level.weeks * 7 * 0.92)))
      const elapsedWeeks = Math.floor((TODAY.getTime() - startDate.getTime()) / (7 * 864e5))
      const meetingsDone = Math.min(meetings - 1, Math.max(1, elapsedWeeks * days.length))
      let room = 'Zoom'
      if (branch !== 'online') {
        const list = ROOMS[branch]
        const idx = (roomUse[branch] = ((roomUse[branch] ?? -1) + 1) % (list.length - 1))
        room = program === 'Kids & Teens' && branch === 'bdg' ? 'Kids Corner' : list[idx].name
      }
      const id = `K-${++n}`
      const dayShort = days.map((d) => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d]).join(' & ')
      classes.push({
        id,
        name: `${lang.name} ${level.code} · ${dayShort} ${start.replace(':', '.')}`,
        lang: code,
        level: level.code,
        program,
        branch,
        room,
        link: branch === 'online' ? `https://meet.polyglotnusantara.example/${id.toLowerCase()}` : undefined,
        teacherId: teacher.id,
        days,
        start,
        minutes: code === 'de' ? 120 : 90,
        capacity: branch === 'online' ? 12 : program === 'Kids & Teens' ? 8 : rng.pick([10, 12]),
        startDate: isoDate(startDate),
        meetings,
        meetingsDone,
      })
    }
  }
}
export const CLASSES = classes
export const classById = (id: string) => CLASSES.find((c) => c.id === id)

// ---------- Students ----------
function scoresFor(base: number): Scores {
  const clamp = (v: number) => Math.max(35, Math.min(99, Math.round(v)))
  return { listening: clamp(base + rng.int(-9, 9)), speaking: clamp(base + rng.int(-12, 8)), reading: clamp(base + rng.int(-6, 10)), writing: clamp(base + rng.int(-14, 6)) }
}

const students: Student[] = []
{
  const filled: Record<string, number> = {}
  for (let i = 1; i <= 320; i++) {
    const lang = rng.weighted(LANG_WEIGHT)
    const options = CLASSES.filter((c) => c.lang === lang && (filled[c.id] ?? 0) < c.capacity)
    const cls = options.length ? rng.pick(options) : rng.pick(CLASSES.filter((c) => c.lang === lang))
    const status: StudentStatus = rng.weighted([['aktif', 86], ['cuti', 4], ['lulus', 6], ['berhenti', 4]] as const)
    if (status === 'aktif') filled[cls.id] = (filled[cls.id] ?? 0) + 1
    const gender = rng.chance(0.58) ? 'P' : 'L'
    const kid = cls.program === 'Kids & Teens'
    const age = kid ? rng.int(8, 16) : rng.weighted([[rng.int(17, 22), 40], [rng.int(23, 30), 38], [rng.int(31, 48), 22]] as const)
    const name = personName(gender)
    const levels = langByCode(lang).levels
    const levelIndex = Math.max(0, levels.findIndex((l) => l.code === cls.level))
    const ability = 62 + levelIndex * 2 + rng.int(-6, 22)
    // Work backwards from the class start: the current level began when the class did (or a little later
    // for students who joined mid-level), each earlier level ended a few days before the next one began.
    const classStart = new Date(cls.startDate)
    const currentStart = addDays(classStart, rng.chance(0.8) ? 0 : rng.int(1, 14))
    const history: LevelStep[] = [{ level: cls.level, start: isoDate(currentStart), result: 'berjalan' }]
    let nextStart = currentStart
    for (let l = levelIndex - 1; l >= 0; l--) {
      const end = addDays(nextStart, -rng.int(3, 21))
      const start = addDays(end, -Math.round(levels[l].weeks * 7 * (1 + rng.next() * 0.2)))
      history.unshift({ level: levels[l].code, start: isoDate(start), end: isoDate(end), final: rng.int(70, 96), result: 'lulus' })
      nextStart = start
    }
    const joined = history[0].start
    const parentGender = rng.chance(0.6) ? 'P' : 'L'
    students.push({
      id: `S-${String(i).padStart(4, '0')}`,
      name,
      gender,
      birth: isoDate(new Date(TODAY.getFullYear() - age, rng.int(0, 11), rng.int(1, 28))),
      phone: PHONE(),
      email: mailOf(name, i),
      parent: age < 18 ? { name: `${parentGender === 'P' ? 'Ibu' : 'Bapak'} ${rng.pick(parentGender === 'P' ? FEMALE : MALE)} ${name.split(' ').slice(-1)[0]}`, phone: PHONE() } : undefined,
      lang,
      level: cls.level,
      program: cls.program,
      branch: cls.branch,
      classId: cls.id,
      status,
      joined,
      attendance: status === 'aktif' ? rng.int(68, 100) : rng.int(40, 90),
      scores: scoresFor(ability),
      history,
      source: rng.pick(SOURCES),
    })
  }
}
export const STUDENTS = students

// ---------- Attendance sessions ----------
const TOPICS: Record<LangCode, string[]> = {
  en: ['Greetings & introductions', 'Daily routines', 'Past experiences', 'Making plans', 'Giving opinions', 'Describing places', 'Travel situations', 'Work & careers', 'Health & lifestyle', 'Technology', 'Environment', 'Review & quiz'],
  ja: ['あいさつ (Salam)', 'じこしょうかい (Perkenalan)', 'かいもの (Belanja)', 'じかん (Waktu)', 'しゅみ (Hobi)', 'て-form', 'かぞく (Keluarga)', 'りょこう (Perjalanan)', 'しごと (Pekerjaan)', 'けいご dasar', '読解 latihan', 'Review & kuis'],
  ko: ['인사 (Salam)', '자기소개 (Perkenalan)', '쇼핑 (Belanja)', '음식 (Makanan)', '날씨 (Cuaca)', '교통 (Transportasi)', '취미 (Hobi)', '약속 (Janji)', '직장 (Kantor)', '존댓말 (Bahasa hormat)', '듣기 latihan', 'Review & kuis'],
  zh: ['你好 (Salam)', '数字 (Angka)', '家人 (Keluarga)', '时间 (Waktu)', '买东西 (Belanja)', '天气 (Cuaca)', '交通 (Transportasi)', '工作 (Pekerjaan)', '爱好 (Hobi)', '把-kalimat', '阅读 latihan', 'Review & kuis'],
  ar: ['التحية (Salam)', 'التعارف (Perkenalan)', 'الأسرة (Keluarga)', 'السوق (Pasar)', 'الأيام (Hari)', 'المدرسة (Sekolah)', 'السفر (Perjalanan)', 'العمل (Pekerjaan)', 'Fi\'il madhi', 'Fi\'il mudhari\'', 'Qira\'ah latihan', 'Review & kuis'],
  de: ['Begrüßung', 'Sich vorstellen', 'Familie', 'Einkaufen', 'Uhrzeit & Termine', 'Wohnen', 'Arbeit & Beruf', 'Perfekt', 'Reisen', 'Gesundheit', 'Lesen latihan', 'Review & Quiz'],
}
export const topicFor = (lang: LangCode, meeting: number) => TOPICS[lang][(meeting - 1) % TOPICS[lang].length]

/** Date of the n-th meeting of a class (1-based). */
export function meetingDate(cls: ClassGroup, meeting: number) {
  const date = new Date(cls.startDate)
  let count = 0
  for (let i = 0; i < 400; i++) {
    if (cls.days.includes(date.getDay())) {
      count++
      if (count === meeting) return isoDate(date)
    }
    date.setDate(date.getDate() + 1)
  }
  return cls.startDate
}

export const classStudents = (classId: string) => STUDENTS.filter((s) => s.classId === classId && s.status === 'aktif')

const sessionCache = new Map<string, Session[]>()
export function seedSessions(classId: string): Session[] {
  const cached = sessionCache.get(classId)
  if (cached) return cached
  const cls = classById(classId)
  if (!cls) return []
  const local = seeded(Number(classId.slice(2)) * 7919)
  const list: Session[] = []
  for (let m = 1; m <= cls.meetingsDone; m++) {
    const records: Record<string, AttendanceStatus> = {}
    for (const s of classStudents(classId)) {
      const reliable = s.attendance / 100
      const roll = local.next()
      records[s.id] = roll < reliable ? 'hadir' : local.weighted([['izin', 45], ['sakit', 30], ['alpa', 25]] as const)
    }
    list.push({ classId, meeting: m, date: meetingDate(cls, m), topic: topicFor(cls.lang, m), records })
  }
  sessionCache.set(classId, list)
  return list
}

// ---------- Invoices & payments ----------
const METHODS = ['Transfer BCA', 'Virtual Account Mandiri', 'QRIS', 'Tunai di cabang', 'GoPay', 'Transfer BNI']
const invoices: Invoice[] = []
const payments: Payment[] = []
{
  let inv = 0
  let pay = 0
  for (const s of STUDENTS) {
    const levels = langByCode(s.lang).levels
    const terms = s.history
    terms.forEach((step, idx) => {
      const issued = new Date(step.start)
      if (TODAY.getTime() - issued.getTime() > 400 * 864e5) return
      const level = levels.find((l) => l.code === step.level) ?? levels[0]
      const items: InvoiceItem[] = [{ desc: `Kursus ${langByCode(s.lang).name} ${level.code} (${level.meetings} pertemuan)`, qty: 1, price: level.price }]
      if (idx === 0) items.push({ desc: 'Biaya pendaftaran', qty: 1, price: 150000 })
      items.push({ desc: `Buku & modul ${level.code}`, qty: 1, price: 125000 + (level.price > 2500000 ? 60000 : 0) })
      const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0)
      const discount = rng.chance(0.18) ? Math.round((subtotal * rng.pick([5, 10, 15])) / 100 / 1000) * 1000 : 0
      const total = subtotal - discount
      const due = addDays(issued, 14)
      const isCurrent = step.result === 'berjalan'
      let paid = total
      if (isCurrent && s.status === 'aktif') {
        const state = rng.weighted([['lunas', 76], ['belum', 10], ['telat', 9], ['sebagian', 5]] as const)
        if (state === 'belum' || state === 'telat') paid = 0
        if (state === 'sebagian') paid = Math.round(total / 2 / 1000) * 1000
        if (state === 'telat' && due >= TODAY) due.setTime(addDays(TODAY, -rng.int(3, 40)).getTime())
        if (state === 'belum' && due < TODAY) due.setTime(addDays(TODAY, rng.int(2, 14)).getTime())
      }
      const id = `INV-${issued.getFullYear()}-${String(++inv).padStart(4, '0')}`
      invoices.push({ id, studentId: s.id, items, discount, promo: discount ? rng.pick(['EARLYBIRD', 'ALUMNI10', 'SIBLING15', 'KAMPUS5']) : undefined, issued: isoDate(issued), due: isoDate(due), paid })
      if (paid > 0) {
        const parts = paid < total ? [paid] : rng.chance(0.15) ? [Math.round(total / 2 / 1000) * 1000, total - Math.round(total / 2 / 1000) * 1000] : [total]
        parts.forEach((amount, k) => {
          const date = addDays(issued, rng.int(0, 12) + k * 21)
          if (date > TODAY) date.setTime(TODAY.getTime())
          payments.push({ id: `PAY-${String(++pay).padStart(5, '0')}`, invoiceId: id, studentId: s.id, amount, date: isoDate(date), method: rng.pick(METHODS) })
        })
      }
    })
  }
  invoices.sort((a, b) => b.issued.localeCompare(a.issued))
  payments.sort((a, b) => b.date.localeCompare(a.date))
}
export const INVOICES = invoices
export const PAYMENTS = payments
export const invoiceTotal = (inv: Invoice) => inv.items.reduce((sum, it) => sum + it.qty * it.price, 0) - inv.discount
export function invoiceStatus(inv: Invoice, today = TODAY): InvoiceStatus {
  const total = invoiceTotal(inv)
  if (inv.paid >= total) return 'lunas'
  if (inv.paid > 0) return 'sebagian'
  if (new Date(inv.due) < today) return 'jatuh-tempo'
  return 'belum-bayar'
}

// ---------- Trials ----------
const SLOTS = ['09.00', '10.30', '13.00', '15.30', '18.30', '19.30']
const trials: Trial[] = []
for (let i = 1; i <= 146; i++) {
  const lang = rng.weighted(LANG_WEIGHT)
  const daysAgo = rng.int(-9, 180)
  const date = addDays(TODAY, -daysAgo)
  const gender = rng.chance(0.55) ? 'P' : 'L'
  const name = personName(gender)
  const future = daysAgo < 0
  const status: TrialStatus = future ? 'terjadwal' : daysAgo < 6 && rng.chance(0.6) ? 'hadir' : rng.weighted([['mendaftar', 44], ['tidak-lanjut', 34], ['tidak-hadir', 12], ['hadir', 4]] as const)
  const levels = langByCode(lang).levels
  trials.push({
    id: `TR-${String(1000 + i)}`,
    name,
    phone: PHONE(),
    email: mailOf(name, i + 400),
    age: rng.int(9, 42),
    lang,
    level: levels[Math.min(levels.length - 1, rng.weighted([[0, 50], [1, 25], [2, 15], [3, 10]] as const))].code,
    mode: rng.weighted([['bdg', 42], ['jkt', 33], ['online', 25]] as const),
    date: isoDate(date),
    slot: rng.pick(SLOTS),
    teacherId: rng.pick(TEACHERS.filter((t) => t.lang === lang)).id,
    status,
    source: rng.pick(SOURCES),
    note: rng.pick(['', '', 'Ingin kelas malam', 'Butuh untuk kerja', 'Persiapan kuliah', 'Datang dengan orang tua', 'Minta jadwal Sabtu']),
  })
}
trials.sort((a, b) => b.date.localeCompare(a.date))
export const TRIALS = trials

// ---------- Placement tests ----------
const results: PlacementResult[] = []
for (let i = 1; i <= 88; i++) {
  const lang: LangCode = rng.chance(0.65) ? 'en' : rng.pick(LANG_CODES.filter((c) => c !== 'en'))
  const gender = rng.chance(0.55) ? 'P' : 'L'
  const name = personName(gender)
  const levels = langByCode(lang).levels
  let sections: PlacementResult['sections']
  let answers: number[] | undefined
  let levelIndex: number
  if (lang === 'en') {
    const skill = rng.next()
    answers = PLACEMENT_QUESTIONS.map((q, qi) => (rng.next() < 0.95 - qi * 0.045 + skill * 0.25 ? q.answer : (q.answer + rng.int(1, 3)) % 4))
    const correct = answers.filter((a, qi) => a === PLACEMENT_QUESTIONS[qi].answer).length
    const by = (section: string) => PLACEMENT_QUESTIONS.reduce((sum, q, qi) => sum + (q.section === section && answers![qi] === q.answer ? 1 : 0), 0)
    const count = (section: string) => PLACEMENT_QUESTIONS.filter((q) => q.section === section).length
    sections = ['Grammar', 'Vocabulary', 'Reading'].map((s) => ({ name: s, score: by(s), max: count(s) }))
    levelIndex = correct <= 3 ? 0 : correct <= 6 ? 1 : correct <= 9 ? 2 : correct <= 12 ? 3 : correct <= 14 ? 4 : 5
  } else {
    levelIndex = rng.weighted([[0, 55], [1, 25], [2, 12], [3, 8]] as const)
    const base = 40 + levelIndex * 15
    sections = [
      { name: 'Tertulis', score: Math.min(100, base + rng.int(-8, 20)), max: 100 },
      { name: 'Lisan', score: Math.min(100, base + rng.int(-10, 18)), max: 100 },
    ]
  }
  const assigned = i > 14 && rng.chance(0.75)
  const level = levels[Math.min(levels.length - 1, levelIndex)].code
  const match = CLASSES.find((c) => c.lang === lang && c.level === level)
  results.push({
    id: `PT-${String(5000 + i)}`,
    name,
    phone: PHONE(),
    email: mailOf(name, i + 900),
    lang,
    date: dateBack(Math.floor((i - 1) * 1.9) + rng.int(0, 1)),
    type: lang === 'en' ? 'Online (situs)' : 'Tertulis + lisan di cabang',
    sections,
    answers,
    level,
    status: assigned && match ? 'ditetapkan' : 'menunggu',
    classId: assigned && match ? match.id : undefined,
  })
}
export const PLACEMENTS = results

// ---------- Mock tests ----------
export const MOCK_TESTS: MockTest[] = [
  { id: 'MT-301', exam: 'TOEFL ITP', lang: 'en', date: dateBack(6), title: 'Simulasi TOEFL ITP #11', status: 'selesai', studentIds: [] },
  { id: 'MT-302', exam: 'IELTS', lang: 'en', date: dateBack(13), title: 'IELTS Academic Mock · Oktober', status: 'selesai', studentIds: [] },
  { id: 'MT-303', exam: 'JLPT N3', lang: 'ja', date: dateBack(20), title: 'Simulasi JLPT N3 jelang Desember', status: 'selesai', studentIds: [] },
  { id: 'MT-304', exam: 'JLPT N4', lang: 'ja', date: dateBack(20), title: 'Simulasi JLPT N4 jelang Desember', status: 'selesai', studentIds: [] },
  { id: 'MT-305', exam: 'TOPIK II', lang: 'ko', date: dateBack(27), title: 'Simulasi TOPIK II #4', status: 'selesai', studentIds: [] },
  { id: 'MT-306', exam: 'HSK 4', lang: 'zh', date: dateBack(34), title: 'Simulasi HSK 4 · Batch 2', status: 'selesai', studentIds: [] },
  { id: 'MT-307', exam: 'TOEFL ITP', lang: 'en', date: isoDate(addDays(TODAY, 10)), title: 'Simulasi TOEFL ITP #12', status: 'terjadwal', studentIds: [] },
]
for (const test of MOCK_TESTS) {
  const pool = STUDENTS.filter((s) => s.lang === test.lang && s.status === 'aktif')
  const size = Math.min(pool.length, test.exam.startsWith('JLPT') ? 14 : 18)
  const start = rng.int(0, Math.max(0, pool.length - size))
  test.studentIds = pool.slice(start, start + size).map((s) => s.id)
}

export interface MockSection { name: string; score: number; max: number }
export interface MockResult { studentId: string; sections: MockSection[]; total: number; totalMax: number; predicted: string; pass?: boolean }
/** Scores for one mock test, derived from each student's skill scores so the numbers line up. */
export function mockResults(test: MockTest): MockResult[] {
  if (test.status !== 'selesai') return []
  const local = seeded(Number(test.id.slice(3)) * 104729)
  return test.studentIds.flatMap((id) => {
    const s = STUDENTS.find((x) => x.id === id)
    if (!s) return []
    const k = (v: number) => Math.max(0, Math.min(1, (v - 40) / 58 + (local.next() - 0.5) * 0.12))
    const sc = s.scores
    switch (test.exam) {
      case 'TOEFL ITP': {
        const sections = [
          { name: 'Listening', score: Math.round(31 + k(sc.listening) * 37), max: 68 },
          { name: 'Structure', score: Math.round(31 + k(sc.writing) * 37), max: 68 },
          { name: 'Reading', score: Math.round(31 + k(sc.reading) * 36), max: 67 },
        ]
        const total = Math.round((sections.reduce((a, b) => a + b.score, 0) * 10) / 3)
        return [{ studentId: id, sections, total, totalMax: 677, predicted: `${total - 13}–${total + 17}` }]
      }
      case 'IELTS': {
        const band = (v: number) => Math.round((3.5 + k(v) * 5) * 2) / 2
        const sections = [
          { name: 'Listening', score: band(sc.listening), max: 9 },
          { name: 'Reading', score: band(sc.reading), max: 9 },
          { name: 'Writing', score: band(sc.writing), max: 9 },
          { name: 'Speaking', score: band(sc.speaking), max: 9 },
        ]
        const total = Math.round((sections.reduce((a, b) => a + b.score, 0) / 4) * 2) / 2
        return [{ studentId: id, sections, total, totalMax: 9, predicted: `${Math.max(0, total - 0.5).toFixed(1)}–${Math.min(9, total + 0.5).toFixed(1)}` }]
      }
      case 'JLPT N3':
      case 'JLPT N4': {
        const sections = [
          { name: test.exam === 'JLPT N3' ? 'Kosakata & tata bahasa' : 'Kosakata, tata bahasa & membaca', score: Math.round(12 + k(sc.writing) * 48), max: test.exam === 'JLPT N3' ? 60 : 120 },
          ...(test.exam === 'JLPT N3' ? [{ name: 'Membaca', score: Math.round(12 + k(sc.reading) * 48), max: 60 }] : []),
          { name: 'Mendengar', score: Math.round(12 + k(sc.listening) * 48), max: 60 },
        ]
        if (test.exam === 'JLPT N4') sections[0].score = Math.round(25 + k((sc.writing + sc.reading) / 2) * 95)
        const total = sections.reduce((a, b) => a + b.score, 0)
        const pass = total >= (test.exam === 'JLPT N3' ? 95 : 90) && sections.every((x) => x.score >= 19)
        return [{ studentId: id, sections, total, totalMax: 180, predicted: pass ? 'Lulus' : 'Belum lulus', pass }]
      }
      case 'TOPIK II': {
        const sections = [
          { name: 'Mendengar', score: Math.round(25 + k(sc.listening) * 70), max: 100 },
          { name: 'Menulis', score: Math.round(20 + k(sc.writing) * 65), max: 100 },
          { name: 'Membaca', score: Math.round(25 + k(sc.reading) * 70), max: 100 },
        ]
        const total = sections.reduce((a, b) => a + b.score, 0)
        const level = total >= 230 ? 'Level 6' : total >= 190 ? 'Level 5' : total >= 150 ? 'Level 4' : total >= 120 ? 'Level 3' : 'Belum lulus'
        return [{ studentId: id, sections, total, totalMax: 300, predicted: level, pass: total >= 120 }]
      }
      case 'HSK 4': {
        const sections = [
          { name: 'Mendengar', score: Math.round(35 + k(sc.listening) * 62), max: 100 },
          { name: 'Membaca', score: Math.round(35 + k(sc.reading) * 62), max: 100 },
          { name: 'Menulis', score: Math.round(30 + k(sc.writing) * 62), max: 100 },
        ]
        const total = sections.reduce((a, b) => a + b.score, 0)
        return [{ studentId: id, sections, total, totalMax: 300, predicted: total >= 180 ? 'Lulus' : 'Belum lulus', pass: total >= 180 }]
      }
    }
  })
}

// ---------- Promos ----------
export const PROMOS: Promo[] = [
  { code: 'EARLYBIRD', name: 'Daftar 14 hari sebelum kelas mulai', type: 'persen', value: 10, used: 64, quota: 120, until: '2026-12-31', active: true, scope: 'Semua kelas reguler' },
  { code: 'ALUMNI10', name: 'Alumni lanjut level', type: 'persen', value: 10, used: 112, quota: 300, until: '2026-12-31', active: true, scope: 'Semua kelas' },
  { code: 'SIBLING15', name: 'Kakak-adik daftar bersama', type: 'persen', value: 15, used: 21, quota: 60, until: '2027-06-30', active: true, scope: 'Kids & Teens' },
  { code: 'KAMPUS5', name: 'Mahasiswa dengan KTM aktif', type: 'persen', value: 5, used: 88, quota: 200, until: '2026-12-31', active: true, scope: 'Semua kelas reguler' },
  { code: 'TRIALJADI', name: 'Daftar di hari trial', type: 'nominal', value: 150000, used: 47, quota: 100, until: '2026-11-30', active: true, scope: 'Gratis biaya pendaftaran' },
  { code: 'RAMADAN26', name: 'Promo Ramadan', type: 'persen', value: 20, used: 73, quota: 73, until: '2026-03-31', active: false, scope: 'Bahasa Arab' },
  { code: 'JLPTJULI', name: 'Paket JLPT Juli', type: 'nominal', value: 250000, used: 30, quota: 40, until: '2026-06-30', active: false, scope: 'Persiapan JLPT' },
]

// ---------- Monthly series for reports (12 months up to the demo month) ----------
export const MONTHS: string[] = Array.from({ length: 12 }, (_, i) => isoDate(new Date(TODAY.getFullYear(), TODAY.getMonth() - 11 + i, 1)))
const monthKey = (iso: string) => iso.slice(0, 7)
const studentById = new Map(STUDENTS.map((s) => [s.id, s]))

/** Revenue (payments received) per month, split by language and by branch. */
export const REVENUE = MONTHS.map((month) => {
  const key = monthKey(month)
  const byLang = Object.fromEntries(LANG_CODES.map((c) => [c, 0])) as Record<LangCode, number>
  const byBranch: Record<BranchId, number> = { bdg: 0, jkt: 0, online: 0 }
  let total = 0
  for (const p of PAYMENTS) {
    if (monthKey(p.date) !== key) continue
    const s = studentById.get(p.studentId)
    if (!s) continue
    byLang[s.lang] += p.amount
    byBranch[s.branch] += p.amount
    total += p.amount
  }
  return { month, total, byLang, byBranch }
})

/** New enrolments, trial counts and level-ups per month. */
export const MONTHLY = MONTHS.map((month, i) => {
  const key = monthKey(month)
  const trialsIn = TRIALS.filter((t) => monthKey(t.date) === key)
  const attended = trialsIn.filter((t) => t.status !== 'terjadwal' && t.status !== 'tidak-hadir')
  const enrolled = trialsIn.filter((t) => t.status === 'mendaftar')
  const levelUps = STUDENTS.reduce((sum, s) => sum + s.history.filter((h) => h.end && monthKey(h.end) === key).length, 0)
  const newStudents = STUDENTS.filter((s) => monthKey(s.joined) === key).length
  // Retention: share of students active at the start of the month who continued to the next term.
  const retention = 86 + Math.round(Math.sin(i / 2) * 3 + (i / 11) * 3) + (i % 3 === 0 ? -1 : 0)
  return { month, trials: trialsIn.length, attended: attended.length, enrolled: enrolled.length, levelUps, newStudents, retention }
})

export const BRANCH_LIST = [...BRANCHES.map((b) => ({ id: b.id as BranchId, name: b.name })), { id: 'online' as BranchId, name: 'Online' }]
export { LANGUAGES, TODAY }
