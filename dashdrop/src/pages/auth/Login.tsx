import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: there is no authentication. Submitting the form opens the overview. Connect it to your auth provider. */
export default function Login() {
  usePageTitle('Sign in')
  const navigate = useNavigate()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/')
  }

  return (
    <>
      <div className="auth-head">
        <h1>Sign in to Beacon</h1>
        <p>Welcome back. Enter your details to continue.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" defaultValue="lena@beacon.example" required />
        </div>
        <div className="field">
          <div className="field-row">
            <label htmlFor="password">Password</label>
            <Link className="text-link small" to="/reset-password">
              Forgot password?
            </Link>
          </div>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" defaultValue="demo-password" required />
        </div>
        <label className="check">
          <input type="checkbox" name="remember" defaultChecked />
          <span>Keep me signed in</span>
        </label>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Sign in
        </button>
        <div className="divider">
          <span>or</span>
        </div>
        <button className="btn btn-secondary btn-block" type="button" onClick={() => navigate('/')}>
          Continue with single sign-on
        </button>
      </form>
      <p className="auth-alt">
        New to Beacon? <Link className="text-link" to="/signup">Create an account</Link>
      </p>
      <p className="demo-note">Demo: any email and password will sign you in.</p>
    </>
  )
}
