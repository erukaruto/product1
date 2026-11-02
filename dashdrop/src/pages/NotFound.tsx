import { Link } from 'react-router'
import { usePageTitle } from '../lib/hooks.ts'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="not-found">
      <span className="code">404</span>
      <h1>Page not found</h1>
      <p>This page doesn't exist in the app. Check the address, or go back to the overview.</p>
      <div className="row-actions">
        <Link className="btn btn-primary" to="/">
          Go to overview
        </Link>
        <Link className="btn btn-secondary" to="/screens">
          See all screens
        </Link>
      </div>
    </div>
  )
}
