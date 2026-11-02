import { useState } from 'react'
import { Card, PageHeader, StatusBadge } from '../../components/ui.tsx'
import { releases } from '../../data/reports.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const TONE = { New: 'accent', Improved: 'good', Fixed: 'warn' } as const

/* In-app release notes. "Seen" is kept in this browser only. */
export default function WhatsNew() {
  usePageTitle("What's new")
  const [seen, setSeen] = useState<string | null>(() => {
    try {
      return localStorage.getItem('beacon-seen-release')
    } catch {
      return null
    }
  })
  const latest = releases[0].version
  const unseen = seen !== latest

  function markSeen() {
    try {
      localStorage.setItem('beacon-seen-release', latest)
    } catch {
      /* storage blocked: only this visit */
    }
    setSeen(latest)
  }

  return (
    <>
      <PageHeader
        title="What's new"
        description="Recent changes to Beacon."
        actions={
          <button type="button" className="btn btn-secondary" disabled={!unseen} onClick={markSeen}>
            {unseen ? 'Mark all as seen' : 'All caught up'}
          </button>
        }
      />
      <div className="release-list">
        {releases.map((r, i) => (
          <Card key={r.version}>
            <article className="release">
              <div className="release-meta">
                <span className="mono">{r.version}</span>
                <span className="muted small">{r.date}</span>
                {i === 0 && unseen && <StatusBadge tone="accent" label="Unread" />}
              </div>
              <div>
                <StatusBadge tone={TONE[r.tag]} label={r.tag} />
                <h2>{r.title}</h2>
                <p className="muted">{r.body}</p>
                {r.points.length > 0 && (
                  <ul className="feature-list">
                    {r.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </Card>
        ))}
      </div>
    </>
  )
}
