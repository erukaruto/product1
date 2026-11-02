import { useState, type FormEvent } from 'react'
import { Card, Modal, StatusBadge, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import Icon from '../../components/Icon.tsx'
import { apiKeys as initial, type ApiKey } from '../../data/workspace.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatDate } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: keys are made up in the browser and never stored. */
export default function ApiKeys() {
  usePageTitle('API keys')
  const toast = useToast()
  const [keys, setKeys] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<ApiKey | null>(null)

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name')).trim() || 'Untitled key'
    const scope = data.get('scope') === 'write' ? 'write' : 'read'
    const secret = `bk_live_${Array.from({ length: 24 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'[Math.floor(Math.random() * 56)]).join('')}`
    setKeys((list) => [{ id: `key_${list.length + 1}`, name, prefix: secret.slice(0, 12), scope, created: TODAY, lastUsed: null }, ...list])
    setNewKey(secret)
    setCreating(false)
  }

  return (
    <SettingsShell
      title="API keys"
      description="Keys let your own code read Beacon data. Keep them on servers, never in a browser or app."
      actions={
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" size={16} />
          Create key
        </button>
      }
    >
      <Card flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Key</th>
                <th scope="col">Access</th>
                <th scope="col">Created</th>
                <th scope="col">Last used</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="weight-500">{k.name}</td>
                  <td className="mono muted">{k.prefix}...</td>
                  <td>
                    <StatusBadge tone={k.scope === 'write' ? 'warn' : 'neutral'} label={k.scope === 'write' ? 'Read and write' : 'Read only'} />
                  </td>
                  <td className="muted">{formatDate(k.created)}</td>
                  <td className="muted">{k.lastUsed ? formatDate(k.lastUsed) : 'Never'}</td>
                  <td className="num">
                    <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setRevoking(k)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={creating} onClose={() => setCreating(false)} title="Create an API key">
        <form className="stack" onSubmit={create}>
          <div className="field">
            <label htmlFor="key-name">Name</label>
            <input className="input" id="key-name" name="name" placeholder="What will use this key?" required />
          </div>
          <fieldset className="field">
            <legend>Access</legend>
            <div className="choice-row">
              <label className="choice">
                <input type="radio" name="scope" value="read" defaultChecked />
                <span>Read only</span>
              </label>
              <label className="choice">
                <input type="radio" name="scope" value="write" />
                <span>Read and write</span>
              </label>
            </div>
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create key
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={newKey != null} onClose={() => setNewKey(null)} title="Copy your new key" description="This is the only time the full key is shown.">
        <div className="input-group">
          <label className="sr-only" htmlFor="new-key">
            New API key
          </label>
          <input className="input mono" id="new-key" value={newKey ?? ''} readOnly />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              navigator.clipboard?.writeText(newKey ?? '').catch(() => {})
              toast({ title: 'Key copied' })
            }}
          >
            <Icon name="copy" size={16} />
            Copy
          </button>
        </div>
        <div className="modal-actions top-gap">
          <button type="button" className="btn btn-primary" onClick={() => setNewKey(null)}>
            I've saved it
          </button>
        </div>
      </Modal>

      <Modal
        open={revoking != null}
        onClose={() => setRevoking(null)}
        size="sm"
        title={`Revoke "${revoking?.name}"?`}
        description="Requests using this key will fail right away."
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setRevoking(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setKeys((list) => list.filter((k) => k.id !== revoking?.id))
                toast({ title: 'Key revoked', tone: 'info' })
                setRevoking(null)
              }}
            >
              Revoke key
            </button>
          </>
        }
      />
    </SettingsShell>
  )
}
