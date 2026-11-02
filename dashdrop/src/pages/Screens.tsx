import { Link } from 'react-router'
import { Card, PageHeader } from '../components/ui.tsx'
import { usePageTitle } from '../lib/hooks.ts'
import { subscriptions } from '../data/billing.ts'
import { invoices } from '../data/invoices.ts'

const SAMPLE_SUBSCRIPTION = subscriptions.find((s) => s.customer === 'Fieldnote')?.id ?? subscriptions[0].id
const SAMPLE_INVOICE = invoices[0].id

const GROUPS: Array<{ title: string; screens: Array<[string, string, string]> }> = [
  {
    title: 'Sign in and onboarding',
    screens: [
      ['/login', 'Sign in', 'Email and password, single sign-on button'],
      ['/signup', 'Create account', 'Password length check, terms checkbox'],
      ['/verify-email', 'Verify email', 'After sign-up, with resend'],
      ['/two-factor', 'Two-factor code', '6-digit code with paste support, recovery code'],
      ['/reset-password', 'Reset password', 'Request a reset link'],
      ['/new-password', 'New password', 'Strength meter and confirmation'],
      ['/invite', 'Accept invite', 'Join a workspace from an invitation'],
      ['/onboarding/workspace', 'Onboarding 1: workspace', 'Name, URL, currency, team size'],
      ['/onboarding/billing', 'Onboarding 2: billing data', 'Provider, CSV upload or API key'],
      ['/onboarding/team', 'Onboarding 3: team', 'Invite teammates with roles'],
    ],
  },
  {
    title: 'Dashboard and reports',
    screens: [
      ['/', 'Overview', 'KPIs, MRR chart, movement, invoices, activity'],
      ['/getting-started', 'Getting started', 'First-run checklist and empty states'],
      ['/analytics', 'Analytics', 'Gained and lost MRR, funnel, countries, cohorts'],
      ['/reports/mrr', 'MRR report', 'Monthly breakdown with CSV export'],
      ['/reports/churn', 'Churn report', 'Churn rate, reasons, accounts to follow up'],
      ['/reports/cohorts', 'Cohorts', 'Revenue and customer retention by signup month'],
      ['/reports/plans', 'Revenue by plan', 'Stacked bars and a monthly table'],
      ['/reports/countries', 'Revenue by country', 'Share, growth, customers, ARPA'],
      ['/reports/forecast', 'Forecast', 'Scenarios or your own growth rate'],
      ['/reports/saved', 'Saved reports', 'Run, schedule, delete'],
      ['/reports/builder', 'Report builder', 'Metric and grouping with a live preview'],
      ['/customers', 'Customers', 'Search, filter, sort, select, export'],
      ['/customers/cus_1002', 'Customer detail', 'KPIs, invoices, timeline'],
    ],
  },
  {
    title: 'Customers',
    screens: [
      ['/segments', 'Segments', 'Saved groups with live counts'],
      ['/segments/new', 'Segment builder', 'Rules with a live preview'],
      ['/customers/at-risk', 'At-risk accounts', 'Health score with the signals behind it'],
      ['/customers/import', 'Import customers', 'Upload, match columns, review'],
      ['/customers/cus_1002/edit', 'Edit customer', 'Validation and a typed delete confirmation'],
      ['/pipeline', 'Pipeline', 'Kanban board, drag or use the arrows'],
      ['/renewals', 'Renewals calendar', 'Month grid with renewals per day'],
    ],
  },
  {
    title: 'Alerts and messages',
    screens: [
      ['/alerts', 'Alert rules', 'Turn rules on and off'],
      ['/alerts/new', 'Alert rule editor', 'Trigger, plans, channels, live summary'],
      ['/notifications', 'Notifications', 'Filters, mark as read'],
      ['/inbox', 'Inbox', 'Customer conversations with replies'],
      ['/search?q=copper', 'Search', 'Customers, invoices, subscriptions and pages'],
      ['/whats-new', "What's new", 'Release notes with "mark as seen"'],
    ],
  },
  {
    title: 'Billing',
    screens: [
      ['/subscriptions', 'Subscriptions', 'Status tabs, renewals'],
      [`/subscriptions/${SAMPLE_SUBSCRIPTION}`, 'Subscription detail', 'Change plan and cancel dialogs'],
      ['/invoices', 'Invoices', 'Totals and status tabs'],
      ['/invoices/new', 'New invoice', 'Line items with live totals'],
      [`/invoices/${SAMPLE_INVOICE}`, 'Invoice detail', 'Printable layout'],
      ['/payments', 'Payments', 'Failed payments, row actions'],
      ['/disputes', 'Refunds & disputes', 'Respond with evidence'],
      ['/plans', 'Plans & prices', 'Monthly or yearly view, edit dialog'],
      ['/coupons', 'Coupons', 'Create with validation, copy code'],
    ],
  },
  {
    title: 'Team and settings',
    screens: [
      ['/team', 'Team', 'Invite, change roles, remove'],
      ['/team/roles', 'Roles & permissions', 'Permission matrix'],
      ['/audit-log', 'Audit log', 'Search, filter, export'],
      ['/settings', 'Settings', 'Profile, workspace, appearance, notifications'],
      ['/settings/security', 'Security', 'Password, two-factor, sessions'],
      ['/settings/billing', 'Plan & billing', 'Workspace plan, card, receipts'],
      ['/settings/integrations', 'Integrations', 'Connect and disconnect'],
      ['/settings/api-keys', 'API keys', 'Create once-visible keys, revoke'],
      ['/settings/webhooks', 'Webhooks', 'Endpoints, events, delivery status'],
      ['/settings/data', 'Data & privacy', 'Export, retention, delete workspace'],
    ],
  },
  {
    title: 'Errors',
    screens: [
      ['/does-not-exist', '404', 'Unknown address inside the app'],
      ['/403', '403', 'No access for this role'],
      ['/500', '500', 'Server error with a reference'],
    ],
  },
  {
    title: 'UI kit',
    screens: [
      ['/ui/buttons', 'Buttons & badges', 'Buttons, badges, avatars, tabs'],
      ['/ui/forms', 'Forms', 'Inputs, choices, upload, validation'],
      ['/ui/tables', 'Tables', 'Sorting, selection, empty table'],
      ['/ui/charts', 'Charts', 'Line, bar, stacked, share bars, sparkline'],
      ['/ui/overlays', 'Overlays', 'Modal, drawer, toast, menu, tooltip'],
      ['/ui/states', 'States', 'Empty, loading, error, stepper'],
    ],
  },
]

/* Index of every screen in the template. Not counted as a screen itself. */
export default function Screens() {
  usePageTitle('All screens')
  const total = GROUPS.reduce((sum, group) => sum + group.screens.length, 0)
  return (
    <>
      <PageHeader title="All screens" description={`${total} screens in DashDrop. Open any of them from here.`} />
      <div className="screens-grid">
        {GROUPS.map((group) => (
          <Card key={group.title} title={group.title} description={`${group.screens.length} screens`} flush>
            <ul className="screen-list">
              {group.screens.map(([to, title, text]) => (
                <li key={title}>
                  <Link to={to}>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  )
}
