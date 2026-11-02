import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: no email is sent. */
export default function ResetPassword() {
  usePageTitle('Reset password')
  const [sentTo, setSentTo] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSentTo(new FormData(event.currentTarget).get('email')?.toString() ?? '')
  }

  if (sentTo) {
    return (
      <>
        <div className="auth-head">
          <span className="auth-icon">
            <Icon name="mail" />
          </span>
          <h1>Check your inbox</h1>
          <p>
            If an account exists for <strong>{sentTo}</strong>, you'll get an email with a link to reset your password.
          </p>
        </div>
        <Link className="btn btn-primary btn-block" to="/new-password">
          Open the reset link (demo)
        </Link>
        <Link className="btn btn-secondary btn-block" to="/login">
          Back to sign in
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="auth-head">
        <h1>Reset your password</h1>
        <p>Enter the email you signed up with and we'll send you a reset link.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reset-email">Email</label>
          <input className="input" id="reset-email" name="email" type="email" autoComplete="email" required />
        </div>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Send reset link
        </button>
      </form>
      <p className="auth-alt">
        <Link className="text-link" to="/login">
          Back to sign in
        </Link>
      </p>
    </>
  )
}
