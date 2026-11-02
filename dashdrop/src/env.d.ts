interface ImportMetaEnv {
  /** URL of the marketing site (SaaSDrop). See .env.example. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
