import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Card, EmptyState, Modal, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { getCustomer } from '../../data/customers.ts'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: changes are not saved. */
export default function CustomerEdit() {
  const { id } = useParams()
  const customer = getCustomer(id)
  usePageTitle(customer ? `Edit ${customer.company}` : 'Customer not found')
  const navigate = useNavigate()
  const toast = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  if (!customer) {
    return (
      <>
        <PageHeader title="Customer not found" />
        <Card>
          <EmptyState title={`No customer with the ID "${id}"`} />
        </Card>
      </>
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next: Record<string, string> = {}
    if (!String(data.get('company')).trim()) next.company = 'Enter the company name.'
    if (!/^\S+@\S+\.\S+$/.test(String(data.get('email')))) next.email = 'Enter a valid email address.'
    setErrors(next)
    if (Object.keys(next).length) return
    toast({ title: 'Customer saved' })
    navigate(`/customers/${customer!.id}`)
  }

  return (
    <>
      <PageHeader
        back={
          <Link className="back-link" to={`/customers/${customer.id}`}>
            <Icon name="arrowLeft" size={16} />
            {customer.company}
          </Link>
        }
        title={`Edit ${customer.company}`}
        description="Details shown in reports and on invoices."
      />
      <div className="stack-lg narrow">
        <Card title="Details">
          <form className="form-grid" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="ce-company">Company</label>
              <input className="input" id="ce-company" name="company" defaultValue={customer.company} aria-invalid={Boolean(errors.company)} aria-describedby="ce-company-error" />
              {errors.company && (
                <span id="ce-company-error" className="field-error">
                  {errors.company}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="ce-contact">Billing contact</label>
              <input className="input" id="ce-contact" name="contact" defaultValue={customer.name} />
            </div>
            <div className="field">
              <label htmlFor="ce-email">Billing email</label>
              <input className="input" id="ce-email" name="email" type="email" defaultValue={customer.email} aria-invalid={Boolean(errors.email)} aria-describedby="ce-email-error" />
              {errors.email && (
                <span id="ce-email-error" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="ce-country">Country</label>
              <input className="input" id="ce-country" name="country" defaultValue={customer.country} />
            </div>
            <div className="field full">
              <label htmlFor="ce-notes">Internal notes</label>
              <textarea className="input" id="ce-notes" name="notes" rows={3} placeholder="Only your team sees these notes." />
            </div>
            <div className="form-actions">
              <Link className="btn btn-ghost" to={`/customers/${customer.id}`}>
                Cancel
              </Link>
              <button className="btn btn-primary" type="submit">
                Save changes
              </button>
            </div>
          </form>
        </Card>
        <Card title="Delete customer" description="Removes the customer from reports. Invoices stay in your billing provider.">
          <button type="button" className="btn btn-danger-ghost" onClick={() => setDeleting(true)}>
            Delete {customer.company}
          </button>
        </Card>
      </div>
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        size="sm"
        title={`Delete ${customer.company}?`}
        description={`Type ${customer.company} to confirm.`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDeleting(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={confirmText !== customer.company}
              onClick={() => {
                setDeleting(false)
                toast({ title: `${customer.company} deleted`, tone: 'info' })
                navigate('/customers')
              }}
            >
              Delete customer
            </button>
          </>
        }
      >
        <label className="sr-only" htmlFor="confirm-delete">
          Company name
        </label>
        <input className="input" id="confirm-delete" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} autoComplete="off" />
      </Modal>
    </>
  )
}
