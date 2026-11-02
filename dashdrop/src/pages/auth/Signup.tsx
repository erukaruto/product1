import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: no account is created. Submitting the form opens the email verification screen. */
export default function Signup() {
  usePageTitle('Create an account')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const tooShort = password.length > 0 && password.length < 8

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) return
    const email = new FormData(event.currentTarget).get('email')?.toString() ?? ''
    navigate(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  return (
    <>
      <div className="auth-head">
        <h1>Create your account</h1>
        <p>Free for 14 days. No card required.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="work-email">Work email</label>
          <input className="input" id="work-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="new-password">Password</label>
          <input
            className="input"
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={tooShort}
            aria-describedby="password-hint"
            required
          />
          <span id="password-hint" className={tooShort ? 'field-error' : 'field-hint'}>
            At least 8 characters.
          </span>
        </div>
        <label className="check">
          <input type="checkbox" name="terms" required />
          <span>I agree to the terms of service and privacy policy.</span>
        </label>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Create account
        </button>
      </form>
      <p className="auth-alt">
        Already have an account? <Link className="text-link" to="/login">Sign in</Link>
      </p>
    </>
  )
}
