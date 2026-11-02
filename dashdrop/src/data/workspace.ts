/*
  Demo data for the workspace screens: segments, health scores, alerts, notifications, inbox,
  team, roles, audit log, integrations, API keys and webhooks.
  Segments are defined as filters and their counts are calculated from the customers list.
*/
import type { Customer, PlanName } from '../types.ts'
import { customers } from './customers.ts'
import { TODAY } from './metrics.ts'

const DAY = 86400000
const daysAgo = (days: number, hours = 0) => new Date(TODAY.getTime() - days * DAY - hours * 3600000)

/* Segments */

export type SegmentField = 'plan' | 'status' | 'country' | 'mrr' | 'seats'
export type SegmentOperator = 'is' | 'is_not' | 'greater_than' | 'less_than'

export interface SegmentRule {
  field: SegmentField
  operator: SegmentOperator
  value: string
}

export interface Segment {
  id: string
  name: string
  description: string
  match: 'all' | 'any'
  rules: SegmentRule[]
  updated: Date
}

export const SEGMENT_FIELDS: Record<SegmentField, { label: string; numeric: boolean; options?: string[] }> = {
  plan: { label: 'Plan', numeric: false, options: ['Starter', 'Growth', 'Scale'] },
  status: { label: 'Status', numeric: false, options: ['active', 'trial', 'past_due', 'canceled'] },
  country: { label: 'Country', numeric: false },
  mrr: { label: 'MRR (USD)', numeric: true },
  seats: { label: 'Seats', numeric: true },
}

export const OPERATOR_LABELS: Record<SegmentOperator, string> = {
  is: 'is',
  is_not: 'is not',
  greater_than: 'is more than',
  less_than: 'is less than',
}

function ruleMatches(customer: Customer, rule: SegmentRule): boolean {
  const raw = customer[rule.field]
  if (rule.operator === 'greater_than') return Number(raw) > Number(rule.value)
  if (rule.operator === 'less_than') return Number(raw) < Number(rule.value)
  const equal = String(raw).toLowerCase() === rule.value.trim().toLowerCase()
  return rule.operator === 'is' ? equal : !equal
}

/** Customers matching a set of rules. Used by the segment list and the live preview in the builder. */
export function matchSegment(rules: SegmentRule[], match: 'all' | 'any'): Customer[] {
  if (rules.length === 0) return customers
  return customers.filter((customer) => (match === 'all' ? rules.every((r) => ruleMatches(customer, r)) : rules.some((r) => ruleMatches(customer, r))))
}

export const segments: Segment[] = [
  { id: 'seg_scale', name: 'Scale accounts', description: 'Every customer on the Scale plan', match: 'all', rules: [{ field: 'plan', operator: 'is', value: 'Scale' }], updated: daysAgo(3) },
  { id: 'seg_us_growth', name: 'US on Growth', description: 'Growth plan customers in the United States', match: 'all', rules: [{ field: 'plan', operator: 'is', value: 'Growth' }, { field: 'country', operator: 'is', value: 'United States' }], updated: daysAgo(9) },
  { id: 'seg_needs_attention', name: 'Needs attention', description: 'Past due or canceled', match: 'any', rules: [{ field: 'status', operator: 'is', value: 'past_due' }, { field: 'status', operator: 'is', value: 'canceled' }], updated: daysAgo(1) },
  { id: 'seg_big_teams', name: 'Teams of 5+', description: 'Accounts with 5 or more seats', match: 'all', rules: [{ field: 'seats', operator: 'greater_than', value: '4' }], updated: daysAgo(21) },
  { id: 'seg_high_mrr', name: 'Over $100 MRR', description: 'Highest-value accounts', match: 'all', rules: [{ field: 'mrr', operator: 'greater_than', value: '100' }], updated: daysAgo(14) },
]

/* Health scores: a simple, explainable formula so the at-risk list can show why an account is flagged. */

export interface HealthSignal {
  label: string
  points: number
}

export interface Health {
  customer: Customer
  score: number
  signals: HealthSignal[]
}

function daysSince(date: Date): number {
  return Math.round((TODAY.getTime() - date.getTime()) / DAY)
}

export function healthOf(customer: Customer): Health {
  const signals: HealthSignal[] = []
  const idle = daysSince(customer.lastSeen)
  if (customer.status === 'past_due') signals.push({ label: 'Payment past due', points: -35 })
  if (customer.status === 'canceled') signals.push({ label: 'Subscription canceled', points: -60 })
  if (idle >= 14) signals.push({ label: `No logins for ${idle} days`, points: -30 })
  else if (idle >= 5) signals.push({ label: `Last login ${idle} days ago`, points: -10 })
  if (customer.status === 'trial') signals.push({ label: 'Still in trial', points: -15 })
  if (customer.seats >= 5) signals.push({ label: `${customer.seats} seats in use`, points: 10 })
  const score = Math.max(0, Math.min(100, 85 + signals.reduce((sum, s) => sum + s.points, 0)))
  return { customer, score, signals }
}

export const health: Health[] = customers.map(healthOf).sort((a, b) => a.score - b.score)

export const healthBand = (score: number): { label: string; tone: 'good' | 'warn' | 'bad' } =>
  score >= 70 ? { label: 'Healthy', tone: 'good' } : score >= 45 ? { label: 'At risk', tone: 'warn' } : { label: 'Critical', tone: 'bad' }

/* Alerts */

export type AlertEvent = 'payment_failed' | 'canceled' | 'downgraded' | 'inactive' | 'mrr_drop' | 'trial_ending'
export type AlertChannel = 'email' | 'slack' | 'webhook'

export interface AlertRule {
  id: string
  name: string
  event: AlertEvent
  threshold: number | null
  plans: PlanName[]
  channels: AlertChannel[]
  recipients: string
  enabled: boolean
  lastTriggered: Date | null
  triggered30d: number
}

export const ALERT_EVENTS: Record<AlertEvent, { label: string; thresholdLabel?: string; unit?: string }> = {
  payment_failed: { label: 'A payment fails' },
  canceled: { label: 'A customer cancels' },
  downgraded: { label: 'A customer downgrades' },
  inactive: { label: 'No logins for', thresholdLabel: 'Days without a login', unit: 'days' },
  mrr_drop: { label: 'MRR drops by more than', thresholdLabel: 'Percent drop in a day', unit: '%' },
  trial_ending: { label: 'A trial ends in', thresholdLabel: 'Days before the end', unit: 'days' },
}

export const CHANNEL_LABELS: Record<AlertChannel, string> = { email: 'Email', slack: 'Slack', webhook: 'Webhook' }

export const alertRules: AlertRule[] = [
  { id: 'alr_101', name: 'Failed payments', event: 'payment_failed', threshold: null, plans: ['Starter', 'Growth', 'Scale'], channels: ['email', 'slack'], recipients: 'billing@beacon.example', enabled: true, lastTriggered: daysAgo(0, 1), triggered30d: 9 },
  { id: 'alr_102', name: 'Cancellations', event: 'canceled', threshold: null, plans: ['Starter', 'Growth', 'Scale'], channels: ['email'], recipients: 'lena@beacon.example', enabled: true, lastTriggered: daysAgo(1), triggered30d: 26 },
  { id: 'alr_103', name: 'Quiet Scale accounts', event: 'inactive', threshold: 14, plans: ['Scale'], channels: ['email', 'slack'], recipients: 'success@beacon.example', enabled: true, lastTriggered: daysAgo(0, 2), triggered30d: 3 },
  { id: 'alr_104', name: 'Downgrades', event: 'downgraded', threshold: null, plans: ['Growth', 'Scale'], channels: ['slack'], recipients: '#revenue', enabled: true, lastTriggered: daysAgo(4), triggered30d: 7 },
  { id: 'alr_105', name: 'MRR drop', event: 'mrr_drop', threshold: 5, plans: ['Starter', 'Growth', 'Scale'], channels: ['email', 'webhook'], recipients: 'finance@beacon.example', enabled: false, lastTriggered: null, triggered30d: 0 },
  { id: 'alr_106', name: 'Trials ending soon', event: 'trial_ending', threshold: 3, plans: ['Starter', 'Growth', 'Scale'], channels: ['email'], recipients: 'sales@beacon.example', enabled: true, lastTriggered: daysAgo(0, 5), triggered30d: 31 },
]

export function getAlertRule(id: string | undefined): AlertRule | undefined {
  return alertRules.find((rule) => rule.id === id)
}

/* Notifications */

export type NotificationKind = 'alert' | 'billing' | 'team' | 'system'

export interface Notification {
  id: number
  kind: NotificationKind
  title: string
  body: string
  at: Date
  read: boolean
  link?: string
}

export const notifications: Notification[] = [
  { id: 1, kind: 'alert', title: 'Payment failed: Copperline', body: 'Card declined for $49.00. Retrying tomorrow.', at: daysAgo(0, 0.05), read: false, link: '/customers/cus_1001' },
  { id: 2, kind: 'alert', title: 'No logins for 14 days: Fieldnote', body: 'Scale plan, 12 seats. Last active Oct 17.', at: daysAgo(0, 1), read: false, link: '/customers/cus_1002' },
  { id: 3, kind: 'billing', title: 'Lumen Works upgraded to Scale', body: 'MRR +$80. Effective today.', at: daysAgo(0, 3), read: false, link: '/customers/cus_1003' },
  { id: 4, kind: 'team', title: 'Emma Walsh joined Beacon HQ', body: 'Invited by Daniel Kwame as a viewer.', at: daysAgo(0, 6), read: true, link: '/team' },
  { id: 5, kind: 'alert', title: 'Subscription canceled: Harbor & Pine', body: 'Starter plan, $19/mo. Reason: moving to an in-house tool.', at: daysAgo(1), read: true, link: '/customers/cus_1004' },
  { id: 6, kind: 'system', title: 'Import finished', body: '1,284 customers and 14,920 invoices imported.', at: daysAgo(2), read: true },
  { id: 7, kind: 'billing', title: 'Dispute opened', body: 'A card issuer opened a dispute. Respond within 10 days.', at: daysAgo(3), read: true, link: '/disputes' },
  { id: 8, kind: 'system', title: 'Weekly digest is ready', body: 'MRR +$1,880 in October. 26 customers churned.', at: daysAgo(5), read: true, link: '/reports/mrr' },
]

/* Inbox: conversations with customers */

export interface Message {
  from: 'customer' | 'team'
  author: string
  text: string
  at: Date
}

export interface Conversation {
  id: string
  customerId: string
  customer: string
  contact: string
  subject: string
  status: 'open' | 'snoozed' | 'closed'
  unread: boolean
  messages: Message[]
}

export const conversations: Conversation[] = [
  {
    id: 'conv_1',
    customerId: 'cus_1001',
    customer: 'Copperline',
    contact: 'Grace Liu',
    subject: 'Card was declined',
    status: 'open',
    unread: true,
    messages: [
      { from: 'customer', author: 'Grace Liu', text: 'Hi, we got an email that our payment failed. We changed banks last week. How do we update the card?', at: daysAgo(0, 2) },
    ],
  },
  {
    id: 'conv_2',
    customerId: 'cus_1002',
    customer: 'Fieldnote',
    contact: 'Amara Okafor',
    subject: 'Exporting cohorts for our board deck',
    status: 'open',
    unread: true,
    messages: [
      { from: 'customer', author: 'Amara Okafor', text: 'Can the cohort report be exported? We present to the board next Thursday.', at: daysAgo(1, 4) },
      { from: 'team', author: 'Sara Bianchi', text: 'Yes. Open Reports, Cohorts and use Export CSV. Want me to send a version with the last 12 months?', at: daysAgo(1, 2) },
      { from: 'customer', author: 'Amara Okafor', text: 'That would be great, thank you. Revenue retention please.', at: daysAgo(0, 5) },
    ],
  },
  {
    id: 'conv_3',
    customerId: 'cus_1003',
    customer: 'Lumen Works',
    contact: 'Kwabena Owusu',
    subject: 'Invoice address for the Scale plan',
    status: 'snoozed',
    unread: false,
    messages: [
      { from: 'customer', author: 'Kwabena Owusu', text: 'Our new invoices should go to accounts@lumenworks.example. Can you change that?', at: daysAgo(2) },
      { from: 'team', author: 'Sara Bianchi', text: 'Done. The next invoice will go to the new address.', at: daysAgo(2) },
    ],
  },
  {
    id: 'conv_4',
    customerId: 'cus_1004',
    customer: 'Harbor & Pine',
    contact: 'Isabel Ferreira',
    subject: 'Cancellation',
    status: 'closed',
    unread: false,
    messages: [
      { from: 'customer', author: 'Isabel Ferreira', text: 'We are moving our reporting in-house, so we canceled. Thanks for the help this year.', at: daysAgo(1) },
      { from: 'team', author: 'Lena Marsh', text: 'Thanks for telling us. Your data stays available for export for 30 days.', at: daysAgo(1) },
    ],
  },
]

/* Team and roles */

export type RoleName = 'Owner' | 'Admin' | 'Billing' | 'Viewer'

export interface Member {
  name: string
  email: string
  role: RoleName
  lastActive: string
  twoFactor: boolean
  status: 'active' | 'invited'
}

export const members: Member[] = [
  { name: 'Lena Marsh', email: 'lena@beacon.example', role: 'Owner', lastActive: 'Now', twoFactor: true, status: 'active' },
  { name: 'Daniel Kwame', email: 'daniel@beacon.example', role: 'Admin', lastActive: '2 hours ago', twoFactor: true, status: 'active' },
  { name: 'Priya Sethi', email: 'priya@beacon.example', role: 'Admin', lastActive: 'Yesterday', twoFactor: true, status: 'active' },
  { name: 'Yuki Nakamura', email: 'yuki@beacon.example', role: 'Admin', lastActive: '3 days ago', twoFactor: false, status: 'active' },
  { name: 'Ahmed Rahman', email: 'ahmed@beacon.example', role: 'Billing', lastActive: 'Today', twoFactor: true, status: 'active' },
  { name: 'Tomás Ortega', email: 'tomas@beacon.example', role: 'Viewer', lastActive: 'Last week', twoFactor: false, status: 'active' },
  { name: 'Sara Bianchi', email: 'sara@beacon.example', role: 'Viewer', lastActive: 'Today', twoFactor: true, status: 'active' },
  { name: 'Emma Walsh', email: 'emma@beacon.example', role: 'Viewer', lastActive: '-', twoFactor: false, status: 'invited' },
]

export const PERMISSIONS = [
  'View reports and customers',
  'Export CSV files',
  'Manage alerts',
  'Manage billing and invoices',
  'Invite and remove members',
  'Change workspace settings',
  'Manage API keys and webhooks',
  'Delete the workspace',
] as const

export const ROLES: Array<{ name: RoleName; description: string; allowed: Array<(typeof PERMISSIONS)[number]> }> = [
  { name: 'Owner', description: 'Full access. One per workspace.', allowed: [...PERMISSIONS] },
  {
    name: 'Admin',
    description: 'Everything except deleting the workspace.',
    allowed: PERMISSIONS.filter((p) => p !== 'Delete the workspace'),
  },
  { name: 'Billing', description: 'Invoices, payments and plans.', allowed: ['View reports and customers', 'Export CSV files', 'Manage billing and invoices'] },
  { name: 'Viewer', description: 'Read-only access to reports.', allowed: ['View reports and customers'] },
]

/* Audit log */

export interface AuditEvent {
  id: number
  actor: string
  action: string
  target: string
  category: 'auth' | 'billing' | 'settings' | 'team' | 'data'
  at: Date
  ip: string
}

const AUDIT_TEMPLATES: Array<Omit<AuditEvent, 'id' | 'at'>> = [
  { actor: 'Lena Marsh', action: 'Signed in', target: 'Web, Chrome on macOS', category: 'auth', ip: '81.2.69.142' },
  { actor: 'Daniel Kwame', action: 'Invited a member', target: 'emma@beacon.example (Viewer)', category: 'team', ip: '203.0.113.24' },
  { actor: 'Ahmed Rahman', action: 'Marked an invoice as paid', target: 'INV-2231', category: 'billing', ip: '198.51.100.7' },
  { actor: 'Priya Sethi', action: 'Exported a report', target: 'MRR, Nov 2025 to Oct 2026', category: 'data', ip: '192.0.2.55' },
  { actor: 'Lena Marsh', action: 'Changed an alert', target: 'Quiet Scale accounts', category: 'settings', ip: '81.2.69.142' },
  { actor: 'Yuki Nakamura', action: 'Created an API key', target: 'Data warehouse sync', category: 'settings', ip: '203.0.113.90' },
  { actor: 'Daniel Kwame', action: 'Changed a role', target: 'Ahmed Rahman: Viewer to Billing', category: 'team', ip: '203.0.113.24' },
  { actor: 'Ahmed Rahman', action: 'Issued a refund', target: 'Payment pay_51240, $49.00', category: 'billing', ip: '198.51.100.7' },
  { actor: 'Sara Bianchi', action: 'Signed in', target: 'Web, Firefox on Windows', category: 'auth', ip: '192.0.2.18' },
  { actor: 'Lena Marsh', action: 'Turned on two-factor', target: 'Own account', category: 'auth', ip: '81.2.69.142' },
]

export const auditLog: AuditEvent[] = Array.from({ length: 36 }, (_, i) => ({
  id: 9000 - i,
  ...AUDIT_TEMPLATES[(i * 7) % AUDIT_TEMPLATES.length],
  at: daysAgo(Math.floor(i / 3), (i % 3) * 3 + 1),
}))

/* Integrations, API keys and webhooks */

export interface Integration {
  id: string
  name: string
  category: 'Billing' | 'Messaging' | 'Data'
  description: string
  connected: boolean
  detail?: string
}

export const integrations: Integration[] = [
  { id: 'billing-provider', name: 'Billing provider', category: 'Billing', description: 'Subscriptions, invoices and payments. Read-only.', connected: true, detail: 'Last sync 12 minutes ago' },
  { id: 'csv', name: 'CSV import', category: 'Billing', description: 'Upload exports from any billing system.', connected: true, detail: '2 imports this month' },
  { id: 'slack', name: 'Slack', category: 'Messaging', description: 'Send alerts to a channel.', connected: true, detail: 'Posting to #revenue' },
  { id: 'email', name: 'Email digest', category: 'Messaging', description: 'A weekly summary every Monday.', connected: false },
  { id: 'warehouse', name: 'Data warehouse', category: 'Data', description: 'Nightly copy of all tables.', connected: false },
  { id: 'sheets', name: 'Spreadsheet sync', category: 'Data', description: 'Keep a spreadsheet updated with MRR by month.', connected: false },
]

export interface ApiKey {
  id: string
  name: string
  prefix: string
  scope: 'read' | 'write'
  created: Date
  lastUsed: Date | null
}

export const apiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Data warehouse sync', prefix: 'bk_live_7Tq2', scope: 'read', created: daysAgo(41), lastUsed: daysAgo(0, 3) },
  { id: 'key_2', name: 'Internal dashboard', prefix: 'bk_live_Pz81', scope: 'read', created: daysAgo(120), lastUsed: daysAgo(2) },
  { id: 'key_3', name: 'Event sender (staging)', prefix: 'bk_test_Lm40', scope: 'write', created: daysAgo(9), lastUsed: null },
]

export interface Webhook {
  id: string
  url: string
  events: string[]
  enabled: boolean
  lastDelivery: { status: number; at: Date } | null
  successRate: number | null
}

export const WEBHOOK_EVENTS = ['customer.created', 'subscription.updated', 'subscription.canceled', 'invoice.paid', 'payment.failed', 'alert.triggered']

export const webhooks: Webhook[] = [
  { id: 'wh_1', url: 'https://hooks.beacon.example/revenue', events: ['subscription.updated', 'subscription.canceled', 'invoice.paid'], enabled: true, lastDelivery: { status: 200, at: daysAgo(0, 1) }, successRate: 99.6 },
  { id: 'wh_2', url: 'https://ops.beacon.example/alerts', events: ['payment.failed', 'alert.triggered'], enabled: true, lastDelivery: { status: 500, at: daysAgo(0, 2) }, successRate: 87.2 },
  { id: 'wh_3', url: 'https://staging.beacon.example/test', events: ['customer.created'], enabled: false, lastDelivery: null, successRate: null },
]

/* Login sessions for the security page */

export const sessions = [
  { id: 's1', device: 'Chrome on macOS', location: 'Bristol, United Kingdom', lastActive: 'Now', current: true },
  { id: 's2', device: 'Safari on iPhone', location: 'Bristol, United Kingdom', lastActive: '2 hours ago', current: false },
  { id: 's3', device: 'Firefox on Windows', location: 'London, United Kingdom', lastActive: '6 days ago', current: false },
]

