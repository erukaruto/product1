import { useState } from 'react'
import { Card, Dropdown, KeyValue, Modal, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

export default function UiOverlays() {
  usePageTitle('Overlays')
  const toast = useToast()
  const [modal, setModal] = useState<'basic' | 'confirm' | 'form' | 'drawer' | null>(null)
  const close = () => setModal(null)

  return (
    <>
      <PageHeader title="Overlays" description="Modals trap focus, close on Escape or a click outside, and return focus to the button that opened them." />

      <div className="grid grid-2">
        <Card title="Modals and drawer">
          <div className="demo-row">
            <button type="button" className="btn btn-secondary" onClick={() => setModal('basic')}>
              Open modal
            </button>
            <button type="button" className="btn btn-danger-ghost" onClick={() => setModal('confirm')}>
              Confirm dialog
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setModal('form')}>
              Modal with form
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setModal('drawer')}>
              Open drawer
            </button>
          </div>
        </Card>
        <Card title="Toasts">
          <div className="demo-row">
            <button type="button" className="btn btn-secondary" onClick={() => toast({ title: 'Changes saved' })}>
              Success
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => toast({ title: 'Payment failed', description: 'Card declined. Retrying tomorrow.', tone: 'bad' })}>
              Error
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => toast({ title: 'Import running', description: 'This can take a few minutes.', tone: 'info' })}>
              Info
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Dropdown menu" description="Arrow keys move between items">
          <div className="demo-row">
            <Dropdown
              label="Row actions"
              items={[
                { label: 'Edit', icon: 'edit', onSelect: () => toast({ title: 'Edit selected' }) },
                { label: 'Duplicate', icon: 'copy', onSelect: () => toast({ title: 'Duplicated' }) },
                { label: 'Disabled item', icon: 'lock', disabled: true, onSelect: () => {} },
                { label: 'Delete', icon: 'trash', danger: true, onSelect: () => toast({ title: 'Deleted', tone: 'bad' }) },
              ]}
            />
            <Dropdown
              label="Export options"
              align="start"
              buttonClassName="btn btn-secondary"
              trigger={
                <>
                  <Icon name="download" size={16} />
                  Export
                  <Icon name="chevronDown" size={16} />
                </>
              }
              items={[
                { label: 'CSV', onSelect: () => toast({ title: 'CSV export started' }) },
                { label: 'PDF', onSelect: () => toast({ title: 'PDF export started' }) },
              ]}
            />
          </div>
        </Card>
        <Card title="Tooltip" description="CSS only, shown on hover and keyboard focus">
          <div className="demo-row">
            <button type="button" className="btn btn-secondary has-tooltip" data-tooltip="Monthly recurring revenue">
              What is MRR?
            </button>
            <span className="has-tooltip" data-tooltip="Average revenue per account" tabIndex={0}>
              <Icon name="info" />
            </span>
          </div>
        </Card>
      </div>

      <Modal open={modal === 'basic'} onClose={close} title="Import finished" description="Your billing history is ready." footer={<button type="button" className="btn btn-primary" onClick={close}>Got it</button>}>
        <p className="muted">Beacon imported 1,284 customers and 14,920 invoices. Reports now show the last 24 months.</p>
      </Modal>

      <Modal
        open={modal === 'confirm'}
        onClose={close}
        size="sm"
        title="Delete this report?"
        description="Saved filters and the share link stop working. This can't be undone."
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                close()
                toast({ title: 'Report deleted', tone: 'info' })
              }}
            >
              Delete report
            </button>
          </>
        }
      />

      <Modal open={modal === 'form'} onClose={close} title="Invite a teammate">
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault()
            close()
            toast({ title: 'Invite sent' })
          }}
        >
          <div className="field">
            <label htmlFor="modal-email">Email</label>
            <input className="input" id="modal-email" type="email" required placeholder="name@company.example" />
          </div>
          <div className="field">
            <label htmlFor="modal-role">Role</label>
            <select className="input" id="modal-role" defaultValue="Viewer">
              <option>Admin</option>
              <option>Viewer</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send invite
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'drawer'} onClose={close} drawer title="Copperline" description="Growth plan, past due">
        <KeyValue
          items={[
            { label: 'Contact', value: 'Grace Liu' },
            { label: 'MRR', value: '$49' },
            { label: 'Last payment', value: 'Failed, Oct 29' },
            { label: 'Customer since', value: 'Mar 2026' },
          ]}
        />
        <div className="stack drawer-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={() => toast({ title: 'Retry scheduled' })}>
            Retry payment
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={close}>
            Close
          </button>
        </div>
      </Modal>
    </>
  )
}
