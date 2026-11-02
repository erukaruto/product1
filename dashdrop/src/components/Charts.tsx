import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useElementWidth } from '../lib/hooks.ts'
import { formatCompactMoney, formatMoney, formatSignedMoney } from '../lib/format.ts'

/* Rounds the axis to readable steps, for example 30k, 35k, 40k. */
function niceScale(min: number, max: number, count = 4) {
  if (min === max) {
    min -= 1
    max += 1
  }
  const rough = (max - min) / count
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const residual = rough / magnitude
  const step = (residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1) * magnitude
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const steps = Math.round((niceMax - niceMin) / step)
  const ticks = Array.from({ length: steps + 1 }, (_, i) => Number((niceMin + i * step).toFixed(10)))
  return { min: niceMin, max: niceMax, ticks }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const PAD = { top: 16, right: 16, bottom: 30, left: 52 }

export interface Point {
  label: string
  full?: string
  value: number
}

interface LineChartProps {
  data: Point[]
  height?: number
  /** Accessible summary of the chart. */
  label: string
  format?: (value: number) => string
  tickFormat?: (value: number) => string
  /** Start the axis at zero instead of near the lowest value. */
  fromZero?: boolean
}

/** Line chart with a light area fill and a hover tooltip. */
export function LineChart({ data, height = 260, label, format = (v) => formatMoney(v), tickFormat = formatCompactMoney, fromZero = false }: LineChartProps) {
  const [ref, width] = useElementWidth()
  const [active, setActive] = useState<number | null>(null)

  const values = data.map((d) => d.value)
  const scale = niceScale(fromZero ? 0 : Math.min(...values), Math.max(...values))
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1))
  const y = (v: number) => PAD.top + innerH - ((v - scale.min) / (scale.max - scale.min)) * innerH

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z`
  const labelEvery = innerW / data.length < 40 ? 2 : 1

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const position = ((event.clientX - rect.left - PAD.left) / innerW) * (data.length - 1)
    setActive(clamp(Math.round(position), 0, data.length - 1))
  }

  const point = active == null ? null : data[active]

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={label} onPointerMove={onPointerMove} onPointerLeave={() => setActive(null)}>
          {scale.ticks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid" x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-tick" x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end">
                {tickFormat(tick)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % labelEvery === 0 || i === data.length - 1 ? (
              <text key={d.label} className="chart-tick" x={x(i)} y={height - 8} textAnchor="middle">
                {d.label}
              </text>
            ) : null
          )}
          <path className="chart-area" d={area} />
          <path className="chart-line" d={line} />
          {point && active != null && (
            <g>
              <line className="chart-cursor" x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} />
              <circle className="chart-dot" cx={x(active)} cy={y(point.value)} r="4.5" />
            </g>
          )}
        </svg>
      )}
      {point && active != null && (
        <div className="chart-tooltip" style={{ left: clamp(x(active), 70, width - 70), top: y(point.value) }}>
          <span>{point.full ?? point.label}</span>
          <strong>{format(point.value)}</strong>
        </div>
      )}
    </div>
  )
}

export type BarTone = 'accent' | 'accent-light' | 'loss' | 'loss-strong'

export interface BarSeries<T> {
  label: string
  value: (row: T) => number
  tone: BarTone
  /** Up stacks above the zero line, down stacks below it. */
  direction: 'up' | 'down'
}

interface StackedBarChartProps<T> {
  data: T[]
  series: BarSeries<T>[]
  height?: number
  label: string
  /** Line shown at the bottom of the tooltip, for example the net change. */
  summary?: (row: T) => string
}

/** Stacked bars with series above and below a zero line. Used for MRR gained and lost. */
export function StackedBarChart<T extends { label: string; full?: string }>({ data, series, height = 280, label, summary }: StackedBarChartProps<T>) {
  const [ref, width] = useElementWidth()
  const [active, setActive] = useState<number | null>(null)

  const total = (row: T, direction: 'up' | 'down') => series.filter((s) => s.direction === direction).reduce((sum, s) => sum + s.value(row), 0)
  const maxUp = Math.max(0, ...data.map((d) => total(d, 'up')))
  const maxDown = Math.max(0, ...data.map((d) => total(d, 'down')))
  const scale = niceScale(-maxDown, maxUp, 5)
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const band = innerW / data.length
  const barW = clamp(band * 0.56, 4, 28)
  const y = (v: number) => PAD.top + innerH - ((v - scale.min) / (scale.max - scale.min)) * innerH
  const cx = (i: number) => PAD.left + band * i + band / 2
  const labelEvery = band < 40 ? 2 : 1
  const point = active == null ? null : data[active]

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={label} onPointerLeave={() => setActive(null)}>
          {scale.ticks.map((tick) => (
            <g key={tick}>
              <line className={tick === 0 ? 'chart-axis' : 'chart-grid'} x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-tick" x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end">
                {formatCompactMoney(tick)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            let up = 0
            let down = 0
            return (
              <g key={d.label} onPointerEnter={() => setActive(i)}>
                <rect className="chart-hit" x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} />
                {series.map((s) => {
                  const value = s.value(d)
                  if (value <= 0) return null
                  const from = s.direction === 'up' ? up : -down
                  const to = s.direction === 'up' ? up + value : -(down + value)
                  if (s.direction === 'up') up += value
                  else down += value
                  const top = y(Math.max(from, to))
                  return <rect key={s.label} className={`bar-${s.tone}`} x={cx(i) - barW / 2} y={top} width={barW} height={Math.abs(y(from) - y(to))} />
                })}
                {(i % labelEvery === 0 || i === data.length - 1) && (
                  <text className="chart-tick" x={cx(i)} y={height - 8} textAnchor="middle">
                    {d.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      {point && active != null && (
        <div className="chart-tooltip" style={{ left: clamp(cx(active), 90, width - 90), top: y(total(point, 'up')) }}>
          <span>{point.full ?? point.label}</span>
          {series.map((s) => (
            <small key={s.label}>
              {s.label}: {formatMoney(s.value(point))}
            </small>
          ))}
          {summary && <strong>{summary(point)}</strong>}
        </div>
      )}
    </div>
  )
}

/** Gained/lost chart from the first version, kept as a thin wrapper. */
export function MovementChart({ data, height, label }: { data: Array<{ label: string; full?: string; gained: number; lost: number }>; height?: number; label: string }) {
  return (
    <StackedBarChart
      data={data}
      height={height}
      label={label}
      series={[
        { label: 'Gained', value: (d) => d.gained, tone: 'accent', direction: 'up' },
        { label: 'Lost', value: (d) => d.lost, tone: 'loss', direction: 'down' },
      ]}
      summary={(d) => `${formatSignedMoney(d.gained - d.lost)} net`}
    />
  )
}

/** Horizontal bars for shares (plan mix, countries, funnel). */
export function ShareBars({ rows }: { rows: Array<{ label: string; value: number; display: string; note?: string | null }> }) {
  const max = Math.max(...rows.map((row) => row.value))
  return (
    <ul className="share-bars">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="share-row">
            <span>{row.label}</span>
            <strong>{row.display}</strong>
          </div>
          <div className="meter" aria-hidden="true">
            <i style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          {row.note && <small className="muted">{row.note}</small>}
        </li>
      ))}
    </ul>
  )
}

/** Small inline trend line, no axes. */
export function Sparkline({ values, width = 120, height = 36, label }: { values: number[]; width?: number; height?: number; label: string }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const x = (i: number) => (i / (values.length - 1)) * (width - 4) + 2
  const y = (v: number) => height - 3 - ((v - min) / (max - min || 1)) * (height - 6)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path className="chart-line" d={line} />
    </svg>
  )
}
