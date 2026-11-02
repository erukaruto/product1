import { useState } from 'react'
import { Link } from 'react-router'
import { Card, Dropdown, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { savedReports, type SavedReport } from '../../data/reports.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const METRIC: Record<SavedReport['metric'], string> = { mrr: 'MRR', customers: 'Customers', churn: 'Churn rate', arpa: 'ARPA' }
const SCHEDULE: Record<SavedReport['schedule'], string> = { none: 'Not scheduled', weekly: 'Every Monday', monthly: 'First of the month' }

export default function SavedReports() {
  usePageTitle('Saved reports')
  const toast = useToast()
  const [reports, setReports] = useState(savedReports)

  return (
    <>
      <PageHeader
        title="Saved reports"
        description="Reports your team saved from the report builder. Scheduled reports are emailed as CSV."
        actions={
          <Link className="btn btn-primary" to="/reports/builder">
            <Icon name="plus" size={16} />
            New report
          </Link>
        }
      />
      <Card flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Report</th>
                <th scope="col">Metric</th>
                <th scope="col">Owner</th>
                <th scope="col">Schedule</th>
                <th scope="col">Last run</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="row-link" to={`/reports/builder?metric=${r.metric}&group=${r.groupBy}`}>
                      {r.name}
                    </Link>
                  </td>
                  <td>
                    {METRIC[r.metric]} <span className="muted">by {r.groupBy}</span>
                  </td>
                  <td className="muted">{r.owner}</td>
                  <td className="muted" data-testid={`schedule-${r.id}`}>{SCHEDULE[r.schedule]}</td>
                  <td className="muted">{r.lastRun}</td>
                  <td className="num">
                    <Dropdown
                      label={`Actions for ${r.name}`}
                      items={[
                        { label: 'Run now', icon: 'refresh', onSelect: () => toast({ title: `${r.name} is ready`, description: 'CSV sent to your email.' }) },
                        {
                          label: r.schedule === 'weekly' ? 'Stop weekly email' : 'Email every Monday',
                          icon: 'mail',
                          onSelect: () => {
                            const next = r.schedule === 'weekly' ? 'none' : 'weekly'
                            setReports((list) => list.map((x) => (x.id === r.id ? { ...x, schedule: next } : x)))
                            toast({ title: next === 'weekly' ? 'Scheduled every Monday' : 'Schedule removed' })
                          },
                        },
                        {
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          onSelect: () => {
                            setReports((list) => list.filter((x) => x.id !== r.id))
                            toast({ title: 'Report deleted', tone: 'info' })
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
