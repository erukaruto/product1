import { Link } from 'react-router'
import type { ClassGroup } from '../data/demo.ts'
import { teacherById } from '../data/demo.ts'
import { addDays, hariPendek, isoDate, tanggalPendek } from '../lib/format.ts'
import { DEMO_TODAY } from '../data/school.ts'

const START_HOUR = 8
const END_HOUR = 22
const ROW = 56 // px per hour, matches .week-hour in app.css

/** Week view: Monday to Sunday, 08.00–22.00, one block per class meeting. */
export function WeekGrid({ classes, weekStart }: { classes: ClassGroup[]; weekStart: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  return (
    <div className="week-wrap" role="region" aria-label="Kalender mingguan, bisa digulir ke samping" tabIndex={0}>
      <div className="week">
        <div className="week-head" aria-hidden="true" />
        {days.map((d) => (
          <div key={d.toISOString()} className={`week-head${isoDate(d) === isoDate(DEMO_TODAY) ? ' today' : ''}`}>{hariPendek(d)} {tanggalPendek(d)}</div>
        ))}
        <div className="week-hours" aria-hidden="true">
          {hours.map((h) => <div key={h} className="week-hour">{String(h).padStart(2, '0')}.00</div>)}
        </div>
        {days.map((d) => {
          const events = classes.filter((c) => c.days.includes(d.getDay()) && c.startDate <= isoDate(d)).sort((a, b) => a.start.localeCompare(b.start))
          // Overlapping meetings sit side by side: greedy lanes per day.
          const toMin = (c: ClassGroup) => { const [h, m] = c.start.split(':').map(Number); return h * 60 + m }
          const laneEnds: number[] = []
          const lanes = new Map<string, number>()
          for (const c of events) {
            const lane = laneEnds.findIndex((end) => end <= toMin(c))
            const index = lane === -1 ? laneEnds.length : lane
            laneEnds[index] = toMin(c) + c.minutes
            lanes.set(c.id, index)
          }
          const laneCount = Math.max(1, laneEnds.length)
          return (
            <div key={d.toISOString()} className="week-col">
              {hours.map((h) => <div key={h} className="slot" />)}
              {events.map((c) => {
                const [hh, mm] = c.start.split(':').map(Number)
                const top = (hh - START_HOUR + mm / 60) * ROW
                const height = (c.minutes / 60) * ROW - 4
                const endMin = hh * 60 + mm + c.minutes
                const end = `${String(Math.floor(endMin / 60)).padStart(2, '0')}.${String(endMin % 60).padStart(2, '0')}`
                return (
                  <Link key={c.id} to={`/kelas/${c.id}`} className={`week-event lang-${c.lang}`} style={{ top, height, left: `calc(${((lanes.get(c.id) ?? 0) / laneCount) * 100}% + 2px)`, width: `calc(${100 / laneCount}% - 4px)`, right: 'auto' }} aria-label={`${hariPendek(d)} ${c.start.replace(':', '.')}–${end}, ${c.name}, ${teacherById(c.teacherId)?.name}`}>
                    <b>{c.start.replace(':', '.')}–{end} · {c.level}</b>
                    {c.program} · {c.branch === 'online' ? 'Online' : c.room.replace('Ruang ', '')}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
