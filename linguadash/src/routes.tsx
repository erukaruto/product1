/*
  Route registry. Every screen is listed once here; App.tsx builds the router from it
  and /screens shows the same list. Pages load lazily per module (one chunk per area).
*/
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface Screen {
  path: string
  title: string
  group: string
  /** Concrete URL for dynamic paths (used by /screens and the test suite). */
  sample?: string
  layout: 'app' | 'auth'
  Component: LazyExoticComponent<ComponentType>
}

function page<M>(loader: () => Promise<M>, name: keyof M) {
  return lazy(async () => ({ default: (await loader())[name] as ComponentType }))
}

const auth = () => import('./pages/auth.tsx')
const errors = () => import('./pages/errors.tsx')
const screens = () => import('./pages/screens.tsx')

export const SCREENS: Screen[] = [
  { path: '/login', title: 'Masuk', group: 'Auth', layout: 'auth', Component: page(auth, 'Login') },
  { path: '/', title: 'Overview', group: 'Overview', layout: 'app', Component: page(screens, 'Screens') },
  { path: '/screens', title: 'Semua layar', group: 'Lainnya', layout: 'app', Component: page(screens, 'Screens') },
  { path: '/403', title: 'Akses ditolak (403)', group: 'Error', layout: 'app', Component: page(errors, 'Forbidden') },
  { path: '/500', title: 'Kesalahan server (500)', group: 'Error', layout: 'app', Component: page(errors, 'ServerError') },
]

export const NotFoundPage = page(errors, 'NotFound')
