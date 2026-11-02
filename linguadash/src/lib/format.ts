// Indonesian formatting helpers. Rupiah: "Rp 1.250.000". Dates: "18 Nov 2026", "Rabu, 18 November 2026".

const rupiahFormat = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const numberFormat = new Intl.NumberFormat('id-ID')
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const longDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const dayMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' })
const weekday = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
const weekdayShort = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })

const toDate = (value: Date | string) => (typeof value === 'string' ? new Date(value) : value)

/** Rp 1.250.000 */
export const rupiah = (value: number) => rupiahFormat.format(Math.round(value)).replace(/\s/, ' ')
/** Rp 1,25 jt / Rp 312 rb, for axis ticks and tight tiles */
export function rupiahShort(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1e9) return `Rp ${trim(value / 1e9)} M`
  if (abs >= 1e6) return `Rp ${trim(value / 1e6)} jt`
  if (abs >= 1e3) return `Rp ${trim(value / 1e3)} rb`
  return `Rp ${value}`
}
const trim = (n: number) => numberFormat.format(Number(n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)))
/** 1.250 */
export const num = (value: number) => numberFormat.format(value)
/** 87,5% */
export const pct = (value: number, digits = 1) => `${numberFormat.format(Number(value.toFixed(digits)))}%`
/** 18 Nov 2026 */
export const tanggal = (value: Date | string) => shortDate.format(toDate(value))
/** Rabu, 18 November 2026 */
export const tanggalPanjang = (value: Date | string) => longDate.format(toDate(value))
/** 18 Nov */
export const tanggalPendek = (value: Date | string) => dayMonth.format(toDate(value))
/** November 2026 */
export const bulanTahun = (value: Date | string) => monthYear.format(toDate(value))
/** Nov */
export const bulanPendek = (value: Date | string) => monthShort.format(toDate(value))
/** Rabu */
export const hari = (value: Date | string) => weekday.format(toDate(value))
/** Rab */
export const hariPendek = (value: Date | string) => weekdayShort.format(toDate(value))

/** 2026-11-18 (local date, for <input type="date">) */
export function isoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
export function startOfWeek(date: Date) {
  const day = (date.getDay() + 6) % 7 // Monday = 0
  const start = addDays(date, -day)
  start.setHours(0, 0, 0, 0)
  return start
}
export const initials = (name: string) =>
  name.split(/\s+/).filter((part) => /^[A-Za-z]/.test(part)).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
