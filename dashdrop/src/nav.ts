import type { IconName } from './components/Icon.tsx'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  /** Only active on an exact match (used for "/"). */
  end?: boolean
}

export interface NavGroup {
  id: string
  label: string | null
  items: NavItem[]
  /** Collapsed unless the current page is inside the group. */
  collapsible?: boolean
}

/* Sidebar links. The "All screens" page (src/pages/Screens.tsx) lists every route, including auth and onboarding. */
export const NAV: NavGroup[] = [
  {
    id: 'main',
    label: null,
    items: [
      { to: '/', label: 'Overview', icon: 'overview', end: true },
      { to: '/getting-started', label: 'Getting started', icon: 'flag' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { to: '/analytics', label: 'Analytics', icon: 'analytics' },
      { to: '/reports/mrr', label: 'MRR', icon: 'lineChart' },
      { to: '/reports/churn', label: 'Churn', icon: 'trendDown' },
      { to: '/reports/cohorts', label: 'Cohorts', icon: 'grid' },
      { to: '/reports/plans', label: 'By plan', icon: 'layers' },
      { to: '/reports/countries', label: 'By country', icon: 'globe' },
      { to: '/reports/forecast', label: 'Forecast', icon: 'trendUp' },
      { to: '/reports/saved', label: 'Saved reports', icon: 'invoices', end: true },
      { to: '/reports/builder', label: 'Report builder', icon: 'blocks' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    items: [
      { to: '/customers', label: 'Customers', icon: 'customers', end: true },
      { to: '/segments', label: 'Segments', icon: 'filter' },
      { to: '/customers/at-risk', label: 'At risk', icon: 'warning' },
      { to: '/pipeline', label: 'Pipeline', icon: 'overview' },
      { to: '/renewals', label: 'Renewals', icon: 'calendar' },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    items: [
      { to: '/alerts', label: 'Alert rules', icon: 'bell' },
      { to: '/notifications', label: 'Notifications', icon: 'inbox' },
      { to: '/inbox', label: 'Inbox', icon: 'mail' },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      { to: '/subscriptions', label: 'Subscriptions', icon: 'repeat' },
      { to: '/invoices', label: 'Invoices', icon: 'invoices' },
      { to: '/payments', label: 'Payments', icon: 'card' },
      { to: '/disputes', label: 'Refunds & disputes', icon: 'shield' },
      { to: '/plans', label: 'Plans & prices', icon: 'layers' },
      { to: '/coupons', label: 'Coupons', icon: 'tag' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    collapsible: true,
    items: [
      { to: '/team', label: 'Team', icon: 'userPlus', end: true },
      { to: '/team/roles', label: 'Roles', icon: 'shield' },
      { to: '/audit-log', label: 'Audit log', icon: 'clock' },
    ],
  },
  {
    id: 'ui',
    label: 'UI kit',
    collapsible: true,
    items: [
      { to: '/ui/buttons', label: 'Buttons & badges', icon: 'blocks' },
      { to: '/ui/forms', label: 'Forms', icon: 'form' },
      { to: '/ui/tables', label: 'Tables', icon: 'table' },
      { to: '/ui/charts', label: 'Charts', icon: 'analytics' },
      { to: '/ui/overlays', label: 'Overlays', icon: 'window' },
      { to: '/ui/states', label: 'States', icon: 'inbox' },
    ],
  },
]

export const NAV_FOOTER: NavItem[] = [
  { to: '/whats-new', label: "What's new", icon: 'zap' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/screens', label: 'All screens', icon: 'grid' },
]
