import { Link } from 'react-router'
import { usePageTitle } from '../../lib/hooks.ts'

/* Show this when a request fails on the server. Reference IDs help support find the error. */
export default function ServerError() {
  usePageTitle('Something went wrong')
  return (
    <div className="not-found">
      <span className="code">500</span>
      <h1>Something went wrong on our side</h1>
      <p>Your data is safe. Try again in a minute. If it keeps happening, contact support with reference ERR-7Q2M.</p>
      <div className="row-actions">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
        <Link className="btn btn-secondary" to="/">
          Go to overview
        </Link>
      </div>
    </div>
  )
}
