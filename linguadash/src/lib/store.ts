/*
  Demo store. There is no backend: anything you create or change in the dashboard
  (new students, invoices, attendance, grades, trial status...) is kept in this browser's
  localStorage on top of the generated seed data. "Pengaturan > Profil lembaga > Reset data demo"
  clears it. Swap these functions for API calls when you connect a real backend.
*/
import { useMemo, useSyncExternalStore } from 'react'
import {
  CLASSES, INVOICES, PAYMENTS, PLACEMENTS, STUDENTS, TRIALS, seedSessions,
  type AttendanceStatus, type Invoice, type Payment, type Scores, type Session, type Student, type TrialStatus,
} from '../data/demo.ts'
import { DEMO_TODAY } from '../data/school.ts'
import { isoDate } from './format.ts'

export interface GradeEntry { studentId: string; classId: string; type: string; date: string; scores: Scores; note?: string }
export interface Announcement { id: string; title: string; body: string; audience: string; channel: string; date: string; author: string; pinned?: boolean }

interface DemoState {
  version: 1
  students: Record<string, Partial<Student>>
  added: Student[]
  invoices: Invoice[]
  invoicePaid: Record<string, number>
  payments: Payment[]
  sessions: Record<string, Session>
  grades: GradeEntry[]
  trials: Record<string, TrialStatus>
  placements: Record<string, string>
  promotions: Record<string, string>
  announcements: Announcement[]
  promoActive: Record<string, boolean>
  readThreads: string[]
}

const KEY = 'linguadash-demo-v1'
const EMPTY: DemoState = {
  version: 1, students: {}, added: [], invoices: [], invoicePaid: {}, payments: [], sessions: {}, grades: [],
  trials: {}, placements: {}, promotions: {}, announcements: [], promoActive: {}, readThreads: [],
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>
      if (parsed.version === 1) return { ...EMPTY, ...parsed }
    }
  } catch { /* ignore broken or blocked storage */ }
  return EMPTY
}

let state: DemoState = load()
const listeners = new Set<() => void>()

export function update(change: (draft: DemoState) => Partial<DemoState>) {
  state = { ...state, ...change(state) }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full or blocked */ }
  listeners.forEach((fn) => fn())
}
export function resetDemo() {
  state = EMPTY
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  listeners.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const useDemoState = () => useSyncExternalStore(subscribe, () => state, () => state)

// ---------- Merged views (seed + local changes) ----------
function mergeStudents(s: DemoState): Student[] {
  const latest = new Map<string, GradeEntry>()
  for (const g of s.grades) latest.set(g.studentId, g)
  const apply = (st: Student): Student => {
    const patch = s.students[st.id]
    const grade = latest.get(st.id)
    const promoted = s.promotions[st.id]
    let next = patch ? { ...st, ...patch } : st
    if (grade) next = { ...next, scores: grade.scores }
    if (promoted && promoted !== next.level) {
      next = {
        ...next,
        level: promoted,
        history: [...next.history.map((h) => (h.result === 'berjalan' ? { ...h, result: 'lulus' as const, end: isoDate(DEMO_TODAY), final: Math.round((next.scores.listening + next.scores.speaking + next.scores.reading + next.scores.writing) / 4) } : h)), { level: promoted, start: isoDate(DEMO_TODAY), result: 'berjalan' as const }],
      }
    }
    return next
  }
  return [...s.added.map(apply), ...STUDENTS.map(apply)]
}

export function useStudents() {
  const s = useDemoState()
  return useMemo(() => mergeStudents(s), [s])
}
export function useStudent(id: string | undefined) {
  const list = useStudents()
  return useMemo(() => list.find((st) => st.id === id), [list, id])
}
export function nextStudentId() {
  const max = Math.max(...STUDENTS.map((st) => Number(st.id.slice(2))), ...state.added.map((st) => Number(st.id.slice(2))))
  return `S-${String(max + 1).padStart(4, '0')}`
}

export function useInvoices() {
  const s = useDemoState()
  return useMemo(() => [...s.invoices, ...INVOICES].map((inv) => (inv.id in s.invoicePaid ? { ...inv, paid: s.invoicePaid[inv.id] } : inv)), [s])
}
export function nextInvoiceId() {
  const year = DEMO_TODAY.getFullYear()
  const max = Math.max(...[...INVOICES, ...state.invoices].map((inv) => Number(inv.id.split('-')[2])))
  return `INV-${year}-${String(max + 1).padStart(4, '0')}`
}
export function usePayments() {
  const s = useDemoState()
  return useMemo(() => [...s.payments, ...PAYMENTS], [s])
}

export function useSessions(classId: string) {
  const s = useDemoState()
  return useMemo(() => {
    const seed = seedSessions(classId)
    const saved = Object.values(s.sessions).filter((x) => x.classId === classId)
    const byMeeting = new Map<number, Session>()
    for (const x of seed) byMeeting.set(x.meeting, x)
    for (const x of saved) byMeeting.set(x.meeting, x)
    return [...byMeeting.values()].sort((a, b) => a.meeting - b.meeting)
  }, [s, classId])
}
export function saveSession(session: Session) {
  update((s) => ({ sessions: { ...s.sessions, [`${session.classId}#${session.meeting}`]: session } }))
}
export type { AttendanceStatus }

export function useTrials() {
  const s = useDemoState()
  return useMemo(() => TRIALS.map((t) => (s.trials[t.id] ? { ...t, status: s.trials[t.id] } : t)), [s])
}
export function usePlacements() {
  const s = useDemoState()
  return useMemo(() => PLACEMENTS.map((p) => (s.placements[p.id] ? { ...p, status: 'ditetapkan' as const, classId: s.placements[p.id] } : p)), [s])
}

/** Classes plus how many seats are taken (counting students added in this browser). */
export function useClasses() {
  const students = useStudents()
  return useMemo(() => {
    const count = new Map<string, number>()
    for (const st of students) if (st.status === 'aktif') count.set(st.classId, (count.get(st.classId) ?? 0) + 1)
    return CLASSES.map((c) => ({ ...c, enrolled: count.get(c.id) ?? 0 }))
  }, [students])
}
