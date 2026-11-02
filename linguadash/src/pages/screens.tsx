import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SCREENS } from '../routes.tsx'
import { Card, PageHeader } from '../components/ui.tsx'

export function Screens() {
  const [q, setQ] = useState('')
  const groups = useMemo(() => {
    const map = new Map<string, typeof SCREENS>()
    for (const s of SCREENS) {
      if (q && !`${s.title} ${s.path} ${s.group}`.toLowerCase().includes(q.toLowerCase())) continue
      map.set(s.group, [...(map.get(s.group) ?? []), s])
    }
    return [...map.entries()]
  }, [q])
  const total = SCREENS.length + 1 // + the 404 catch-all
  return (
    <>
      <PageHeader
        title="Semua layar"
        description={`${total} layar di LinguaDash, termasuk halaman 404. Klik untuk membuka.`}
        crumbs={[{ label: 'Overview', to: '/' }, { label: 'Semua layar' }]}
      />
      <div className="toolbar">
        <div className="field field-search">
          <label htmlFor="screen-q">Cari layar</label>
          <input id="screen-q" className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="contoh: invoice, absensi, mock test" />
        </div>
      </div>
      <div className="grid grid-3">
        {groups.map(([group, list]) => (
          <Card key={group} title={group} description={`${list.length} layar`}>
            <ul className="screen-list" role="list">
              {list.map((s) => (
                <li key={s.path}>
                  <Link to={s.sample ?? s.path}>{s.title}</Link>
                  <code>{s.sample ?? s.path}</code>
                </li>
              ))}
              {group === 'Error' && (
                <li><Link to="/halaman-yang-tidak-ada">Halaman tidak ditemukan (404)</Link><code>/*</code></li>
              )}
            </ul>
          </Card>
        ))}
      </div>
    </>
  )
}
