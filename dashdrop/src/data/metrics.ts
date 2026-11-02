/*
  Demo metrics for the fictional company "Beacon". The numbers agree with each other:
  - MRR movement for each month (new + expansion - contraction - churn) equals that month's change in MRR.
  - Customers at the end of a month = start + new - churned. Churn rate = churned / customers at the start.
  - Plan mix and MRR by country both add up to the current MRR.
  - Each cohort's size is the number of new customers in that month.
  Replace this file with calls to your own API.
*/
import type { MonthPoint } from '../types.ts'

export const TODAY = new Date('2026-10-31T12:00:00Z')

const MONTHS: MonthPoint[] = [
  { label: 'Nov', full: 'Nov 2025' },
  { label: 'Dec', full: 'Dec 2025' },
  { label: 'Jan', full: 'Jan 2026' },
  { label: 'Feb', full: 'Feb 2026' },
  { label: 'Mar', full: 'Mar 2026' },
  { label: 'Apr', full: 'Apr 2026' },
  { label: 'May', full: 'May 2026' },
  { label: 'Jun', full: 'Jun 2026' },
  { label: 'Jul', full: 'Jul 2026' },
  { label: 'Aug', full: 'Aug 2026' },
  { label: 'Sep', full: 'Sep 2026' },
  { label: 'Oct', full: 'Oct 2026' },
]

const MRR_END = [31240, 32810, 33470, 35920, 36380, 38750, 40120, 41030, 43580, 44910, 46440, 48320]
const MRR_BEFORE_FIRST_MONTH = 30100 // Oct 2025

// [new, expansion, contraction, churn] per month
const MOVEMENT: Array<[number, number, number, number]> = [
  [1670, 620, 330, 820],
  [1950, 660, 310, 730],
  [1410, 570, 360, 960],
  [2580, 830, 280, 680],
  [1340, 550, 390, 1040],
  [2490, 860, 290, 690],
  [1820, 660, 320, 790],
  [1560, 600, 350, 900],
  [2610, 830, 270, 620],
  [1840, 680, 340, 850],
  [2030, 720, 350, 870],
  [2460, 840, 410, 1010],
]

const CUSTOMERS_END = [912, 951, 975, 1022, 1040, 1086, 1121, 1139, 1188, 1215, 1246, 1284]
const CUSTOMERS_BEFORE_FIRST_MONTH = 880
const CHURNED = [22, 21, 25, 20, 27, 21, 24, 26, 20, 25, 29, 26]

export interface MrrMonth extends MonthPoint {
  start: number
  end: number
  newMrr: number
  expansion: number
  contraction: number
  churn: number
  net: number
}

export const mrrMonths: MrrMonth[] = MONTHS.map((month, i) => {
  const [newMrr, expansion, contraction, churn] = MOVEMENT[i]
  return {
    ...month,
    start: i === 0 ? MRR_BEFORE_FIRST_MONTH : MRR_END[i - 1],
    end: MRR_END[i],
    newMrr,
    expansion,
    contraction,
    churn,
    net: newMrr + expansion - contraction - churn,
  }
})

export const mrrByMonth = mrrMonths.map((m) => ({ label: m.label, full: m.full, value: m.end }))

export const movementByMonth = mrrMonths.map((m) => ({
  label: m.label,
  full: m.full,
  gained: m.newMrr + m.expansion,
  lost: m.contraction + m.churn,
}))

export interface CustomerMonth extends MonthPoint {
  start: number
  end: number
  churned: number
  added: number
  churnRate: number
}

export const customerMonths: CustomerMonth[] = MONTHS.map((month, i) => {
  const start = i === 0 ? CUSTOMERS_BEFORE_FIRST_MONTH : CUSTOMERS_END[i - 1]
  const end = CUSTOMERS_END[i]
  const churned = CHURNED[i]
  return { ...month, start, end, churned, added: end - start + churned, churnRate: (churned / start) * 100 }
})

const last = <T,>(list: T[]): T => list[list.length - 1]
const previous = <T,>(list: T[]): T => list[list.length - 2]

export const kpis = {
  mrr: { value: last(mrrMonths).end, previous: previous(mrrMonths).end },
  customers: { value: last(customerMonths).end, previous: previous(customerMonths).end },
  churnRate: {
    value: Math.round(last(customerMonths).churnRate * 10) / 10,
    previous: Math.round(previous(customerMonths).churnRate * 10) / 10,
  },
  arpa: {
    value: last(mrrMonths).end / last(customerMonths).end,
    previous: previous(mrrMonths).end / previous(customerMonths).end,
  },
}

const oct = last(mrrMonths)
export const movementThisMonth = [
  { key: 'new', label: 'New MRR', value: oct.newMrr },
  { key: 'expansion', label: 'Expansion', value: oct.expansion },
  { key: 'contraction', label: 'Contraction', value: -oct.contraction },
  { key: 'churn', label: 'Churned', value: -oct.churn },
]

// 647 + 577 + 60 = 1,284 customers. 12,293 + 28,273 + 7,754 = 48,320 MRR.
export const planMix = [
  { plan: 'Starter', customers: 647, mrr: 12293 },
  { plan: 'Growth', customers: 577, mrr: 28273 },
  { plan: 'Scale', customers: 60, mrr: 7754 },
] as const

// Sums to 48,320.
export const countries = [
  { code: 'US', name: 'United States', mrr: 16912 },
  { code: 'GB', name: 'United Kingdom', mrr: 5315 },
  { code: 'DE', name: 'Germany', mrr: 4349 },
  { code: 'CA', name: 'Canada', mrr: 3382 },
  { code: 'IN', name: 'India', mrr: 2899 },
  { code: 'ID', name: 'Indonesia', mrr: 2416 },
  { code: 'BR', name: 'Brazil', mrr: 1933 },
  { code: 'XX', name: 'Other', mrr: 11114 },
]

// Last 30 days. The 64 paid signups are October's new customers.
export const funnel = [
  { label: 'Site visits', value: 14860 },
  { label: 'Signups', value: 352 },
  { label: 'Activated', value: 214 },
  { label: 'Paid', value: last(customerMonths).added },
]

// Why October's 26 churned customers left (from the cancellation survey).
export const churnReasons = [
  { reason: 'Too expensive', customers: 8 },
  { reason: 'Switched to another tool', customers: 6 },
  { reason: 'Moved reporting in-house', customers: 4 },
  { reason: 'Company closed', customers: 3 },
  { reason: 'Missing features', customers: 3 },
  { reason: 'Other', customers: 2 },
]

/* Cohorts: one per signup month. Retention values come from a fixed formula, so they stay the same. */
export interface Cohort {
  label: string
  customers: number
  /** Percent of month-0 revenue kept, month 0 first. */
  revenue: number[]
  /** Percent of month-0 customers still paying. */
  logos: number[]
}

export const cohorts: Cohort[] = customerMonths.map((month, index) => {
  const age = customerMonths.length - index // months of data for this cohort
  const wobble = ((index * 37) % 7) - 3 // -3..3, varies by cohort
  const revenue: number[] = []
  const logos: number[] = []
  for (let m = 0; m < age; m++) {
    if (m === 0) {
      revenue.push(100)
      logos.push(100)
      continue
    }
    const logo = 100 * Math.pow(0.972 - wobble * 0.002, m)
    const expansionLift = 1 + m * (0.011 + wobble * 0.0008)
    logos.push(Math.round(logo))
    revenue.push(Math.round(Math.min(108, logo * expansionLift)))
  }
  return { label: month.full, customers: month.added, revenue, logos }
})
