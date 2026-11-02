import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Card, EmptyState, PageHeader, StatusBadge, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { getInvoice, INVOICE_STATUS_LABELS } from '../../data/invoices.ts'
import { getCustomer } from '../../data/customers.ts'
import { formatDateLong, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { InvoiceStatus } from '../../types.ts'

/* Printable invoice. "Download PDF" uses the browser's print dialog (Save as PDF); print styles hide the app chrome. */
export default function InvoiceDetail() {
  const { id } = useParams()
  const invoice = getInvoice(id)
  const customer = getCustomer(invoice?.customerId)
  usePageTitle(invoice ? `Invoice ${invoice.id}` : 'Invoice not found')
  const toast = useToast()
  const [status, setStatus] = useState<InvoiceStatus | undefined>(invoice?.status)

  const back = (
    <Link className="back-link" to="/invoices">
      <Icon name="arrowLeft" size={16} />
      Invoices
    </Link>
  )

  if (!invoice || !customer || !status) {
    return (
      <>
        <PageHeader title="Invoice not found" back={back} />
        <Card>
          <EmptyState title={`No invoice with the number "${id}"`} icon="invoices" />
        </Card>
      </>
    )
  }

  const subtotal = invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)

  return (
    <>
      <PageHeader
        back={back}
        title={`Invoice ${invoice.id}`}
        description={`${invoice.customer} · ${formatMoney(invoice.amount, true)}`}
        actions={
          <div className="row-actions no-print">
            {status !== 'paid' && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => toast({ title: 'Reminder sent', description: `Emailed to ${customer.email}.` })}>
                  <Icon name="send" size={16} />
                  Send reminder
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStatus('paid')
                    toast({ title: `${invoice.id} marked as paid` })
                  }}
                >
                  <Icon name="check" size={16} />
                  Mark as paid
                </button>
              </>
            )}
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              <Icon name="printer" size={16} />
              Print or save PDF
            </button>
          </div>
        }
      />

      <article className="card invoice-sheet" aria-label={`Invoice ${invoice.id}`}>
        <header className="invoice-head">
          <div>
            <span className="brand invoice-brand">Beacon</span>
            <address>
              Beacon Analytics Ltd.
              <br />
              12 Harbour Street
              <br />
              Bristol BS1 4DJ, United Kingdom
            </address>
          </div>
          <div className="invoice-meta">
            <StatusBadge status={status} label={INVOICE_STATUS_LABELS[status]} />
            <dl>
              <div>
                <dt>Invoice</dt>
                <dd className="mono">{invoice.id}</dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>{formatDateLong(invoice.issued)}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{formatDateLong(invoice.due)}</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="invoice-to">
          <span className="muted">Bill to</span>
          <strong>{customer.company}</strong>
          <span>{customer.name}</span>
          <span>{customer.email}</span>
          <span>{customer.country}</span>
        </section>

        <div className="table-scroll">
          <table className="table invoice-lines">
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col" className="num">
                  Qty
                </th>
                <th scope="col" className="num">
                  Unit price
                </th>
                <th scope="col" className="num">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.description}>
                  <td>{line.description}</td>
                  <td className="num">{line.quantity}</td>
                  <td className="num">{formatMoney(line.unitPrice, true)}</td>
                  <td className="num">{formatMoney(line.quantity * line.unitPrice, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="invoice-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(subtotal, true)}</dd>
          </div>
          <div>
            <dt>Tax (0%)</dt>
            <dd>{formatMoney(0, true)}</dd>
          </div>
          <div className="total">
            <dt>Total due</dt>
            <dd>{status === 'paid' ? formatMoney(0, true) : formatMoney(invoice.amount, true)}</dd>
          </div>
        </dl>

        <footer className="invoice-foot muted">
          Questions about this invoice? Write to billing@beacon.example. Demo invoice for a fictional company.
        </footer>
      </article>
    </>
  )
}
