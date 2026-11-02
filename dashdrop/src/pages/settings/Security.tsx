import { useState } from 'react'
import { Card, Modal, StatusBadge, Switch, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import { sessions as initial } from '../../data/workspace.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const RECOVERY = ['4F7K-2M9Q', '8XRP-L3TD', 'Q2NC-7VWA', 'H6ZB-K9EM', 'T3YJ-5PRF', 'W8GD-1UXS']

/* UI only: nothing is changed on a server. */
export default function Security() {
  usePageTitle('Security')
  const toast = useToast()
  const [twoFactor, setTwoFactor] = useState(true)
  const [showCodes, setShowCodes] = useState(false)
  const [sessions, setSessions] = useState(initial)
  const [requireTeam, setRequireTeam] = useState(false)

  return (
    <SettingsShell title="Security" description="Password, two-factor authentication and active sessions.">
      <div className="stack-lg">
        <Card title="Password" description="Last changed Aug 14, 2026.">
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault()
              toast({ title: 'Password updated' })
              e.currentTarget.reset()
            }}
          >
            <div className="field">
              <label htmlFor="pw-current">Current password</label>
              <input className="input" id="pw-current" type="password" autoComplete="current-password" required />
            </div>
            <div className="field">
              <label htmlFor="pw-next">New password</label>
              <input className="input" id="pw-next" type="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Update password
              </button>
            </div>
          </form>
        </Card>

        <Card title="Two-factor authentication" description="A code from an authenticator app when you sign in." actions={<StatusBadge tone={twoFactor ? 'good' : 'warn'} label={twoFactor ? 'On' : 'Off'} />}>
          <div className="switch-row">
            <span id="tf-label">Require a code at sign-in</span>
            <Switch
              checked={twoFactor}
              labelledBy="tf-label"
              onChange={(on) => {
                setTwoFactor(on)
                toast({ title: on ? 'Two-factor turned on' : 'Two-factor turned off', tone: on ? 'good' : 'bad' })
              }}
            />
          </div>
          <div className="switch-row top-gap">
            <span id="team-2fa-label">Require two-factor for everyone in Beacon HQ</span>
            <Switch checked={requireTeam} labelledBy="team-2fa-label" onChange={setRequireTeam} />
          </div>
          <div className="row-actions top-gap">
            <button type="button" className="btn btn-secondary" disabled={!twoFactor} onClick={() => setShowCodes(true)}>
              View recovery codes
            </button>
          </div>
        </Card>

        <Card title="Active sessions" description="Sign out anywhere you don't recognize." flush>
          <ul className="members">
            {sessions.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.device}</strong>
                  <small>
                    {s.location} · {s.lastActive}
                  </small>
                </div>
                {s.current ? (
                  <StatusBadge tone="good" label="This device" />
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSessions((list) => list.filter((x) => x.id !== s.id))
                      toast({ title: `Signed out of ${s.device}` })
                    }}
                  >
                    Sign out
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal open={showCodes} onClose={() => setShowCodes(false)} title="Recovery codes" description="Each code works once. Keep them somewhere safe, outside Beacon.">
        <ul className="code-grid">
          {RECOVERY.map((code) => (
            <li key={code} className="code-chip">
              {code}
            </li>
          ))}
        </ul>
        <div className="modal-actions top-gap">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              navigator.clipboard?.writeText(RECOVERY.join('\n')).catch(() => {})
              toast({ title: 'Codes copied' })
            }}
          >
            Copy codes
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowCodes(false)}>
            Done
          </button>
        </div>
      </Modal>
    </SettingsShell>
  )
}
