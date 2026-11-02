import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Avatar, Card, PageHeader, Segmented, StatusBadge, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { matchSegment, OPERATOR_LABELS, SEGMENT_FIELDS, segments, type SegmentField, type SegmentOperator, type SegmentRule } from '../../data/workspace.ts'
import { STATUS_LABELS } from '../../data/customers.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

interface EditableRule extends SegmentRule {
  key: number
}

const operatorsFor = (field: SegmentField): SegmentOperator[] => (SEGMENT_FIELDS[field].numeric ? ['greater_than', 'less_than', 'is'] : ['is', 'is_not'])

/* Rule builder with a live preview of matching customers. UI only: saving shows a toast. */
export default function SegmentBuilder() {
  const { id } = useParams()
  const existing = segments.find((s) => s.id === id)
  usePageTitle(existing ? existing.name : 'New segment')
  const navigate = useNavigate()
  const toast = useToast()
  const [name, setName] = useState(existing?.name ?? '')
  const [match, setMatch] = useState<'all' | 'any'>(existing?.match ?? 'all')
  const [rules, setRules] = useState<EditableRule[]>(() =>
    (existing?.rules ?? [{ field: 'plan', operator: 'is', value: 'Growth' }]).map((rule, key) => ({ ...rule, key }))
  )
  const [nameError, setNameError] = useState(false)

  const preview = useMemo(() => matchSegment(rules, match), [rules, match])
  const mrr = preview.reduce((sum, c) => sum + c.mrr, 0)

  const update = (key: number, patch: Partial<SegmentRule>) =>
    setRules((list) =>
      list.map((rule) => {
        if (rule.key !== key) return rule
        const next = { ...rule, ...patch }
        if (patch.field) {
          next.operator = operatorsFor(patch.field)[0]
          next.value = SEGMENT_FIELDS[patch.field].options?.[0] ?? (SEGMENT_FIELDS[patch.field].numeric ? '0' : '')
        }
        return next
      })
    )

  function save() {
    if (!name.trim()) {
      setNameError(true)
      document.getElementById('seg-name')?.focus()
      return
    }
    toast({ title: `Segment "${name.trim()}" saved`, description: `${preview.length} customers match.` })
    navigate('/segments')
  }

  return (
    <>
      <PageHeader
        back={
          <Link className="back-link" to="/segments">
            <Icon name="arrowLeft" size={16} />
            Segments
          </Link>
        }
        title={existing ? existing.name : 'New segment'}
        description="Combine rules to group customers. The preview updates as you edit."
        actions={
          <button type="button" className="btn btn-primary" onClick={save}>
            Save segment
          </button>
        }
      />
      <div className="grid grid-main">
        <Card title="Rules">
          <div className="stack">
            <div className="field">
              <label htmlFor="seg-name">Segment name</label>
              <input
                className="input"
                id="seg-name"
                value={name}
                placeholder="For example: Scale accounts in Europe"
                aria-invalid={nameError}
                aria-describedby="seg-name-error"
                onChange={(event) => {
                  setName(event.target.value)
                  setNameError(false)
                }}
              />
              {nameError && (
                <span id="seg-name-error" className="field-error">
                  Give the segment a name.
                </span>
              )}
            </div>
            <div className="match-row">
              <span>Customers matching</span>
              <Segmented<'all' | 'any'>
                label="Match"
                value={match}
                onChange={setMatch}
                options={[
                  { id: 'all', label: 'all rules' },
                  { id: 'any', label: 'any rule' },
                ]}
              />
            </div>
            {rules.map((rule, index) => {
              const field = SEGMENT_FIELDS[rule.field]
              return (
                <div key={rule.key} className="rule-row">
                  <select className="input" aria-label={`Field, rule ${index + 1}`} value={rule.field} onChange={(event) => update(rule.key, { field: event.target.value as SegmentField })}>
                    {Object.entries(SEGMENT_FIELDS).map(([id, f]) => (
                      <option key={id} value={id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select className="input" aria-label={`Condition, rule ${index + 1}`} value={rule.operator} onChange={(event) => update(rule.key, { operator: event.target.value as SegmentOperator })}>
                    {operatorsFor(rule.field).map((op) => (
                      <option key={op} value={op}>
                        {OPERATOR_LABELS[op]}
                      </option>
                    ))}
                  </select>
                  {field.options ? (
                    <select className="input" aria-label={`Value, rule ${index + 1}`} value={rule.value} onChange={(event) => update(rule.key, { value: event.target.value })}>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {rule.field === 'status' ? STATUS_LABELS[option as keyof typeof STATUS_LABELS] : option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      aria-label={`Value, rule ${index + 1}`}
                      type={field.numeric ? 'number' : 'text'}
                      value={rule.value}
                      onChange={(event) => update(rule.key, { value: event.target.value })}
                    />
                  )}
                  <button type="button" className="icon-button" disabled={rules.length === 1} onClick={() => setRules((list) => list.filter((r) => r.key !== rule.key))}>
                    <Icon name="trash" size={16} />
                    <span className="sr-only">Remove rule {index + 1}</span>
                  </button>
                </div>
              )
            })}
            <button
              type="button"
              className="btn btn-ghost add-row"
              onClick={() => setRules((list) => [...list, { key: Math.max(...list.map((r) => r.key)) + 1, field: 'status', operator: 'is', value: 'active' }])}
            >
              <Icon name="plus" size={16} />
              Add rule
            </button>
          </div>
        </Card>
        <Card title="Preview" description={`${preview.length} customers, ${formatMoney(mrr)} MRR`} flush>
          <ul className="preview-list" aria-live="polite">
            {preview.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Avatar name={c.company} size={28} />
                <span>
                  <strong>{c.company}</strong>
                  <small>
                    {c.plan} · {c.country}
                  </small>
                </span>
                <StatusBadge status={c.status} label={STATUS_LABELS[c.status]} />
              </li>
            ))}
            {preview.length === 0 && <li className="muted">No customers match these rules.</li>}
          </ul>
          {preview.length > 8 && <p className="muted small preview-more">and {preview.length - 8} more</p>}
        </Card>
      </div>
    </>
  )
}
