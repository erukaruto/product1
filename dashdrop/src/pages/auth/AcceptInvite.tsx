import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Avatar, useToast } from '../../components/ui.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: shown to someone who opens an invitation email. */
export default function AcceptInvite() {
  usePageTitle('Join Beacon HQ')
  const navigate = useNavigate()
  const toast = useToast()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast({ title: 'Welcome to Beacon HQ', description: 'You joined as a viewer.' })
    navigate('/getting-started')
  }

  return (
    <>
      <div className="invite-card">
        <Avatar name="Daniel Kwame" size={40} tone="gold" />
        <p>
          <strong>Daniel Kwame</strong> invited you to join <strong>Beacon HQ</strong> as a <strong>Viewer</strong>.
        </p>
      </div>
      <div className="auth-head">
        <h1>Accept your invitation</h1>
        <p>Create your login to see the workspace's revenue reports.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="invite-email">Email</label>
          <input className="input" id="invite-email" type="email" value="sam@beacon.example" readOnly />
        </div>
        <div className="field">
          <label htmlFor="invite-name">Full name</label>
          <input className="input" id="invite-name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="invite-password">Password</label>
          <input className="input" id="invite-password" type="password" autoComplete="new-password" minLength={8} required />
          <span className="field-hint">At least 8 characters.</span>
        </div>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Join workspace
        </button>
      </form>
    </>
  )
}
