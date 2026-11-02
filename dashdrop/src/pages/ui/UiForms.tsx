import { useState, type FormEvent } from 'react'
import { Card, PageHeader, Switch, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

export default function UiForms() {
  usePageTitle('Forms')
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [alerts, setAlerts] = useState(true)
  const [files, setFiles] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!/^\S+@\S+\.\S+$/.test(email)) return
    toast({ title: 'Form submitted', description: 'Nothing is sent in the demo.' })
  }

  return (
    <>
      <PageHeader title="Forms" description="Inputs, choices and validation. Every field has a visible label." />

      <div className="grid grid-2">
        <Card title="Text inputs">
          <div className="stack">
            <div className="field">
              <label htmlFor="f-name">Text</label>
              <input className="input" id="f-name" placeholder="Beacon HQ" />
            </div>
            <div className="field">
              <label htmlFor="f-password">Password with show/hide</label>
              <div className="input-group">
                <input className="input" id="f-password" type={showPassword ? 'text' : 'password'} defaultValue="correct-horse" />
                <button type="button" className="btn btn-secondary" aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}>
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-price">With prefix and suffix</label>
              <div className="input-group">
                <span className="input-addon">$</span>
                <input className="input" id="f-price" type="number" defaultValue={49} />
                <span className="input-addon">per month</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-search">Search</label>
              <div className="search-field wide">
                <Icon name="search" size={18} />
                <input className="input" id="f-search" type="search" placeholder="Search customers" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-disabled">Disabled</label>
              <input className="input" id="f-disabled" defaultValue="Read only value" disabled />
            </div>
          </div>
        </Card>

        <Card title="Choices">
          <div className="stack">
            <div className="field">
              <label htmlFor="f-select">Select</label>
              <select className="input" id="f-select" defaultValue="growth">
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="scale">Scale</option>
              </select>
            </div>
            <fieldset className="field">
              <legend>Radio group</legend>
              <div className="choice-row">
                {['Monthly', 'Yearly'].map((option, index) => (
                  <label key={option} className="choice">
                    <input type="radio" name="f-interval" defaultChecked={index === 0} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="field">
              <legend>Checkboxes</legend>
              <label className="check">
                <input type="checkbox" defaultChecked />
                <span>Email me a weekly digest</span>
              </label>
              <label className="check">
                <input type="checkbox" />
                <span>Include canceled customers</span>
              </label>
            </fieldset>
            <div className="switch-row">
              <span id="f-switch-label">Send alerts</span>
              <Switch checked={alerts} onChange={setAlerts} labelledBy="f-switch-label" />
            </div>
            <div className="field">
              <label htmlFor="f-range">Range</label>
              <input className="range" id="f-range" type="range" min="0" max="100" defaultValue="60" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Upload">
        <label className="dropzone">
          <Icon name="upload" />
          <strong>{files.length ? `${files.length} file${files.length === 1 ? '' : 's'} chosen` : 'Choose files'}</strong>
          <small>{files.length ? files.join(', ') : 'Or drag them here. CSV, PDF or PNG up to 10 MB.'}</small>
          <input type="file" multiple className="sr-only" onChange={(event) => setFiles([...(event.target.files ?? [])].map((f) => f.name))} />
        </label>
      </Card>

      <Card title="Validation" description="Errors appear after the first submit and are linked to their field with aria-describedby.">
        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="f-email">Work email</label>
            <input
              className="input"
              id="f-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={emailError}
              aria-describedby="f-email-msg"
            />
            <span id="f-email-msg" className={emailError ? 'field-error' : 'field-hint'}>
              {emailError ? 'Enter an email address like name@company.com.' : "We'll send the receipt here."}
            </span>
          </div>
          <div className="field">
            <label htmlFor="f-notes">Notes</label>
            <textarea className="input" id="f-notes" rows={3} placeholder="Optional" />
          </div>
          <div className="form-actions">
            <button type="reset" className="btn btn-ghost" onClick={() => setSubmitted(false)}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </Card>
    </>
  )
}
