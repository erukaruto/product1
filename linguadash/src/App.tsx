import { Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { AppLayout } from './components/Layout.tsx'
import { Skeleton } from './components/ui.tsx'
import { NotFoundPage, SCREENS } from './routes.tsx'

function Loading() {
  return (
    <div className="card panel" aria-busy="true" aria-label="Memuat halaman">
      <Skeleton lines={4} />
    </div>
  )
}

/** Scrolls to the top after client-side navigation (page titles are set by PageHeader / useTitle). */
function RouteEffects() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        {SCREENS.filter((s) => s.layout === 'auth').map(({ path, Component }) => (
          <Route key={path} path={path} element={<Suspense fallback={null}><Component /></Suspense>} />
        ))}
        <Route element={<AppLayout />}>
          {SCREENS.filter((s) => s.layout === 'app').map(({ path, Component }) => (
            <Route key={path} path={path} element={<Suspense fallback={<Loading />}><Component /></Suspense>} />
          ))}
          <Route path="*" element={<Suspense fallback={<Loading />}><NotFoundPage /></Suspense>} />
        </Route>
      </Routes>
    </>
  )
}
