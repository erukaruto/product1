const currency0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const currency2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const number = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const dateLong = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export const formatMoney = (value: number, cents = false): string => (cents ? currency2 : currency0).format(value)
export const formatSignedMoney = (value: number): string => (value < 0 ? '-' : '+') + currency0.format(Math.abs(value))
export const formatNumber = (value: number): string => number.format(value)
export const formatCompactMoney = (value: number): string => (value < 0 ? '-$' : '$') + compact.format(Math.abs(value))
export const formatDate = (value: Date): string => date.format(value)
export const formatDateLong = (value: Date): string => dateLong.format(value)
export const formatPercent = (value: number, digits = 1): string => `${value.toFixed(digits)}%`

export function percentChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /[A-Za-zÀ-ÿ]/.test(part[0] ?? ''))
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/** Rows to CSV text. Values are quoted, quotes are doubled. */
export function toCsv(header: string[], rows: Array<Array<string | number>>): string {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  return [header.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n')
}

/** Starts a browser download of a text file. */
export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
