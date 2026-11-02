/*
  Demo data for the Tahap 3 screens: revenue by plan and country, forecast scenarios,
  saved reports, releases ("What's new") and the customer success pipeline.
  Plan and country splits add up to the same MRR as the overview.
*/
import { countries, mrrMonths, planMix } from './metrics.ts'
import { customers } from './customers.ts'
import { subscriptions } from './billing.ts'
import { healthOf } from './workspace.ts'
import { TODAY } from './metrics.ts'
import type { Customer } from '../types.ts'

/* Revenue by plan per month. Starter's share shrinks and Scale's grows over the year;
   Growth is the remainder, so each month adds up exactly to that month's MRR. */
export interface PlanMonth {
  label: string
  full: string
  Starter: number
  Growth: number
  Scale: number
  total: number
}

export const planByMonth: PlanMonth[] = mrrMonths.map((m, i) => {
  const last = i === mrrMonths.length - 1
  const starterShare = 0.3 - (0.3 - planMix[0].mrr / 48320) * (i / (mrrMonths.length - 1))
  const scaleShare = 0.12 + (planMix[2].mrr / 48320 - 0.12) * (i / (mrrMonths.length - 1))
  const Starter = last ? planMix[0].mrr : Math.round(m.end * starterShare)
  const Scale = last ? planMix[2].mrr : Math.round(m.end * scaleShare)
  return { label: m.label, full: m.full, Starter, Scale, Growth: m.end - Starter - Scale, total: m.end }
})

/* Countries: current MRR from metrics.ts, plus last month and customer counts (1,284 in total). */
const PREVIOUS_FACTOR: Record<string, number> = { US: 0.962, GB: 0.971, DE: 0.958, CA: 0.981, IN: 0.92, ID: 0.905, BR: 0.947, XX: 0.968 }
const CUSTOMER_COUNTS: Record<string, number> = { US: 452, GB: 141, DE: 116, CA: 90, IN: 77, ID: 64, BR: 52, XX: 292 }

export const countryReport = countries.map((c) => {
  const previous = Math.round(c.mrr * PREVIOUS_FACTOR[c.code])
  const customersInCountry = CUSTOMER_COUNTS[c.code]
  return { ...c, previous, customers: customersInCountry, arpa: c.mrr / customersInCountry, growth: ((c.mrr - previous) / previous) * 100 }
})

/* Forecast scenarios: monthly net MRR growth. The base case uses the average of the last 12 months (about 4%). */
export const averageGrowth = (Math.pow(mrrMonths[mrrMonths.length - 1].end / mrrMonths[0].start, 1 / mrrMonths.length) - 1) * 100

export const SCENARIOS = {
  conservative: { label: 'Conservative', growth: 2 },
  base: { label: 'Base', growth: Math.round(averageGrowth * 10) / 10 },
  optimistic: { label: 'Optimistic', growth: 5.5 },
} as const

export const FORECAST_MONTHS = [
  { label: 'Nov', full: 'Nov 2026' },
  { label: 'Dec', full: 'Dec 2026' },
  { label: 'Jan', full: 'Jan 2027' },
  { label: 'Feb', full: 'Feb 2027' },
  { label: 'Mar', full: 'Mar 2027' },
  { label: 'Apr', full: 'Apr 2027' },
]

export function forecast(startMrr: number, growthPercent: number) {
  let value = startMrr
  return FORECAST_MONTHS.map((month) => {
    value = value * (1 + growthPercent / 100)
    return { ...month, value: Math.round(value) }
  })
}

/* Saved reports */
export interface SavedReport {
  id: string
  name: string
  metric: 'mrr' | 'customers' | 'churn' | 'arpa'
  groupBy: 'month' | 'plan' | 'country'
  owner: string
  schedule: 'none' | 'weekly' | 'monthly'
  lastRun: string
}

export const savedReports: SavedReport[] = [
  { id: 'rep_1', name: 'Board pack: MRR by month', metric: 'mrr', groupBy: 'month', owner: 'Lena Marsh', schedule: 'monthly', lastRun: 'Oct 1, 2026' },
  { id: 'rep_2', name: 'Revenue by plan', metric: 'mrr', groupBy: 'plan', owner: 'Priya Sethi', schedule: 'weekly', lastRun: 'Oct 27, 2026' },
  { id: 'rep_3', name: 'Customers by country', metric: 'customers', groupBy: 'country', owner: 'Daniel Kwame', schedule: 'none', lastRun: 'Oct 14, 2026' },
  { id: 'rep_4', name: 'Churn rate trend', metric: 'churn', groupBy: 'month', owner: 'Sara Bianchi', schedule: 'weekly', lastRun: 'Oct 27, 2026' },
  { id: 'rep_5', name: 'ARPA by plan', metric: 'arpa', groupBy: 'plan', owner: 'Priya Sethi', schedule: 'none', lastRun: 'Sep 30, 2026' },
]

/* Releases shown on "What's new". Same entries as the SaaSDrop changelog. */
export const releases = [
  { version: 'v2.8', date: 'Oct 21, 2026', tag: 'New', title: 'Churn alerts by email', body: 'Get an email when a customer cancels, downgrades or has a failed payment.', points: ['Choose which events trigger an alert', 'Send alerts to a person or a shared inbox', 'Weekly digest for accounts with lower activity'] },
  { version: 'v2.7', date: 'Oct 6, 2026', tag: 'Improved', title: 'Faster customer search', body: 'Search now returns results as you type, across name, email and company.', points: [] },
  { version: 'v2.6', date: 'Sep 22, 2026', tag: 'New', title: 'Cohort retention report', body: 'See how much revenue each signup month keeps over time.', points: ['Monthly cohorts with revenue and logo retention', 'Filter by plan and country'] },
  { version: 'v2.5.1', date: 'Sep 9, 2026', tag: 'Fixed', title: 'Invoice totals with credit notes', body: 'Invoices with partial credit notes now show the correct outstanding amount.', points: [] },
  { version: 'v2.5', date: 'Aug 25, 2026', tag: 'Improved', title: 'Three color themes', body: 'Pick light, dark or sand in Settings. Your choice is saved per browser.', points: [] },
] as const

/* Customer success pipeline: stage from status, tenure, health and renewal date. */
export const STAGES = ['Trial', 'Onboarding', 'Healthy', 'Needs attention', 'Renewal due'] as const
export type Stage = (typeof STAGES)[number]

export interface PipelineCard {
  id: string
  customer: Customer
  stage: Stage
  note: string
}

const DAY = 86400000

export const pipeline: PipelineCard[] = customers
  .filter((c) => c.status !== 'canceled')
  .map((c): PipelineCard => {
    const health = healthOf(c)
    const sub = subscriptions.find((s) => s.customerId === c.id)
    const daysToRenewal = sub?.renews ? Math.round((sub.renews.getTime() - TODAY.getTime()) / DAY) : null
    const tenure = Math.round((TODAY.getTime() - c.joined.getTime()) / DAY)
    if (c.status === 'trial') return { id: c.id, customer: c, stage: 'Trial', note: `Trial day ${tenure} of 14` }
    if (health.score < 60) return { id: c.id, customer: c, stage: 'Needs attention', note: health.signals[0]?.label ?? 'Low health score' }
    if (tenure <= 45) return { id: c.id, customer: c, stage: 'Onboarding', note: tenure === 1 ? 'Joined yesterday' : `Joined ${tenure} days ago` }
    if (daysToRenewal != null && daysToRenewal <= 7) return { id: c.id, customer: c, stage: 'Renewal due', note: daysToRenewal === 0 ? 'Renews today' : daysToRenewal === 1 ? 'Renews tomorrow' : `Renews in ${daysToRenewal} days` }
    return { id: c.id, customer: c, stage: 'Healthy', note: `Health score ${health.score}` }
  })
  // Keep the board readable: at most 5 cards per stage.
  .filter((card, _, all) => all.filter((c) => c.stage === card.stage).indexOf(card) < 5)
