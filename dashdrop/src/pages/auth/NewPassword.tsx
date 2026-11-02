import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Progress, useToast } from '../../components/ui.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

/** 0-4: one point each for length 8+, length 12+, mixed case, a number or symbol. */
function strength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9\W]/.test(password)) score++
  return score
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const TONES = ['bad', 'bad', 'warn', 'good', 'good'] as const

/* UI only: the new password is not saved anywhere. */
export default function NewPassword() {
  usePageTitle('Choose a new password')
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const score = strength(password)
  const mismatch = confirm.length > 0 && confirm !== password
  const tooShort = password.length < 8

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (tooShort || password !== confirm) return
    toast({ title: 'Password updated', description: 'Sign in with your new password.' })
    navigate('/login')
  }

  return (
    <>
      <div className="auth-head">
        <h1>Choose a new password</h1>
        <p>Use at least 8 characters. A longer password with a mix of characters is stronger.</p>
      </div>
      <form className="stack" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="password-new">New password</label>
          <input
            className="input"
            id="password-new"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={submitted && tooShort}
            aria-describedby="strength-label"
          />
          <Progress value={score} max={4} label="Password strength" tone={TONES[score]} />
          <span id="strength-label" className={submitted && tooShort ? 'field-error' : 'field-hint'}>
            Strength: {password ? LABELS[score] : 'not set'}
          </span>
        </div>
        <div className="field">
          <label htmlFor="password-confirm">Confirm password</label>
          <input
            className="input"
            id="password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-invalid={mismatch || (submitted && confirm !== password)}
            aria-describedby="confirm-error"
          />
          {(mismatch || (submitted && confirm !== password)) && (
            <span id="confirm-error" className="field-error">
              The passwords don't match.
            </span>
          )}
        </div>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Update password
        </button>
      </form>
    </>
  )
}
