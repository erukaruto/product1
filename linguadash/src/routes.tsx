/*
  Route registry. Every screen is listed once here; App.tsx builds the router from it,
  /screens shows the same list, and the test suite reads it. Pages load lazily per area.
*/
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { CLASSES, INVOICES, MOCK_TESTS, PLACEMENTS, STUDENTS, TEACHERS, TRIALS } from './data/demo.ts'

export interface Screen {
  path: string
  title: string
  group: string
  /** Concrete URL for dynamic paths (used by /screens and the test suite). */
  sample?: string
  layout: 'app' | 'auth'
  Component: LazyExoticComponent<ComponentType>
}

function page<M>(loader: () => Promise<M>, name: keyof M) {
  return lazy(async () => ({ default: (await loader())[name] as ComponentType }))
}

const auth = () => import('./pages/auth.tsx')
const overview = () => import('./pages/overview.tsx')
const students = () => import('./pages/students.tsx')
const placement = () => import('./pages/placement.tsx')
const trials = () => import('./pages/trials.tsx')
const teachers = () => import('./pages/teachers.tsx')
const classes = () => import('./pages/classes.tsx')
const attendance = () => import('./pages/attendance.tsx')
const academic = () => import('./pages/academic.tsx')
const finance = () => import('./pages/finance.tsx')
const comms = () => import('./pages/comms.tsx')
const reports = () => import('./pages/reports.tsx')
const settings = () => import('./pages/settings.tsx')
const errors = () => import('./pages/errors.tsx')
const uikit = () => import('./pages/uikit.tsx')
const screens = () => import('./pages/screens.tsx')

const student = STUDENTS.find((s) => s.status === 'aktif' && s.history.length > 1) ?? STUDENTS[0]
const placementSample = PLACEMENTS.find((p) => p.answers) ?? PLACEMENTS[0]
const placementWaiting = PLACEMENTS.find((p) => p.status === 'menunggu') ?? PLACEMENTS[0]

export const SCREENS: Screen[] = [
  // Auth & onboarding
  { path: '/login', title: 'Masuk', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'Login') },
  { path: '/daftar', title: 'Daftar akun lembaga', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'Register') },
  { path: '/lupa-password', title: 'Lupa kata sandi', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'ForgotPassword') },
  { path: '/reset-password', title: 'Buat kata sandi baru', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'ResetPassword') },
  { path: '/verifikasi-email', title: 'Verifikasi email', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'VerifyEmail') },
  { path: '/onboarding/profil', title: 'Onboarding 1: profil lembaga', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'OnboardingProfile') },
  { path: '/onboarding/bahasa', title: 'Onboarding 2: bahasa', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'OnboardingLanguages') },
  { path: '/onboarding/paket', title: 'Onboarding 3: paket harga', group: 'Auth & onboarding', layout: 'auth', Component: page(auth, 'OnboardingPricing') },

  { path: '/', title: 'Overview', group: 'Overview', layout: 'app', Component: page(overview, 'Overview') },

  // Students
  { path: '/siswa', title: 'Daftar siswa', group: 'Siswa', layout: 'app', Component: page(students, 'StudentList') },
  { path: '/siswa/baru', title: 'Tambah siswa', group: 'Siswa', layout: 'app', Component: page(students, 'StudentNew') },
  { path: '/siswa/impor', title: 'Impor siswa (CSV)', group: 'Siswa', layout: 'app', Component: page(students, 'StudentImport') },
  { path: '/siswa/:id', title: 'Detail siswa', group: 'Siswa', sample: `/siswa/${student.id}`, layout: 'app', Component: page(students, 'StudentDetail') },
  { path: '/siswa/:id/edit', title: 'Edit siswa', group: 'Siswa', sample: `/siswa/${student.id}/edit`, layout: 'app', Component: page(students, 'StudentEdit') },
  { path: '/siswa/:id/sertifikat', title: 'Sertifikat kelulusan level', group: 'Siswa', sample: `/siswa/${student.id}/sertifikat`, layout: 'app', Component: page(students, 'Certificate') },

  // Placement tests
  { path: '/tes-penempatan', title: 'Hasil tes penempatan', group: 'Tes penempatan', layout: 'app', Component: page(placement, 'PlacementList') },
  { path: '/tes-penempatan/:id', title: 'Detail jawaban tes', group: 'Tes penempatan', sample: `/tes-penempatan/${placementSample.id}`, layout: 'app', Component: page(placement, 'PlacementDetail') },
  { path: '/tes-penempatan/:id/tetapkan', title: 'Tetapkan kelas dari hasil tes', group: 'Tes penempatan', sample: `/tes-penempatan/${placementWaiting.id}/tetapkan`, layout: 'app', Component: page(placement, 'PlacementAssign') },

  // Trials
  { path: '/trial', title: 'Booking trial class', group: 'Trial class', layout: 'app', Component: page(trials, 'TrialList') },
  { path: '/trial/:id', title: 'Detail booking trial', group: 'Trial class', sample: `/trial/${TRIALS[0].id}`, layout: 'app', Component: page(trials, 'TrialDetail') },

  // Teachers
  { path: '/pengajar', title: 'Daftar pengajar', group: 'Pengajar', layout: 'app', Component: page(teachers, 'TeacherList') },
  { path: '/pengajar/honor', title: 'Honor & absensi pengajar', group: 'Pengajar', layout: 'app', Component: page(teachers, 'TeacherPay') },
  { path: '/pengajar/:id', title: 'Detail pengajar', group: 'Pengajar', sample: `/pengajar/${TEACHERS[5].id}`, layout: 'app', Component: page(teachers, 'TeacherDetail') },
  { path: '/pengajar/:id/jadwal', title: 'Jadwal mengajar', group: 'Pengajar', sample: `/pengajar/${TEACHERS[5].id}/jadwal`, layout: 'app', Component: page(teachers, 'TeacherSchedule') },

  // Classes & schedule
  { path: '/jadwal', title: 'Kalender mingguan', group: 'Kelas & jadwal', layout: 'app', Component: page(classes, 'WeekCalendar') },
  { path: '/kelas', title: 'Daftar kelas', group: 'Kelas & jadwal', layout: 'app', Component: page(classes, 'ClassList') },
  { path: '/kelas/:id', title: 'Detail kelas', group: 'Kelas & jadwal', sample: `/kelas/${CLASSES[0].id}`, layout: 'app', Component: page(classes, 'ClassDetail') },
  { path: '/ruang', title: 'Ruang & cabang', group: 'Kelas & jadwal', layout: 'app', Component: page(classes, 'Rooms') },
  { path: '/kelas-online', title: 'Link kelas online', group: 'Kelas & jadwal', layout: 'app', Component: page(classes, 'OnlineClasses') },

  // Attendance
  { path: '/absensi', title: 'Input absensi', group: 'Absensi', layout: 'app', Component: page(attendance, 'AttendanceInput') },
  { path: '/absensi/rekap-siswa', title: 'Rekap absensi per siswa', group: 'Absensi', layout: 'app', Component: page(attendance, 'AttendanceByStudent') },
  { path: '/absensi/rekap-kelas', title: 'Rekap absensi per kelas', group: 'Absensi', layout: 'app', Component: page(attendance, 'AttendanceByClass') },

  // Academic
  { path: '/akademik/kurikulum', title: 'Kurikulum per level', group: 'Akademik', layout: 'app', Component: page(academic, 'Curriculum') },
  { path: '/akademik/bank-soal', title: 'Bank soal', group: 'Akademik', layout: 'app', Component: page(academic, 'QuestionBank') },
  { path: '/akademik/mock-test', title: 'Mock test', group: 'Akademik', layout: 'app', Component: page(academic, 'MockTestList') },
  { path: '/akademik/mock-test/baru', title: 'Buat mock test', group: 'Akademik', layout: 'app', Component: page(academic, 'MockTestNew') },
  { path: '/akademik/mock-test/:id', title: 'Hasil mock test', group: 'Akademik', sample: `/akademik/mock-test/${MOCK_TESTS[0].id}`, layout: 'app', Component: page(academic, 'MockTestResult') },
  { path: '/akademik/nilai', title: 'Input nilai 4 skill', group: 'Akademik', layout: 'app', Component: page(academic, 'GradeInput') },
  { path: '/akademik/rubrik', title: 'Rubrik speaking & writing', group: 'Akademik', layout: 'app', Component: page(academic, 'Rubrics') },
  { path: '/akademik/kenaikan-level', title: 'Kenaikan level', group: 'Akademik', layout: 'app', Component: page(academic, 'Promotions') },

  // Finance
  { path: '/keuangan/tagihan', title: 'Tagihan jatuh tempo', group: 'Keuangan', layout: 'app', Component: page(finance, 'Bills') },
  { path: '/keuangan/invoice', title: 'Invoice', group: 'Keuangan', layout: 'app', Component: page(finance, 'InvoiceList') },
  { path: '/keuangan/invoice/baru', title: 'Buat invoice', group: 'Keuangan', layout: 'app', Component: page(finance, 'InvoiceNew') },
  { path: '/keuangan/invoice/:id', title: 'Detail invoice', group: 'Keuangan', sample: `/keuangan/invoice/${INVOICES[0].id}`, layout: 'app', Component: page(finance, 'InvoiceDetail') },
  { path: '/keuangan/pembayaran', title: 'Pembayaran masuk', group: 'Keuangan', layout: 'app', Component: page(finance, 'Payments') },
  { path: '/keuangan/tunggakan', title: 'Tunggakan', group: 'Keuangan', layout: 'app', Component: page(finance, 'Arrears') },
  { path: '/keuangan/promo', title: 'Diskon & promo', group: 'Keuangan', layout: 'app', Component: page(finance, 'Promos') },
  { path: '/keuangan/laporan', title: 'Pendapatan per bahasa & cabang', group: 'Keuangan', layout: 'app', Component: page(finance, 'RevenueBreakdown') },

  // Communication
  { path: '/komunikasi/pengumuman', title: 'Pengumuman', group: 'Komunikasi', layout: 'app', Component: page(comms, 'Announcements') },
  { path: '/komunikasi/template', title: 'Template WhatsApp', group: 'Komunikasi', layout: 'app', Component: page(comms, 'WaTemplates') },
  { path: '/komunikasi/inbox', title: 'Inbox', group: 'Komunikasi', layout: 'app', Component: page(comms, 'Inbox') },

  // Reports
  { path: '/laporan/pendapatan', title: 'Laporan pendapatan', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportRevenue') },
  { path: '/laporan/retensi', title: 'Retensi siswa', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportRetention') },
  { path: '/laporan/kenaikan-level', title: 'Laporan kenaikan level', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportLevelUp') },
  { path: '/laporan/skor-ujian', title: 'Rata-rata skor ujian', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportScores') },
  { path: '/laporan/kinerja-pengajar', title: 'Kinerja pengajar', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportTeachers') },
  { path: '/laporan/konversi-trial', title: 'Konversi trial', group: 'Laporan', layout: 'app', Component: page(reports, 'ReportTrials') },

  // Settings
  { path: '/pengaturan', title: 'Profil lembaga', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsProfile') },
  { path: '/pengaturan/bahasa', title: 'Bahasa & level', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsLanguages') },
  { path: '/pengaturan/cabang', title: 'Cabang', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsBranches') },
  { path: '/pengaturan/tim', title: 'Tim & peran', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsTeam') },
  { path: '/pengaturan/paket', title: 'Paket harga', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsPackages') },
  { path: '/pengaturan/notifikasi', title: 'Notifikasi', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsNotifications') },
  { path: '/pengaturan/tagihan', title: 'Tagihan langganan', group: 'Pengaturan', layout: 'app', Component: page(settings, 'SettingsBilling') },

  // Errors
  { path: '/403', title: 'Akses ditolak (403)', group: 'Error', layout: 'app', Component: page(errors, 'Forbidden') },
  { path: '/500', title: 'Kesalahan server (500)', group: 'Error', layout: 'app', Component: page(errors, 'ServerError') },

  // UI kit
  { path: '/ui/tombol', title: 'Tombol', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiButtons') },
  { path: '/ui/form', title: 'Form', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiForms') },
  { path: '/ui/tabel', title: 'Tabel', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiTables') },
  { path: '/ui/chart', title: 'Chart', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiCharts') },
  { path: '/ui/overlay', title: 'Overlay', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiOverlays') },
  { path: '/ui/state', title: 'State', group: 'UI kit', layout: 'app', Component: page(uikit, 'UiStates') },

  { path: '/screens', title: 'Semua layar', group: 'Lainnya', layout: 'app', Component: page(screens, 'Screens') },
]

export const NotFoundPage = page(errors, 'NotFound')
