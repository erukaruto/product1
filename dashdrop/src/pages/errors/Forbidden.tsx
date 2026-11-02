import { Link } from 'react-router'
import { usePageTitle } from '../../lib/hooks.ts'

/* Show this when a signed-in user opens a page their role can't see. */
export default function Forbidden() {
  usePageTitle('No access')
  return (
    <div className="not-found">
      <span className="code">403</span>
      <h1>You don't have access to this page</h1>
      <p>Your role in Beacon HQ is Viewer. Ask an owner or admin to change your role if you need this page.</p>
      <div className="row-actions">
        <Link className="btn btn-primary" to="/">
          Go to overview
        </Link>
        <Link className="btn btn-secondary" to="/team/roles">
          See what each role can do
        </Link>
      </div>
    </div>
  )
}
