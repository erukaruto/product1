import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, PageHeader, Stepper, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

const SAMPLE_COLUMNS = ['Company name', 'Contact email', 'Plan', 'Monthly amount', 'Country', 'Signup date']
const SAMPLE_ROWS = [
  ['Northfield Labs', 'ops@northfield.example', 'Growth', '61', 'Canada', '2026-03-14'],
  ['Pebble & Co', 'hi@pebble.example', 'Starter', '19', 'Spain', '2026-07-02'],
  ['Arcwell', 'finance@arcwell.example', 'Scale', '183', 'Germany', '2025-11-20'],
]
const BEACON_FIELDS = ['Skip this column', 'Company', 'Email', 'Plan', 'MRR', 'Country', 'Joined']
const GUESS = ['Company', 'Email', 'Plan', 'MRR', 'Country', 'Joined']

/* Three-step CSV import: upload, map columns, review. UI only: nothing is imported. */
export default function CustomerImport() {
  usePageTitle('Import customers')
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState('')
  const [mapping, setMapping] = useState<string[]>(GUESS)
  const required = ['Company', 'Email']
  const missing = required.filter((field) => !mapping.includes(field))
  const duplicates = mapping.filter((field, i) => field !== 'Skip this column' && mapping.indexOf(field) !== i)

  return (
    <>
      <PageHeader
        back={
          <Link className="back-link" to="/customers">
            <Icon name="arrowLeft" size={16} />
            Customers
          </Link>
        }
        title="Import customers"
        description="Add customers from a CSV export of another system."
      />
      <Card>
        <Stepper steps={['Upload', 'Match columns', 'Review']} current={step} />
        {step === 0 && (
          <div className="stack">
            <label className="dropzone">
              <Icon name="upload" />
              <strong>{file || 'Choose a CSV file'}</strong>
              <small>{file ? '3 rows found in the preview' : 'Up to 50 MB. The first row must be column names.'}</small>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setFile(event.target.files?.[0]?.name ?? '')} />
            </label>
            <div className="row-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setFile('customers-export.csv')}>
                Use the sample file
              </button>
              <button type="button" className="btn btn-primary" disabled={!file} onClick={() => setStep(1)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="stack">
            <p className="muted">Beacon guessed a field for each column. Change any that are wrong.</p>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Column in your file</th>
                    <th scope="col">Example</th>
                    <th scope="col">Beacon field</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_COLUMNS.map((column, index) => (
                    <tr key={column}>
                      <th scope="row">{column}</th>
                      <td className="muted">{SAMPLE_ROWS[0][index]}</td>
                      <td>
                        <select
                          className="input"
                          aria-label={`Beacon field for ${column}`}
                          value={mapping[index]}
                          onChange={(event) => setMapping((list) => list.map((value, i) => (i === index ? event.target.value : value)))}
                        >
                          {BEACON_FIELDS.map((field) => (
                            <option key={field}>{field}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(missing.length > 0 || duplicates.length > 0) && (
              <p className="inline-status bad" role="alert">
                <Icon name="xCircle" size={18} />
                {missing.length > 0 ? `Map a column to ${missing.join(' and ')}.` : `${duplicates[0]} is used twice.`}
              </p>
            )}
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
                Back
              </button>
              <button type="button" className="btn btn-primary" disabled={missing.length > 0 || duplicates.length > 0} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="stack">
            <p className="inline-status good">
              <Icon name="checkCircle" size={18} /> 3 customers ready to import. No errors found.
            </p>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    {mapping.map((field, i) => (field === 'Skip this column' ? null : <th key={i} scope="col">{field}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row) => (
                    <tr key={row[0]}>{row.map((cell, i) => (mapping[i] === 'Skip this column' ? null : <td key={i}>{cell}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  toast({ title: '3 customers imported' })
                  navigate('/customers')
                }}
              >
                Import 3 customers
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
