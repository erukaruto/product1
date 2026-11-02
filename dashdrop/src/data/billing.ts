/*
  Demo billing data, derived from customers and invoices so the numbers agree:
  - one subscription per customer
  - one payment per paid invoice, failed payments for overdue invoices
  - refunds and disputes point at real payments
  - plan customer counts and MRR match the plan mix on the overview
*/
import type {
  BillingCase,
  BillingInterval,
  CaseStatus,
  Coupon,
  Payment,
  PaymentStatus,
  PlanDefinition,
  Subscription,
  SubscriptionStatus,
} from '../types.ts'
import { customers } from './customers.ts'
import { invoices } from './invoices.ts'
import { planMix, TODAY } from './metrics.ts'

const DAY = 86400000
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY)

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

/** Next renewal on or after TODAY, counting from the start date. */
function nextRenewal(started: Date, interval: BillingInterval): Date {
  let renewal = new Date(started)
  while (renewal <= TODAY) renewal = addMonths(renewal, interval === 'yearly' ? 12 : 1)
  return renewal
}

const hash = (text: string) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7)

/* Subscriptions */

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trialing',
  past_due: 'Past due',
  canceled: 'Canceled',
}

export const subscriptions: Subscription[] = customers.map((customer, index) => {
  // Every fourth paying customer pays yearly (10x the monthly price).
  const interval: BillingInterval = customer.status !== 'trial' && index % 4 === 2 ? 'yearly' : 'monthly'
  const status: SubscriptionStatus =
    customer.status === 'trial' ? 'trialing' : customer.status === 'past_due' ? 'past_due' : customer.status === 'canceled' ? 'canceled' : 'active'
  const canceled = status === 'canceled' ? addDays(TODAY, -1) : null
  return {
    id: `sub_${(hash(customer.id) % 900000) + 100000}`,
    customerId: customer.id,
    customer: customer.company,
    plan: customer.plan,
    interval,
    seats: customer.seats,
    amount: interval === 'yearly' ? customer.listMrr * 10 : customer.listMrr,
    mrr: customer.mrr,
    status,
    started: customer.joined,
    renews: status === 'canceled' ? null : status === 'trialing' ? addDays(customer.joined, 14) : nextRenewal(customer.joined, interval),
    canceled,
  }
})

export function getSubscription(id: string | undefined): Subscription | undefined {
  return subscriptions.find((subscription) => subscription.id === id)
}

export function subscriptionFor(customerId: string): Subscription | undefined {
  return subscriptions.find((subscription) => subscription.customerId === customerId)
}

/* Payments */

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  succeeded: 'Succeeded',
  failed: 'Failed',
  refunded: 'Refunded',
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Visa', 'Mastercard']

function methodFor(customerId: string): string {
  const h = hash(customerId)
  if (h % 9 === 0) return 'Bank transfer'
  return `${CARD_BRANDS[h % CARD_BRANDS.length]} ending ${String(1000 + (h % 9000)).slice(-4)}`
}

let paymentCounter = 51200

const paidPayments: Payment[] = invoices
  .filter((invoice) => invoice.status === 'paid')
  .map((invoice) => ({
    id: `pay_${++paymentCounter}`,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    customer: invoice.customer,
    amount: invoice.amount,
    method: methodFor(invoice.customerId),
    status: 'succeeded' as PaymentStatus,
    date: addDays(invoice.issued, hash(invoice.id) % 3),
  }))

const failedPayments: Payment[] = invoices
  .filter((invoice) => invoice.status === 'overdue')
  .map((invoice) => ({
    id: `pay_${++paymentCounter}`,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    customer: invoice.customer,
    amount: invoice.amount,
    method: methodFor(invoice.customerId),
    status: 'failed' as PaymentStatus,
    date: invoice.due,
    failureReason: hash(invoice.id) % 2 === 0 ? 'Card declined' : 'Insufficient funds',
  }))

export const payments: Payment[] = [...paidPayments, ...failedPayments].sort((a, b) => b.date.getTime() - a.date.getTime())

/* Refunds and disputes. Each points at a real succeeded payment. */

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  needs_response: 'Needs response',
  under_review: 'Under review',
  won: 'Won',
  lost: 'Lost',
  refunded: 'Refunded',
}

const caseTemplates: Array<{ kind: BillingCase['kind']; reason: string; status: CaseStatus; daysAgo: number }> = [
  { kind: 'dispute', reason: 'Customer does not recognize the charge', status: 'needs_response', daysAgo: 3 },
  { kind: 'dispute', reason: 'Charged after cancellation', status: 'under_review', daysAgo: 12 },
  { kind: 'dispute', reason: 'Duplicate charge', status: 'won', daysAgo: 40 },
  { kind: 'dispute', reason: 'Product not as described', status: 'lost', daysAgo: 55 },
  { kind: 'refund', reason: 'Upgraded by mistake', status: 'refunded', daysAgo: 6 },
  { kind: 'refund', reason: 'Requested within 14 days of renewal', status: 'refunded', daysAgo: 19 },
]

const succeeded = payments.filter((payment) => payment.status === 'succeeded')

export const billingCases: BillingCase[] = caseTemplates.map((template, index) => {
  const payment = succeeded[(index * 13 + 5) % succeeded.length]
  if (template.status === 'refunded' || template.status === 'lost') payment.status = 'refunded'
  const opened = addDays(TODAY, -template.daysAgo)
  return {
    id: `${template.kind === 'refund' ? 're' : 'dp'}_${7300 + index}`,
    kind: template.kind,
    paymentId: payment.id,
    customerId: payment.customerId,
    customer: payment.customer,
    amount: payment.amount,
    reason: template.reason,
    status: template.status,
    opened,
    respondBy: template.status === 'needs_response' ? addDays(opened, 10) : null,
  }
})

/* Plans. Customer counts and MRR come from the plan mix. */

const planStats = Object.fromEntries(planMix.map((row) => [row.plan, row]))

export const plans: PlanDefinition[] = [
  {
    name: 'Starter',
    description: 'For founders tracking their first paying customers.',
    monthly: 19,
    yearly: 190,
    seatPrice: 0,
    features: ['Up to $10k MRR tracked', '1 billing connection', '2 team members', 'Email alerts'],
    customers: planStats.Starter.customers,
    mrr: planStats.Starter.mrr,
  },
  {
    name: 'Growth',
    description: 'For teams that review revenue every week.',
    monthly: 49,
    yearly: 490,
    seatPrice: 6,
    features: ['Up to $100k MRR tracked', '3 billing connections', '10 team members', 'Email and Slack alerts', 'Cohort reports'],
    customers: planStats.Growth.customers,
    mrr: planStats.Growth.mrr,
  },
  {
    name: 'Scale',
    description: 'For companies with several products or regions.',
    monthly: 129,
    yearly: 1290,
    seatPrice: 9,
    features: ['Unlimited MRR tracked', 'Unlimited billing connections', 'Unlimited team members', 'REST API and webhooks', 'SSO and audit log'],
    customers: planStats.Scale.customers,
    mrr: planStats.Scale.mrr,
  },
]

/* Coupons */

export const coupons: Coupon[] = [
  { code: 'LAUNCH20', description: 'Launch week offer', kind: 'percent', value: 20, duration: 'once', months: null, redemptions: 142, maxRedemptions: 200, expires: new Date('2026-12-31T00:00:00Z'), active: true },
  { code: 'STARTUP3', description: 'Startup program, first 3 months', kind: 'percent', value: 30, duration: 'repeating', months: 3, redemptions: 57, maxRedemptions: null, expires: null, active: true },
  { code: 'NONPROFIT', description: 'Nonprofit discount', kind: 'percent', value: 50, duration: 'forever', months: null, redemptions: 18, maxRedemptions: null, expires: null, active: true },
  { code: 'FRIENDS10', description: 'Referral credit', kind: 'amount', value: 10, duration: 'once', months: null, redemptions: 64, maxRedemptions: 100, expires: null, active: true },
  { code: 'SUMMER26', description: 'Summer campaign', kind: 'percent', value: 25, duration: 'once', months: null, redemptions: 88, maxRedemptions: 150, expires: new Date('2026-08-31T00:00:00Z'), active: false },
]
