import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Icon } from './Icon.tsx'
import { EmptyState, Pagination, cx } from './ui.tsx'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  /** Provide a sort value to make the column sortable. */
  sort?: (row: T) => string | number
  align?: 'right' | 'center'
  /** Hidden below 720px to keep tables readable on phones. */
  hideSm?: boolean
  width?: string
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  caption: string
  pageSize?: number
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  empty?: ReactNode
  footer?: ReactNode
  rowClass?: (row: T) => string | undefined
}

export function DataTable<T>({ rows, columns, rowKey, caption, pageSize = 10, initialSort, empty, footer, rowClass }: Props<T>) {
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key)
    if (!col?.sort || !sort) return rows
    const get = col.sort
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = get(a)
      const y = get(b)
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id')) * dir
    })
  }, [rows, columns, sort])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  // When filters shrink the list, stay on a page that exists.
  useEffect(() => { if (page > pages) setPage(pages) }, [page, pages])
  const current = Math.min(page, pages)
  const slice = sorted.slice((current - 1) * pageSize, current * pageSize)

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  return (
    <div className="data-table">
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={cx(c.align === 'right' && 'num', c.align === 'center' && 'center', c.hideSm && 'hide-sm')}
                    style={c.width ? { width: c.width } : undefined}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : c.sort ? 'none' : undefined}
                  >
                    {c.sort ? (
                      <button type="button" className="th-sort" onClick={() => toggleSort(c.key)}>
                        {c.header}
                        <Icon name={active && sort.dir === 'desc' ? 'down' : 'up'} size={13} className={active ? 'sort-on' : 'sort-off'} />
                      </button>
                    ) : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={rowKey(row)} className={rowClass?.(row)}>
                {columns.map((c) => (
                  <td key={c.key} className={cx(c.align === 'right' && 'num', c.align === 'center' && 'center', c.hideSm && 'hide-sm')}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
        {rows.length === 0 && (empty ?? <EmptyState title="Tidak ada data yang cocok">Ubah atau hapus filter untuk melihat data lain.</EmptyState>)}
      </div>
      {rows.length > pageSize && (
        <Pagination page={current} pages={pages} onPage={setPage} total={sorted.length} from={(current - 1) * pageSize + 1} to={Math.min(current * pageSize, sorted.length)} />
      )}
    </div>
  )
}
