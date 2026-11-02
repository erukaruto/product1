// Marketing site URL (SaaSDrop). Set VITE_SITE_URL in .env, see .env.example.
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
