import { Link, useSearchParams } from 'react-router'
import Icon from '../../components/Icon.tsx'
import { useToast } from '../../components/ui.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: no email is sent. "Open the link" continues to onboarding. */
export default function VerifyEmail() {
  usePageTitle('Verify your email')
  const [params] = useSearchParams()
  const toast = useToast()
  const email = params.get('email') || 'you@company.example'

  return (
    <>
      <div className="auth-head">
        <span className="auth-icon">
          <Icon name="mail" />
        </span>
        <h1>Verify your email</h1>
        <p>
          We sent a link to <strong>{email}</strong>. Open it to confirm your address and set up your workspace.
        </p>
      </div>
      <Link className="btn btn-primary btn-block btn-lg" to="/onboarding/workspace">
        Open the link (demo)
      </Link>
      <div className="auth-alt">
        Didn't get it? Check your spam folder or{' '}
        <button type="button" className="link-button" onClick={() => toast({ title: 'Email sent again', description: `Sent to ${email}.` })}>
          send it again
        </button>
        .
      </div>
      <p className="auth-alt">
        <Link className="text-link" to="/signup">
          Use a different email
        </Link>
      </p>
    </>
  )
}
