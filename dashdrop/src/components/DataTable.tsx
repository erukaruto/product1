import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Icon from './Icon.tsx'
import { EmptyState, Pagination } from './ui.tsx'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Makes the column sortable. Return a string, number or date. */
  sortValue?: (row: T) => string | number | Date
  align?: 'left' | 'right'
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  /** Rows per page. Set to 0 to show all rows. */
  pageSize?: number
  initialSort?: SortState
  /** Adds a checkbox column. */
  selectable?: boolean
  selected?: Set<string>
  onSelectedChange?: (selected: Set<string>) => void
  emptyTitle?: string
  emptyText?: string
  label: string
}

function compareValues(a: string | number | Date, b: string | number | Date): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

/** Sortable, paginated table with optional row selection. Filtering stays in the page, which passes the filtered rows. */
export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize = 10,
  initialSort,
  selectable = false,
  selected,
  onSelectedChange,
  emptyTitle = 'Nothing to show',
  emptyText,
  label,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | undefined>(initialSort)
  const [page, setPage] = useState(1)

  // Back to the first page when the filtered row count changes.
  useEffect(() => setPage(1), [rows.length])

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key)
    if (!sort || !column?.sortValue) return rows
    const value = column.sortValue
    return [...rows].sort((a, b) => compareValues(value(a), value(b)) * (sort.direction === 'asc' ? 1 : -1))
  }, [rows, columns, sort])

  const size = pageSize > 0 ? pageSize : Math.max(1, sorted.length)
  const pageCount = Math.max(1, Math.ceil(sorted.length / size))
  const current = Math.min(page, pageCount)
  const visible = sorted.slice((current - 1) * size, current * size)
  const visibleKeys = visible.map(rowKey)
  const allVisibleSelected = selectable && visibleKeys.length > 0 && visibleKeys.every((key) => selected?.has(key))

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) return
    setSort((currentSort) =>
      currentSort?.key === column.key
        ? { key: column.key, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: column.align === 'right' ? 'desc' : 'asc' }
    )
  }

  function toggleRow(key: string) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedChange?.(next)
  }

  function toggleAllVisible() {
    const next = new Set(selected)
    if (allVisibleSelected) visibleKeys.forEach((key) => next.delete(key))
    else visibleKeys.forEach((key) => next.add(key))
    onSelectedChange?.(next)
  }

  if (rows.length === 0) return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>

  return (
    <>
      <div className="table-scroll">
        <table className="table">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="check-cell">
                  <input type="checkbox" aria-label="Select all rows on this page" checked={allVisibleSelected} onChange={toggleAllVisible} />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align === 'right' ? 'num' : undefined}
                  aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : column.sortValue ? 'none' : undefined}
                >
                  {column.sortValue ? (
                    <button type="button" className={`sort${sort?.key === column.key ? ' is-active' : ''}`} onClick={() => toggleSort(column)}>
                      {column.header}
                      <Icon name="sort" size={14} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const key = rowKey(row)
              const isSelected = selected?.has(key) ?? false
              return (
                <tr key={key} className={isSelected ? 'is-selected' : undefined}>
                  {selectable && (
                    <td className="check-cell">
                      <input type="checkbox" aria-label={`Select row ${key}`} checked={isSelected} onChange={() => toggleRow(key)} />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={column.align === 'right' ? 'num' : undefined}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && (
        <Pagination
          page={current}
          pageCount={pageCount}
          from={(current - 1) * size + 1}
          to={Math.min(current * size, sorted.length)}
          total={sorted.length}
          onPage={setPage}
        />
      )}
    </>
  )
}
