import type { ActivityItem } from '../types.ts'

// Demo activity feed. Matches the alerts shown on the SaaSDrop landing page.
export const activity: ActivityItem[] = [
  { id: 1, type: 'payment_failed', title: 'Payment failed', detail: 'Copperline, Growth plan, $49/mo', time: '2 min ago', customerId: 'cus_1001' },
  { id: 2, type: 'inactive', title: 'No logins for 14 days', detail: 'Fieldnote, Scale plan, 12 seats', time: '1 hour ago', customerId: 'cus_1002' },
  { id: 3, type: 'upgrade', title: 'Upgraded to Scale', detail: 'Lumen Works, +$80/mo', time: '3 hours ago', customerId: 'cus_1003' },
  { id: 4, type: 'canceled', title: 'Subscription canceled', detail: 'Harbor & Pine, Starter plan, $19/mo', time: 'Yesterday', customerId: 'cus_1004' },
  { id: 5, type: 'new', title: 'New customer', detail: 'Tidewater started a Growth plan', time: 'Yesterday', customerId: 'cus_1005' },
]
