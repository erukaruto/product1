import { useState, type DragEvent } from 'react'
import { Link } from 'react-router'
import { Avatar, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { pipeline as initial, STAGES, type Stage } from '../../data/reports.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

/* Customer success board. Drag cards between columns, or use the arrow buttons (keyboard friendly). */
export default function Pipeline() {
  usePageTitle('Pipeline')
  const toast = useToast()
  const [cards, setCards] = useState(initial)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<Stage | null>(null)

  function move(id: string, stage: Stage) {
    const card = cards.find((c) => c.id === id)
    if (!card || card.stage === stage) return
    setCards((list) => list.map((c) => (c.id === id ? { ...c, stage } : c)))
    toast({ title: `${card.customer.company} moved to ${stage}` })
  }

  function onDrop(event: DragEvent<HTMLElement>, stage: Stage) {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (id) move(id, stage)
    setDragging(null)
    setOver(null)
  }

  return (
    <>
      <PageHeader title="Pipeline" description="Where each account is in its journey. Stages are suggested from status, health and renewal date; move cards as you work them." />
      <div className="board">
        {STAGES.map((stage, si) => {
          const list = cards.filter((c) => c.stage === stage)
          return (
            <section
              key={stage}
              className={`board-col${over === stage ? ' is-over' : ''}`}
              aria-label={stage}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(stage)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => onDrop(e, stage)}
            >
              <header>
                <strong>{stage}</strong>
                <span className="count">{list.length}</span>
              </header>
              <ul>
                {list.map((card) => (
                  <li
                    key={card.id}
                    className={`board-card${dragging === card.id ? ' is-dragging' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', card.id)
                      setDragging(card.id)
                    }}
                    onDragEnd={() => setDragging(null)}
                    data-card={card.customer.company}
                  >
                    <div className="board-card-head">
                      <Avatar name={card.customer.company} size={26} />
                      <Link className="row-link" to={`/customers/${card.id}`}>
                        {card.customer.company}
                      </Link>
                    </div>
                    <small className="muted">{card.note}</small>
                    <div className="board-card-foot">
                      <span className="muted small">
                        {card.customer.plan} · {formatMoney(card.customer.listMrr)}/mo
                      </span>
                      <span className="board-moves">
                        <button type="button" className="icon-button small" disabled={si === 0} onClick={() => move(card.id, STAGES[si - 1])}>
                          <Icon name="chevronLeft" size={14} />
                          <span className="sr-only">
                            Move {card.customer.company} to {STAGES[si - 1]}
                          </span>
                        </button>
                        <button type="button" className="icon-button small" disabled={si === STAGES.length - 1} onClick={() => move(card.id, STAGES[si + 1])}>
                          <Icon name="chevronRight" size={14} />
                          <span className="sr-only">
                            Move {card.customer.company} to {STAGES[si + 1]}
                          </span>
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
                {list.length === 0 && <li className="board-empty muted">Drop accounts here</li>}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
