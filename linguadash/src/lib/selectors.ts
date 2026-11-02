// Derived numbers shared by the overview and the report screens.
import { CLASSES, MONTHS, invoiceStatus, invoiceTotal, seedSessions, type Invoice, type Payment, type Session, type Student, type Trial } from '../data/demo.ts'
import { DEMO_TODAY, LANG_CODES, type BranchId, type LangCode } from '../data/school.ts'
import { addDays, isoDate } from './format.ts'

export const monthKey = (iso: string) => iso.slice(0, 7)

export function revenueSeries(payments: Payment[], students: Student[]) {
  const byId = new Map(students.map((s) => [s.id, s]))
  return MONTHS.map((month) => {
    const key = monthKey(month)
    const byLang = Object.fromEntries(LANG_CODES.map((c) => [c, 0])) as Record<LangCode, number>
    const byBranch: Record<BranchId, number> = { bdg: 0, jkt: 0, online: 0 }
    let total = 0
    for (const p of payments) {
      if (monthKey(p.date) !== key) continue
      const s = byId.get(p.studentId)
      if (!s) continue
      byLang[s.lang] += p.amount
      byBranch[s.branch] += p.amount
      total += p.amount
    }
    return { month, total, byLang, byBranch }
  })
}

export function sumPayments(payments: Payment[], from: Date, to: Date) {
  const a = isoDate(from)
  const b = isoDate(to)
  return payments.reduce((sum, p) => (p.date >= a && p.date <= b ? sum + p.amount : sum), 0)
}

export interface ArrearsRow { invoice: Invoice; student?: Student; due: number; days: number }
export function arrears(invoices: Invoice[], students: Student[], today = DEMO_TODAY): ArrearsRow[] {
  const byId = new Map(students.map((s) => [s.id, s]))
  return invoices
    .filter((inv) => { const st = invoiceStatus(inv, today); return st === 'jatuh-tempo' || (st === 'sebagian' && new Date(inv.due) < today) })
    .map((inv) => ({ invoice: inv, student: byId.get(inv.studentId), due: invoiceTotal(inv) - inv.paid, days: Math.max(0, Math.round((today.getTime() - new Date(inv.due).getTime()) / 864e5)) }))
    .sort((a, b) => b.due - a.due)
}

export function attendanceStats(sessions: Session[]) {
  const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
  for (const s of sessions) for (const status of Object.values(s.records)) counts[status]++
  const total = counts.hadir + counts.izin + counts.sakit + counts.alpa
  return { ...counts, total, rate: total ? (counts.hadir / total) * 100 : 0 }
}

/** All sessions per class, seed data merged with sessions saved in this browser. */
export function allSessions(saved: Record<string, Session>) {
  const map = new Map<string, Session[]>()
  for (const c of CLASSES) map.set(c.id, [...seedSessions(c.id)])
  for (const s of Object.values(saved)) {
    const list = map.get(s.classId) ?? []
    const i = list.findIndex((x) => x.meeting === s.meeting)
    if (i >= 0) list[i] = s
    else list.push(s)
    map.set(s.classId, list.sort((a, b) => a.meeting - b.meeting))
  }
  return map
}

export function sessionsBetween(map: Map<string, Session[]>, from: Date, to: Date) {
  const a = isoDate(from)
  const b = isoDate(to)
  return [...map.values()].flat().filter((s) => s.date >= a && s.date <= b)
}

export function trialFunnel(trials: Trial[], days: number, today = DEMO_TODAY) {
  const from = isoDate(addDays(today, -days))
  const to = isoDate(today)
  const list = trials.filter((t) => t.date >= from && t.date <= to)
  const booked = list.length
  const attended = list.filter((t) => t.status === 'hadir' || t.status === 'mendaftar' || t.status === 'tidak-lanjut').length
  const enrolled = list.filter((t) => t.status === 'mendaftar').length
  return { booked, attended, enrolled, rate: attended ? (enrolled / attended) * 100 : 0 }
}

export const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)
export const skillAvg = (s: Student) => Math.round((s.scores.listening + s.scores.speaking + s.scores.reading + s.scores.writing) / 4)

/** wa.me link with a prefilled message. Phone numbers in the demo are dummies. */
export function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '').replace(/^0/, '62')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
