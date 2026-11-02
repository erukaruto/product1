/* Shared types for the demo data. Replace the data files in src/data/ with your API, keep these shapes. */

export type PlanName = 'Starter' | 'Growth' | 'Scale'
export type CustomerStatus = 'active' | 'trial' | 'past_due' | 'canceled'

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  plan: PlanName
  status: CustomerStatus
  seats: number
  /** Current monthly revenue. 0 for trials and canceled accounts. */
  mrr: number
  /** Monthly price for the plan and seats, whatever the status. */
  listMrr: number
  country: string
  countryCode: string
  joined: Date
  lastSeen: Date
}

export type InvoiceStatus = 'paid' | 'open' | 'overdue'

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  customerId: string
  customer: string
  issued: Date
  due: Date
  amount: number
  status: InvoiceStatus
  lines: InvoiceLine[]
}

export type BillingInterval = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export interface Subscription {
  id: string
  customerId: string
  customer: string
  plan: PlanName
  interval: BillingInterval
  seats: number
  /** Price per billing interval. */
  amount: number
  mrr: number
  status: SubscriptionStatus
  started: Date
  renews: Date | null
  canceled: Date | null
}

export type PaymentStatus = 'succeeded' | 'failed' | 'refunded'

export interface Payment {
  id: string
  invoiceId: string
  customerId: string
  customer: string
  amount: number
  method: string
  status: PaymentStatus
  date: Date
  failureReason?: string
}

export type CaseKind = 'refund' | 'dispute'
export type CaseStatus = 'needs_response' | 'under_review' | 'won' | 'lost' | 'refunded'

export interface BillingCase {
  id: string
  kind: CaseKind
  paymentId: string
  customerId: string
  customer: string
  amount: number
  reason: string
  status: CaseStatus
  opened: Date
  respondBy: Date | null
}

export interface PlanDefinition {
  name: PlanName
  description: string
  monthly: number
  yearly: number
  seatPrice: number
  features: string[]
  customers: number
  mrr: number
}

export type CouponKind = 'percent' | 'amount'
export type CouponDuration = 'once' | 'repeating' | 'forever'

export interface Coupon {
  code: string
  description: string
  kind: CouponKind
  value: number
  duration: CouponDuration
  months: number | null
  redemptions: number
  maxRedemptions: number | null
  expires: Date | null
  active: boolean
}

export type ActivityType = 'payment_failed' | 'inactive' | 'upgrade' | 'canceled' | 'new'

export interface ActivityItem {
  id: number
  type: ActivityType
  title: string
  detail: string
  time: string
  customerId: string
}

export interface MonthPoint {
  label: string
  full: string
}
