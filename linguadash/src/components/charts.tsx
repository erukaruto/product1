/*
  Hand-made SVG charts (no chart library).
  Specs: 2px lines, markers r=4 with a 2px surface ring, bars at most 24px thick with a 4px rounded
  data end and a square baseline, 2px surface gap between stacked segments, hairline solid gridlines.
  Every chart has a legend when it shows 2+ series, a hover tooltip, and a "Lihat tabel data" view.
*/
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from './ui.tsx'

export interface Series { id: string; name: string; color: string; values: number[] }
type Format = (value: number) => string

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(600)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(Math.max(240, Math.floor(el.getBoundingClientRect().width)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** Round axis ticks: 0, 25, 50... */
export function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)))
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step)
  return ticks
}

function Legend({ series }: { series: { name: string; color: string }[] }) {
  if (series.length < 2) return null
  return (
    <ul className="chart-legend" role="list">
      {series.map((s) => (
        <li key={s.name}><span className="swatch" style={{ background: s.color }} aria-hidden="true" />{s.name}</li>
      ))}
    </ul>
  )
}

function DataView({ labels, series, format, labelHeader }: { labels: string[]; series: Series[]; format: Format; labelHeader: string }) {
  return (
    <details className="chart-table">
      <summary>Lihat tabel data</summary>
      <div className="table-wrap">
        <table className="table table-compact">
          <thead>
            <tr>
              <th scope="col">{labelHeader}</th>
              {series.map((s) => <th key={s.id} scope="col" className="num">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={label + i}>
                <th scope="row">{label}</th>
                {series.map((s) => <td key={s.id} className="num">{format(s.values[i] ?? 0)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

interface Tip { x: number; y: number; title: string; rows: { name: string; color: string; value: string }[] }
function Tooltip({ tip, width }: { tip: Tip | null; width: number }) {
  if (!tip) return null
  const left = Math.min(Math.max(tip.x, 90), width - 90)
  return (
    <div className="chart-tip" style={{ left, top: tip.y }} role="presentation">
      <b>{tip.title}</b>
      {tip.rows.map((r) => (
        <span key={r.name}><i style={{ background: r.color }} />{r.name}<em>{r.value}</em></span>
      ))}
    </div>
  )
}

const PAD = { top: 16, right: 16, bottom: 28, left: 56 }

// ---------- Line chart ----------
export function LineChart({ labels, series, format, height = 240, label, area, yMax, labelHeader = 'Bulan', endLabels = true }: { labels: string[]; series: Series[]; format: Format; height?: number; label: string; area?: boolean; yMax?: number; labelHeader?: string; endLabels?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const max = yMax ?? Math.max(1, ...series.flatMap((s) => s.values))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const right = endLabels && series.length <= 3 ? 64 : PAD.right
  const plotW = width - PAD.left - right
  const plotH = height - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH
  const every = Math.ceil(labels.length / Math.max(2, Math.floor(plotW / 56)))

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - box.left
    const i = Math.round((px / box.width) * (labels.length - 1))
    setHover(Math.max(0, Math.min(labels.length - 1, i)))
  }
  const tip: Tip | null = hover === null ? null : {
    x: x(hover), y: PAD.top,
    title: labels[hover],
    rows: series.map((s) => ({ name: s.name, color: s.color, value: format(s.values[hover] ?? 0) })),
  }
  // End labels only when they do not collide.
  const ends = series.map((s) => ({ s, y: y(s.values[s.values.length - 1] ?? 0) })).sort((a, b) => a.y - b.y)
  const showEnds = endLabels && series.length <= 3 && ends.every((e, i) => i === 0 || e.y - ends[i - 1].y > 14)

  return (
    <figure className="chart" ref={ref}>
      <Legend series={series} />
      <div className="chart-plot">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - right} y1={y(t)} y2={y(t)} className={t === 0 ? 'axis-line' : 'grid-line'} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tick">{format(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => (i % every === 0 || i === labels.length - 1) && (
            <text key={l + i} x={x(i)} y={height - 8} textAnchor="middle" className="tick">{l}</text>
          ))}
          {series.map((s) => {
            const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
            return (
              <g key={s.id}>
                {area && <path d={`${d}L${x(s.values.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={s.color} opacity={0.1} />}
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1] ?? 0)} r={4} fill={s.color} className="ring" />
              </g>
            )
          })}
          {showEnds && ends.map(({ s, y: yy }) => (
            <text key={s.id} x={width - right + 8} y={yy} dy="0.32em" className="end-label">{format(s.values[s.values.length - 1] ?? 0)}</text>
          ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} className="crosshair" />
              {series.map((s) => <circle key={s.id} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={4.5} fill={s.color} className="ring" />)}
            </g>
          )}
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
        </svg>
        <Tooltip tip={tip} width={width} />
      </div>
      <DataView labels={labels} series={series} format={format} labelHeader={labelHeader} />
    </figure>
  )
}

// ---------- Column chart (grouped or stacked) ----------
function roundedTop(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return ''
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`
}

export function BarChart({ labels, series, format, height = 240, label, stacked, labelHeader = 'Bulan', valueLabels }: { labels: string[]; series: Series[]; format: Format; height?: number; label: string; stacked?: boolean; labelHeader?: string; valueLabels?: boolean }) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0))
  const max = stacked ? Math.max(1, ...totals) : Math.max(1, ...series.flatMap((s) => s.values))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom - (valueLabels ? 0 : 0)
  const band = plotW / labels.length
  const groups = stacked ? 1 : series.length
  const barW = Math.min(24, (band * 0.7 - (groups - 1) * 2) / groups)
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH
  const every = Math.ceil(labels.length / Math.max(2, Math.floor(plotW / 48)))
  const tip: Tip | null = hover === null ? null : {
    x: PAD.left + band * (hover + 0.5), y: PAD.top,
    title: labels[hover],
    rows: [...series.map((s) => ({ name: s.name, color: s.color, value: format(s.values[hover] ?? 0) })), ...(stacked && series.length > 1 ? [{ name: 'Total', color: 'transparent', value: format(totals[hover]) }] : [])],
  }

  return (
    <figure className="chart" ref={ref}>
      <Legend series={series} />
      <div className="chart-plot">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'axis-line' : 'grid-line'} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tick">{format(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => {
            const cx0 = PAD.left + band * i + band / 2
            const groupW = groups * barW + (groups - 1) * 2
            let acc = 0
            return (
              <g key={l + i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cx('bar-group', hover === i && 'is-hover')}>
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={plotH} fill="transparent" />
                {series.map((s, si) => {
                  const v = s.values[i] ?? 0
                  if (stacked) {
                    const yTop = y(acc + v)
                    const h = y(acc) - yTop - (acc > 0 ? 2 : 0)
                    acc += v
                    const isTop = si === series.length - 1 || series.slice(si + 1).every((n) => (n.values[i] ?? 0) === 0)
                    return isTop ? <path key={s.id} d={roundedTop(cx0 - barW / 2, yTop, barW, Math.max(0, h))} fill={s.color} /> : <rect key={s.id} x={cx0 - barW / 2} y={yTop} width={barW} height={Math.max(0, h)} fill={s.color} />
                  }
                  const bx = cx0 - groupW / 2 + si * (barW + 2)
                  return <path key={s.id} d={roundedTop(bx, y(v), barW, y(0) - y(v))} fill={s.color} />
                })}
                {valueLabels && series.length === 1 && (
                  <text x={cx0} y={y(series[0].values[i] ?? 0) - 6} textAnchor="middle" className="value-label">{format(series[0].values[i] ?? 0)}</text>
                )}
                {(i % every === 0 || i === labels.length - 1) && <text x={cx0} y={height - 8} textAnchor="middle" className="tick">{l}</text>}
              </g>
            )
          })}
        </svg>
        <Tooltip tip={tip} width={width} />
      </div>
      <DataView labels={labels} series={series} format={format} labelHeader={labelHeader} />
    </figure>
  )
}

// ---------- Horizontal bars (HTML, value at the tip) ----------
export interface HBarItem { label: ReactNode; key: string; value: number; color?: string; sub?: ReactNode }
export function HBars({ items, format, max, label }: { items: HBarItem[]; format: Format; max?: number; label: string }) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value))
  return (
    <figure className="chart" aria-label={label}>
      <ul className="hbars" role="list">
        {items.map((it) => (
          <li key={it.key} className="hbar-row" title={`${typeof it.label === 'string' ? it.label : it.key}: ${format(it.value)}`}>
            <span className="hbar-label">{it.label}{it.sub && <small className="muted">{it.sub}</small>}</span>
            <span className="hbar-track"><span style={{ width: `${(it.value / top) * 100}%`, background: it.color ?? 'var(--accent)' }} /></span>
            <b className="hbar-value">{format(it.value)}</b>
          </li>
        ))}
      </ul>
    </figure>
  )
}

// ---------- Funnel (ordinal: one hue, conversion between steps) ----------
export function Funnel({ steps, label }: { steps: { label: string; value: number }[]; label: string }) {
  const top = Math.max(1, steps[0]?.value ?? 1)
  return (
    <figure className="chart funnel" aria-label={label}>
      <ol className="funnel-steps" role="list">
        {steps.map((s, i) => (
          <li key={s.label}>
            <div className="funnel-head">
              <span>{s.label}</span>
              <b>{s.value.toLocaleString('id-ID')}</b>
            </div>
            <span className="hbar-track funnel-track"><span style={{ width: `${(s.value / top) * 100}%`, opacity: 1 - i * 0.18 }} /></span>
            {i > 0 && <small className="muted">{((s.value / Math.max(1, steps[i - 1].value)) * 100).toFixed(1).replace('.', ',')}% dari tahap sebelumnya</small>}
          </li>
        ))}
      </ol>
    </figure>
  )
}

// ---------- Sparkline (de-emphasised line, current point in accent) ----------
export function Sparkline({ values, label, width = 120, height = 34 }: { values: number[]; label: string; width?: number; height?: number }) {
  const path = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    return values.map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * (width - 8) + 4).toFixed(1)},${(height - 4 - ((v - min) / span) * (height - 8)).toFixed(1)}`).join('')
  }, [values, width, height])
  const last = values[values.length - 1]
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <path d={path} fill="none" stroke="var(--line-strong)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width - 4} cy={height - 4 - ((last - min) / span) * (height - 8)} r={3.5} fill="var(--accent)" />
    </svg>
  )
}

// ---------- 100% segmented bar (one whole split into parts) ----------
export function SegmentBar({ parts, label }: { parts: { name: string; value: number; color: string }[]; label: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  return (
    <figure className="chart" aria-label={label}>
      <div className="segbar">
        {parts.filter((p) => p.value > 0).map((p) => (
          <span key={p.name} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.name}: ${p.value}`} />
        ))}
      </div>
      <ul className="chart-legend" role="list">
        {parts.map((p) => (
          <li key={p.name}><span className="swatch" style={{ background: p.color }} aria-hidden="true" />{p.name} <b>{p.value.toLocaleString('id-ID')}</b> <span className="muted">({((p.value / total) * 100).toFixed(1).replace('.', ',')}%)</span></li>
        ))}
      </ul>
    </figure>
  )
}

export const LANG_COLOR: Record<string, string> = { en: 'var(--c-en)', ja: 'var(--c-ja)', ko: 'var(--c-ko)', zh: 'var(--c-zh)', ar: 'var(--c-ar)', de: 'var(--c-de)' }
