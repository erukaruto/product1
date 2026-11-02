import { useState, type FormEvent } from 'react'
import { Avatar, Card, Dropdown, Modal, PageHeader, StatCard, StatusBadge, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { members as initial, type Member, type RoleName } from '../../data/workspace.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const ROLES: RoleName[] = ['Admin', 'Billing', 'Viewer']
const SEATS = 10

/* UI only: invites and role changes update the screen. */
export default function Team() {
  usePageTitle('Team')
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>(initial)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [error, setError] = useState('')
  const without2fa = members.filter((m) => m.status === 'active' && !m.twoFactor).length

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (members.some((m) => m.email === email)) return setError('This person is already in the workspace.')
    if (members.length >= SEATS) return setError('All seats are in use. Remove someone or upgrade the plan.')
    setMembers((list) => [...list, { name: email.split('@')[0], email, role: data.get('role') as RoleName, lastActive: '-', twoFactor: false, status: 'invited' }])
    toast({ title: 'Invite sent', description: email })
    setInviting(false)
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="People who can sign in to Beacon HQ."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setError('')
              setInviting(true)
            }}
          >
            <Icon name="userPlus" size={16} />
            Invite
          </button>
        }
      />
      <div className="stats stats-3">
        <StatCard label="Seats used" value={`${members.length} of ${SEATS}`} note="Growth plan" />
        <StatCard label="Pending invites" value={members.filter((m) => m.status === 'invited').length} />
        <StatCard label="Without two-factor" value={without2fa} note={without2fa ? 'Ask them to turn it on' : 'Everyone is covered'} />
      </div>
      <Card flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Two-factor</th>
                <th scope="col">Last active</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.email}>
                  <td>
                    <span className="person-cell">
                      <Avatar name={m.name} size={32} />
                      <span>
                        <strong>{m.name}</strong>
                        <small>{m.email}</small>
                      </span>
                    </span>
                  </td>
                  <td>{m.status === 'invited' ? <StatusBadge tone="accent" label={`Invited as ${m.role}`} /> : m.role}</td>
                  <td>{m.status === 'invited' ? <span className="muted">-</span> : m.twoFactor ? <StatusBadge tone="good" label="On" /> : <StatusBadge tone="warn" label="Off" />}</td>
                  <td className="muted">{m.lastActive}</td>
                  <td className="num">
                    {m.role !== 'Owner' && (
                      <Dropdown
                        label={`Actions for ${m.name}`}
                        items={[
                          ...ROLES.filter((r) => r !== m.role).map((role) => ({
                            label: `Make ${role}`,
                            icon: 'shield' as const,
                            onSelect: () => {
                              setMembers((list) => list.map((x) => (x.email === m.email ? { ...x, role } : x)))
                              toast({ title: `${m.name} is now ${role}` })
                            },
                          })),
                          ...(m.status === 'invited' ? [{ label: 'Resend invite', icon: 'send' as const, onSelect: () => toast({ title: 'Invite sent again' }) }] : []),
                          { label: 'Remove from workspace', icon: 'trash' as const, danger: true, onSelect: () => setRemoving(m) },
                        ]}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={inviting} onClose={() => setInviting(false)} title="Invite to Beacon HQ" description={`${SEATS - members.length} seats left on the Growth plan.`}>
        <form className="stack" onSubmit={invite} noValidate>
          <div className="field">
            <label htmlFor="inv-email">Email</label>
            <input className="input" id="inv-email" name="email" type="email" placeholder="name@company.example" aria-invalid={Boolean(error)} aria-describedby="inv-error" onChange={() => setError('')} />
            {error && (
              <span id="inv-error" className="field-error">
                {error}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="inv-role">Role</label>
            <select className="input" id="inv-role" name="role" defaultValue="Viewer">
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setInviting(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send invite
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={removing != null}
        onClose={() => setRemoving(null)}
        size="sm"
        title={`Remove ${removing?.name}?`}
        description="They lose access right away. Their exports and comments stay."
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setMembers((list) => list.filter((x) => x.email !== removing?.email))
                toast({ title: `${removing?.name} removed`, tone: 'info' })
                setRemoving(null)
              }}
            >
              Remove
            </button>
          </>
        }
      />
    </>
  )
}
