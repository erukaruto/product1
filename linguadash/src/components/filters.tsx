import { BRANCH_LIST } from '../data/demo.ts'
import { LANGUAGES, langByCode } from '../data/school.ts'

interface Props { id: string; value: string; onChange: (v: string) => void; label?: string }

export function LangSelect({ id, value, onChange, label = 'Bahasa', all = 'Semua bahasa' }: Props & { all?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {all && <option value="">{all}</option>}
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
    </div>
  )
}

export function LevelSelect({ id, value, onChange, lang, label = 'Level' }: Props & { lang: string }) {
  const levels = lang ? langByCode(lang).levels : []
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)} disabled={!lang}>
        <option value="">{lang ? 'Semua level' : 'Pilih bahasa dulu'}</option>
        {levels.map((l) => <option key={l.code} value={l.code}>{l.code} · {l.name}</option>)}
      </select>
    </div>
  )
}

export function BranchSelect({ id, value, onChange, label = 'Cabang' }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Semua cabang</option>
        {BRANCH_LIST.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </div>
  )
}

export function SearchInput({ id, value, onChange, label = 'Cari', placeholder }: Props & { placeholder?: string }) {
  return (
    <div className="field field-search">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function SelectFilter({ id, value, onChange, label, options }: Props & { label: string; options: [string, string][] }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
