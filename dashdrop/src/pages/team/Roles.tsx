import { Card, PageHeader } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { members, PERMISSIONS, ROLES } from '../../data/workspace.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function Roles() {
  usePageTitle('Roles & permissions')
  return (
    <>
      <PageHeader title="Roles & permissions" description="What each role can do. Change someone's role on the Team page." />
      <div className="role-cards">
        {ROLES.map((role) => (
          <Card key={role.name} title={role.name} description={role.description}>
            <p className="muted small">
              {members.filter((m) => m.role === role.name).length} members · {role.allowed.length} of {PERMISSIONS.length} permissions
            </p>
          </Card>
        ))}
      </div>
      <Card title="Permission matrix" flush>
        <div className="table-scroll">
          <table className="table matrix">
            <thead>
              <tr>
                <th scope="col">Permission</th>
                {ROLES.map((role) => (
                  <th key={role.name} scope="col" className="center">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <tr key={permission}>
                  <th scope="row">{permission}</th>
                  {ROLES.map((role) => {
                    const allowed = role.allowed.includes(permission)
                    return (
                      <td key={role.name} className="center">
                        {allowed ? (
                          <>
                            <Icon name="check" size={16} className="text-good" />
                            <span className="sr-only">Allowed</span>
                          </>
                        ) : (
                          <>
                            <span className="muted" aria-hidden="true">-</span>
                            <span className="sr-only">Not allowed</span>
                          </>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
