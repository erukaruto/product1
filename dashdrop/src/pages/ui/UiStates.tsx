import { useState } from 'react'
import { Link } from 'react-router'
import { Card, EmptyState, PageHeader, Skeleton, Stepper } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

export default function UiStates() {
  usePageTitle('States')
  const [step, setStep] = useState(1)
  const steps = ['Account', 'Billing data', 'Team', 'Done']

  return (
    <>
      <PageHeader title="States" description="Empty, loading, error and progress states. Use them so no screen is ever blank." />

      <div className="grid grid-3">
        <Card title="Empty">
          <EmptyState title="No invoices yet" icon="invoices" action={<Link className="btn btn-primary btn-sm" to="/invoices/new">Create invoice</Link>}>
            Invoices appear here after the first billing run.
          </EmptyState>
        </Card>
        <Card title="No results">
          <EmptyState title="No customers match" icon="search">
            Try a different search term or clear the filters.
          </EmptyState>
        </Card>
        <Card title="Error">
          <div className="empty">
            <span className="empty-icon tone-bad">
              <Icon name="warning" />
            </span>
            <strong>Couldn't load this report</strong>
            <p>The connection timed out. Your data is safe.</p>
            <button type="button" className="btn btn-secondary btn-sm">
              <Icon name="refresh" size={16} />
              Try again
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Loading skeleton" description="Shown while a page's code or data loads">
          <div className="stack">
            <Skeleton width="40%" height={20} />
            <Skeleton />
            <Skeleton width="85%" />
            <div className="skeleton-row">
              <Skeleton width={36} height={36} radius={18} />
              <div className="stack tight grow">
                <Skeleton width="60%" />
                <Skeleton width="35%" />
              </div>
            </div>
          </div>
        </Card>
        <Card title="No permission">
          <div className="empty">
            <span className="empty-icon">
              <Icon name="lock" />
            </span>
            <strong>Only admins can see billing settings</strong>
            <p>Ask an owner or admin in Beacon HQ to change your role.</p>
          </div>
        </Card>
      </div>

      <Card title="Stepper" description="Progress through a multi-step flow">
        <Stepper steps={steps} current={step} />
        <div className="demo-row">
          <button type="button" className="btn btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          <button type="button" className="btn btn-primary" disabled={step === steps.length - 1} onClick={() => setStep((s) => s + 1)}>
            Next step
          </button>
        </div>
      </Card>

      <Card title="Inline status messages">
        <div className="stack">
          <p className="inline-status good">
            <Icon name="checkCircle" size={18} /> Connected. Importing 2 years of history.
          </p>
          <p className="inline-status warn">
            <Icon name="warning" size={18} /> 3 invoices could not be matched to a customer.
          </p>
          <p className="inline-status bad">
            <Icon name="xCircle" size={18} /> The billing connection expired. Reconnect to keep data up to date.
          </p>
        </div>
      </Card>
    </>
  )
}
