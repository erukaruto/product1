import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import Logo from './Logo.tsx'
import ThemeSwitch from './ThemeSwitch.tsx'
import Icon from './Icon.tsx'
import { Skeleton, Stepper } from './ui.tsx'
import { SITE_URL } from '../lib/config.ts'

function AuthFallback() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      <Skeleton width={200} height={26} />
      <Skeleton />
      <Skeleton height={40} />
      <Skeleton height={40} />
    </div>
  )
}

/** Sign-in, sign-up and related screens. */
export default function AuthLayout() {
  return (
    <div className="auth">
      <header className="auth-top">
        <a href={SITE_URL} aria-label="Beacon website">
          <Logo />
        </a>
        <div className="auth-top-actions">
          <ThemeSwitch />
          <a className="btn btn-ghost auth-back" href={SITE_URL}>
            <Icon name="arrowLeft" size={16} />
            Back to site
          </a>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <Suspense fallback={<AuthFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <footer className="auth-foot">Demo app. Beacon is a fictional company.</footer>
    </div>
  )
}

export const ONBOARDING_STEPS = [
  { path: '/onboarding/workspace', label: 'Workspace' },
  { path: '/onboarding/billing', label: 'Billing data' },
  { path: '/onboarding/team', label: 'Team' },
]

/** First-run setup: three steps with a progress indicator. */
export function OnboardingLayout() {
  const { pathname } = useLocation()
  const current = Math.max(0, ONBOARDING_STEPS.findIndex((step) => step.path === pathname))
  return (
    <div className="auth onboarding">
      <header className="auth-top">
        <Logo />
        <div className="auth-top-actions">
          <ThemeSwitch />
          <Link className="btn btn-ghost" to="/getting-started">
            Skip setup
          </Link>
        </div>
      </header>
      <main className="auth-main">
        <div className="onboarding-shell">
          <p className="muted onboarding-count">
            Step {current + 1} of {ONBOARDING_STEPS.length}
          </p>
          <Stepper steps={ONBOARDING_STEPS.map((step) => step.label)} current={current} />
          <div className="auth-card onboarding-card">
            <Suspense fallback={<AuthFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
