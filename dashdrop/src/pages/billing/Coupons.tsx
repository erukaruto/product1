import { useState, type FormEvent } from 'react'
import { Card, Modal, PageHeader, Progress, StatusBadge, useToast } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import Icon from '../../components/Icon.tsx'
import { coupons as initialCoupons } from '../../data/billing.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { Coupon, CouponDuration, CouponKind } from '../../types.ts'

const describe = (c: Coupon) => {
  const amount = c.kind === 'percent' ? `${c.value}% off` : `${formatMoney(c.value)} off`
  const duration = c.duration === 'once' ? 'first payment' : c.duration === 'forever' ? 'every payment' : `${c.months} months`
  return `${amount}, ${duration}`
}

export default function Coupons() {
  usePageTitle('Coupons')
  const toast = useToast()
  const [coupons, setCoupons] = useState(initialCoupons)
  const [creating, setCreating] = useState(false)
  const [kind, setKind] = useState<CouponKind>('percent')
  const [duration, setDuration] = useState<CouponDuration>('once')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const code = String(data.get('code') ?? '').trim().toUpperCase()
    const value = Number(data.get('value'))
    const next: Record<string, string> = {}
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) next.code = 'Use 3 to 20 letters, numbers or hyphens.'
    else if (coupons.some((c) => c.code === code)) next.code = 'A coupon with this code already exists.'
    if (!(value > 0) || (kind === 'percent' && value > 100)) next.value = kind === 'percent' ? 'Enter a percentage between 1 and 100.' : 'Enter an amount above 0.'
    setErrors(next)
    if (Object.keys(next).length) return

    const max = Number(data.get('max'))
    const expires = String(data.get('expires') ?? '')
    setCoupons((list) => [
      {
        code,
        description: String(data.get('description') ?? '') || 'New coupon',
        kind,
        value,
        duration,
        months: duration === 'repeating' ? Number(data.get('months')) || 3 : null,
        redemptions: 0,
        maxRedemptions: max > 0 ? max : null,
        expires: expires ? new Date(`${expires}T00:00:00Z`) : null,
        active: true,
      },
      ...list,
    ])
    toast({ title: `Coupon ${code} created` })
    setCreating(false)
  }

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Code',
      sortValue: (c) => c.code,
      cell: (c) => (
        <span className="code-cell">
          <span className="code-chip">{c.code}</span>
          <button
            type="button"
            className="icon-button small"
            onClick={() => {
              navigator.clipboard?.writeText(c.code).catch(() => {})
              toast({ title: `${c.code} copied` })
            }}
          >
            <Icon name="copy" size={14} />
            <span className="sr-only">Copy {c.code}</span>
          </button>
        </span>
      ),
    },
    { key: 'discount', header: 'Discount', cell: (c) => describe(c) },
    { key: 'description', header: 'Used for', sortValue: (c) => c.description, cell: (c) => <span className="muted">{c.description}</span> },
    {
      key: 'redemptions',
      header: 'Redemptions',
      sortValue: (c) => c.redemptions,
      cell: (c) => (
        <span className="redemptions">
          <span>
            {c.redemptions}
            {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
          </span>
          {c.maxRedemptions && <Progress value={c.redemptions} max={c.maxRedemptions} label={`${c.code} redemptions`} />}
        </span>
      ),
    },
    { key: 'expires', header: 'Expires', sortValue: (c) => c.expires ?? new Date(8640000000000000), cell: (c) => <span className="muted">{c.expires ? formatDate(c.expires) : 'Never'}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => String(c.active),
      cell: (c) => (c.active && (!c.expires || c.expires > TODAY) ? <StatusBadge status="active" label="Active" /> : <StatusBadge status="expired" label="Expired" />),
    },
  ]

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes customers can enter at checkout."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setErrors({})
              setKind('percent')
              setDuration('once')
              setCreating(true)
            }}
          >
            <Icon name="plus" size={16} />
            New coupon
          </button>
        }
      />
      <Card flush>
        <DataTable label="Coupons" rows={coupons} columns={columns} rowKey={(c) => c.code} pageSize={0} />
      </Card>

      <Modal open={creating} onClose={() => setCreating(false)} title="New coupon" description="Customers enter the code at checkout.">
        <form className="stack" onSubmit={create} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="coupon-code">Code</label>
              <input className="input mono upper" id="coupon-code" name="code" placeholder="SPRING30" aria-invalid={Boolean(errors.code)} aria-describedby="coupon-code-error" data-autofocus />
              {errors.code && (
                <span id="coupon-code-error" className="field-error">
                  {errors.code}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="coupon-description">Used for (internal)</label>
              <input className="input" id="coupon-description" name="description" placeholder="Spring campaign" />
            </div>
          </div>
          <fieldset className="field">
            <legend>Discount type</legend>
            <div className="choice-row">
              <label className="choice">
                <input type="radio" name="kind" checked={kind === 'percent'} onChange={() => setKind('percent')} />
                <span>Percentage</span>
              </label>
              <label className="choice">
                <input type="radio" name="kind" checked={kind === 'amount'} onChange={() => setKind('amount')} />
                <span>Fixed amount</span>
              </label>
            </div>
          </fieldset>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="coupon-value">{kind === 'percent' ? 'Percent off' : 'Amount off (USD)'}</label>
              <input className="input" id="coupon-value" name="value" type="number" min="1" step="1" aria-invalid={Boolean(errors.value)} aria-describedby="coupon-value-error" />
              {errors.value && (
                <span id="coupon-value-error" className="field-error">
                  {errors.value}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="coupon-duration">Applies to</label>
              <select className="input" id="coupon-duration" value={duration} onChange={(event) => setDuration(event.target.value as CouponDuration)}>
                <option value="once">First payment</option>
                <option value="repeating">Several months</option>
                <option value="forever">Every payment</option>
              </select>
            </div>
            {duration === 'repeating' && (
              <div className="field">
                <label htmlFor="coupon-months">Number of months</label>
                <input className="input" id="coupon-months" name="months" type="number" min="1" max="24" defaultValue={3} />
              </div>
            )}
            <div className="field">
              <label htmlFor="coupon-max">Max redemptions (optional)</label>
              <input className="input" id="coupon-max" name="max" type="number" min="1" />
            </div>
            <div className="field">
              <label htmlFor="coupon-expires">Expires (optional)</label>
              <input className="input" id="coupon-expires" name="expires" type="date" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create coupon
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
