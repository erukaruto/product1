/*
  Demo invoices, derived from the customers list: one invoice per month for each paying customer,
  for August, September and October 2026. Line items add up to the invoice amount.
*/
import type { Customer, Invoice, InvoiceLine, InvoiceStatus } from '../types.ts'
import { customers, PLANS } from './customers.ts'
import { TODAY } from './metrics.ts'

const MONTHS = [7, 8, 9] // Aug, Sep, Oct (0-based)

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  open: 'Open',
  overdue: 'Overdue',
}

export function linesFor(customer: Customer): InvoiceLine[] {
  const { price, seatPrice } = PLANS[customer.plan]
  const lines: InvoiceLine[] = [{ description: `${customer.plan} plan, monthly (includes 1 seat)`, quantity: 1, unitPrice: price }]
  if (customer.seats > 1 && seatPrice > 0) {
    lines.push({ description: 'Additional seats', quantity: customer.seats - 1, unitPrice: seatPrice })
  }
  return lines
}

let counter = 2140

export const invoices: Invoice[] = customers
  .filter((customer) => customer.status !== 'trial')
  .flatMap((customer) => {
    const day = Math.min(28, customer.joined.getUTCDate())
    return MONTHS.map((month) => {
      const issued = new Date(Date.UTC(2026, month, day))
      const due = new Date(issued.getTime() + 14 * 86400000)
      return { customer, issued, due }
    })
  })
  .filter(({ customer, issued }) => {
    if (customer.joined > issued) return false
    // Canceled customers stop receiving invoices after September.
    if (customer.status === 'canceled' && issued.getUTCMonth() === 9) return false
    return true
  })
  .sort((a, b) => a.issued.getTime() - b.issued.getTime() || a.customer.id.localeCompare(b.customer.id))
  .map(({ customer, issued, due }): Invoice => {
    let status: InvoiceStatus = 'paid'
    if (due > TODAY) status = 'open'
    else if (customer.status === 'past_due' && issued.getUTCMonth() >= 8) status = 'overdue'

    counter += 1
    return {
      id: `INV-${counter}`,
      customerId: customer.id,
      customer: customer.company,
      issued,
      due,
      amount: customer.listMrr,
      status,
      lines: linesFor(customer),
    }
  })
  .reverse()

export function invoicesFor(customerId: string): Invoice[] {
  return invoices.filter((invoice) => invoice.customerId === customerId)
}

export function getInvoice(id: string | undefined): Invoice | undefined {
  return invoices.find((invoice) => invoice.id === id)
}
