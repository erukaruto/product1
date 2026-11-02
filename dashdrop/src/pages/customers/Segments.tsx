import { Link } from 'react-router'
import { Card, PageHeader } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { matchSegment, OPERATOR_LABELS, SEGMENT_FIELDS, segments, type SegmentRule } from '../../data/workspace.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export function describeRule(rule: SegmentRule): string {
  const field = SEGMENT_FIELDS[rule.field]
  const value = rule.field === 'status' ? rule.value.replace('_', ' ') : rule.field === 'mrr' ? `$${rule.value}` : rule.value
  return `${field.label} ${OPERATOR_LABELS[rule.operator]} ${value}`
}

export default function Segments() {
  usePageTitle('Segments')
  return (
    <>
      <PageHeader
        title="Segments"
        description="Saved groups of customers. Counts update as your data changes."
        actions={
          <Link className="btn btn-primary" to="/segments/new">
            <Icon name="plus" size={16} />
            New segment
          </Link>
        }
      />
      <div className="segment-grid">
        {segments.map((segment) => {
          const members = matchSegment(segment.rules, segment.match)
          const mrr = members.reduce((sum, c) => sum + c.mrr, 0)
          return (
            <Card key={segment.id} title={segment.name} description={segment.description}>
              <div className="plan-stats">
                <div>
                  <span className="muted">Customers</span>
                  <strong>{members.length}</strong>
                </div>
                <div>
                  <span className="muted">MRR</span>
                  <strong>{formatMoney(mrr)}</strong>
                </div>
              </div>
              <ul className="rule-chips" aria-label="Rules">
                {segment.rules.map((rule, index) => (
                  <li key={index}>
                    {index > 0 && <span className="muted small">{segment.match === 'all' ? 'and' : 'or'}</span>}
                    <span className="tag-chip">{describeRule(rule)}</span>
                  </li>
                ))}
              </ul>
              <div className="card-foot">
                <span className="muted small">Edited {formatDate(segment.updated)}</span>
                <Link className="text-link" to={`/segments/${segment.id}`}>
                  Open
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
