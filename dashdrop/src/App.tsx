import { lazy, type ComponentType } from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.tsx'
import AuthLayout, { OnboardingLayout } from './components/AuthLayout.tsx'

/* Each page is loaded on demand, so the first visit only downloads the code it needs. */
function page(load: () => Promise<Record<string, unknown>>, exportName = 'default') {
  return lazy(async () => ({ default: (await load())[exportName] as ComponentType }))
}

// Auth and onboarding
const Login = page(() => import('./pages/auth/Login.tsx'))
const Signup = page(() => import('./pages/auth/Signup.tsx'))
const ResetPassword = page(() => import('./pages/auth/ResetPassword.tsx'))
const NewPassword = page(() => import('./pages/auth/NewPassword.tsx'))
const VerifyEmail = page(() => import('./pages/auth/VerifyEmail.tsx'))
const TwoFactor = page(() => import('./pages/auth/TwoFactor.tsx'))
const AcceptInvite = page(() => import('./pages/auth/AcceptInvite.tsx'))
const OnboardingWorkspace = page(() => import('./pages/auth/Onboarding.tsx'), 'OnboardingWorkspace')
const OnboardingBilling = page(() => import('./pages/auth/Onboarding.tsx'), 'OnboardingBilling')
const OnboardingTeam = page(() => import('./pages/auth/Onboarding.tsx'), 'OnboardingTeam')

// App
const Overview = page(() => import('./pages/Overview.tsx'))
const GettingStarted = page(() => import('./pages/GettingStarted.tsx'))
const Analytics = page(() => import('./pages/Analytics.tsx'))
const ReportMrr = page(() => import('./pages/reports/ReportMrr.tsx'))
const ReportChurn = page(() => import('./pages/reports/ReportChurn.tsx'))
const ReportCohorts = page(() => import('./pages/reports/ReportCohorts.tsx'))
const Customers = page(() => import('./pages/Customers.tsx'))
const CustomerDetail = page(() => import('./pages/CustomerDetail.tsx'))
const Subscriptions = page(() => import('./pages/billing/Subscriptions.tsx'))
const SubscriptionDetail = page(() => import('./pages/billing/SubscriptionDetail.tsx'))
const Invoices = page(() => import('./pages/billing/Invoices.tsx'))
const InvoiceDetail = page(() => import('./pages/billing/InvoiceDetail.tsx'))
const InvoiceNew = page(() => import('./pages/billing/InvoiceNew.tsx'))
const Payments = page(() => import('./pages/billing/Payments.tsx'))
const Disputes = page(() => import('./pages/billing/Disputes.tsx'))
const Plans = page(() => import('./pages/billing/Plans.tsx'))
const Coupons = page(() => import('./pages/billing/Coupons.tsx'))
const Settings = page(() => import('./pages/Settings.tsx'))
const Screens = page(() => import('./pages/Screens.tsx'))
const NotFound = page(() => import('./pages/NotFound.tsx'))

// Customers, alerts, team, settings, errors (Tahap 2)
const Segments = page(() => import('./pages/customers/Segments.tsx'))
const SegmentBuilder = page(() => import('./pages/customers/SegmentBuilder.tsx'))
const CustomerImport = page(() => import('./pages/customers/CustomerImport.tsx'))
const CustomerEdit = page(() => import('./pages/customers/CustomerEdit.tsx'))
const AtRisk = page(() => import('./pages/customers/AtRisk.tsx'))
const AlertRules = page(() => import('./pages/alerts/AlertRules.tsx'))
const AlertEditor = page(() => import('./pages/alerts/AlertEditor.tsx'))
const Notifications = page(() => import('./pages/alerts/Notifications.tsx'))
const Inbox = page(() => import('./pages/alerts/Inbox.tsx'))
const Team = page(() => import('./pages/team/Team.tsx'))
const Roles = page(() => import('./pages/team/Roles.tsx'))
const AuditLog = page(() => import('./pages/team/AuditLog.tsx'))
const SettingsSecurity = page(() => import('./pages/settings/Security.tsx'))
const SettingsBilling = page(() => import('./pages/settings/Billing.tsx'))
const SettingsIntegrations = page(() => import('./pages/settings/Integrations.tsx'))
const SettingsApiKeys = page(() => import('./pages/settings/ApiKeys.tsx'))
const SettingsWebhooks = page(() => import('./pages/settings/Webhooks.tsx'))
const SettingsData = page(() => import('./pages/settings/DataPrivacy.tsx'))
const Forbidden = page(() => import('./pages/errors/Forbidden.tsx'))
const ServerError = page(() => import('./pages/errors/ServerError.tsx'))

// UI kit
const UiButtons = page(() => import('./pages/ui/UiButtons.tsx'))
const UiForms = page(() => import('./pages/ui/UiForms.tsx'))
const UiTables = page(() => import('./pages/ui/UiTables.tsx'))
const UiCharts = page(() => import('./pages/ui/UiCharts.tsx'))
const UiOverlays = page(() => import('./pages/ui/UiOverlays.tsx'))
const UiStates = page(() => import('./pages/ui/UiStates.tsx'))

/*
  Routes. SaaSDrop's "Sign in" and "Get started" buttons link to /login and /signup.
  The full list with descriptions is on the "All screens" page (/screens).
*/
export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="new-password" element={<NewPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="two-factor" element={<TwoFactor />} />
        <Route path="invite" element={<AcceptInvite />} />
      </Route>
      <Route path="onboarding" element={<OnboardingLayout />}>
        <Route path="workspace" element={<OnboardingWorkspace />} />
        <Route path="billing" element={<OnboardingBilling />} />
        <Route path="team" element={<OnboardingTeam />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports/mrr" element={<ReportMrr />} />
        <Route path="reports/churn" element={<ReportChurn />} />
        <Route path="reports/cohorts" element={<ReportCohorts />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/import" element={<CustomerImport />} />
        <Route path="customers/at-risk" element={<AtRisk />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="customers/:id/edit" element={<CustomerEdit />} />
        <Route path="segments" element={<Segments />} />
        <Route path="segments/new" element={<SegmentBuilder />} />
        <Route path="segments/:id" element={<SegmentBuilder />} />
        <Route path="alerts" element={<AlertRules />} />
        <Route path="alerts/new" element={<AlertEditor />} />
        <Route path="alerts/:id" element={<AlertEditor />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="team" element={<Team />} />
        <Route path="team/roles" element={<Roles />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="settings/security" element={<SettingsSecurity />} />
        <Route path="settings/billing" element={<SettingsBilling />} />
        <Route path="settings/integrations" element={<SettingsIntegrations />} />
        <Route path="settings/api-keys" element={<SettingsApiKeys />} />
        <Route path="settings/webhooks" element={<SettingsWebhooks />} />
        <Route path="settings/data" element={<SettingsData />} />
        <Route path="403" element={<Forbidden />} />
        <Route path="500" element={<ServerError />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceNew />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="plans" element={<Plans />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="settings" element={<Settings />} />
        <Route path="screens" element={<Screens />} />
        <Route path="ui/buttons" element={<UiButtons />} />
        <Route path="ui/forms" element={<UiForms />} />
        <Route path="ui/tables" element={<UiTables />} />
        <Route path="ui/charts" element={<UiCharts />} />
        <Route path="ui/overlays" element={<UiOverlays />} />
        <Route path="ui/states" element={<UiStates />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
