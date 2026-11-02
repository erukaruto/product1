import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

const LENGTH = 6

/* UI only: any 6 digits are accepted. */
export default function TwoFactor() {
  usePageTitle('Two-factor authentication')
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [useRecovery, setUseRecovery] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((d, i) => (i === index ? digit : d)))
    setError('')
    if (digit && index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!pasted) return
    event.preventDefault()
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ''))
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (useRecovery) {
      const code = new FormData(event.currentTarget).get('recovery')?.toString().trim() ?? ''
      if (code.length < 8) return setError('Recovery codes are 10 characters, for example 4F7K-2M9Q.')
    } else if (digits.join('').length < LENGTH) {
      return setError('Enter all 6 digits.')
    }
    navigate('/')
  }

  return (
    <>
      <div className="auth-head">
        <span className="auth-icon">
          <Icon name="shield" />
        </span>
        <h1>Two-factor authentication</h1>
        <p>{useRecovery ? 'Enter one of the recovery codes you saved when you set up two-factor.' : 'Enter the 6-digit code from your authenticator app.'}</p>
      </div>
      <form className="stack" onSubmit={onSubmit} noValidate>
        {useRecovery ? (
          <div className="field">
            <label htmlFor="recovery">Recovery code</label>
            <input className="input" id="recovery" name="recovery" autoComplete="one-time-code" aria-invalid={Boolean(error)} aria-describedby="code-error" />
          </div>
        ) : (
          <fieldset className="otp" aria-describedby="code-error">
            <legend className="sr-only">Verification code</legend>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element
                }}
                className="input otp-input"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                aria-label={`Digit ${index + 1}`}
                value={digit}
                aria-invalid={Boolean(error)}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                onPaste={onPaste}
              />
            ))}
          </fieldset>
        )}
        {error && (
          <span id="code-error" className="field-error" role="alert">
            {error}
          </span>
        )}
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Verify
        </button>
      </form>
      <p className="auth-alt">
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setUseRecovery((value) => !value)
            setError('')
          }}
        >
          {useRecovery ? 'Use your authenticator app' : 'Use a recovery code'}
        </button>
        {' · '}
        <Link className="text-link" to="/login">
          Back to sign in
        </Link>
      </p>
    </>
  )
}
