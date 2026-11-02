import { useState } from 'react'
import { Card, Modal, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

const EXPORTS = ['Customers', 'Subscriptions', 'Invoices', 'Payments', 'Reports', 'Audit log']
const WORKSPACE = 'Beacon HQ'

/* UI only: no export is generated and nothing is deleted. */
export default function DataPrivacy() {
  usePageTitle('Data & privacy')
  const toast = useToast()
  const [selected, setSelected] = useState<string[]>(EXPORTS)
  const [retention, setRetention] = useState('24')
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState('')

  return (
    <SettingsShell title="Data & privacy" description="Export your data, choose how long it's kept, or delete the workspace.">
      <div className="stack-lg">
        <Card title="Export data" description="A ZIP of CSV files, emailed to you when ready.">
          <fieldset className="field">
            <legend className="sr-only">Tables to export</legend>
            <div className="check-grid">
              {EXPORTS.map((item) => (
                <label key={item} className="check">
                  <input type="checkbox" checked={selected.includes(item)} onChange={() => setSelected((list) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]))} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="row-actions top-gap">
            <button type="button" className="btn btn-primary" disabled={selected.length === 0} onClick={() => toast({ title: 'Export started', description: `${selected.length} tables. We'll email lena@beacon.example.` })}>
              <Icon name="download" size={16} />
              Export {selected.length} {selected.length === 1 ? 'table' : 'tables'}
            </button>
          </div>
        </Card>
        <Card title="Data retention" description="Older raw events are deleted. Monthly totals are kept.">
          <div className="field narrow-field">
            <label htmlFor="retention">Keep raw events for</label>
            <select
              className="input"
              id="retention"
              value={retention}
              onChange={(e) => {
                setRetention(e.target.value)
                toast({ title: 'Retention updated' })
              }}
            >
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
            </select>
          </div>
        </Card>
        <Card title="Delete workspace" description="Deletes all data in Beacon HQ for everyone. This can't be undone." className="danger-card">
          <button type="button" className="btn btn-danger" onClick={() => setDeleting(true)}>
            Delete workspace
          </button>
        </Card>
      </div>
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        size="sm"
        title="Delete Beacon HQ?"
        description={`All 8 members lose access and every report is deleted. Type ${WORKSPACE} to confirm.`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setDeleting(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={confirm !== WORKSPACE}
              onClick={() => {
                setDeleting(false)
                setConfirm('')
                toast({ title: 'Nothing was deleted', description: 'This is the demo workspace.', tone: 'info' })
              }}
            >
              Delete workspace
            </button>
          </>
        }
      >
        <label className="sr-only" htmlFor="confirm-ws">
          Workspace name
        </label>
        <input className="input" id="confirm-ws" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
      </Modal>
    </SettingsShell>
  )
}
