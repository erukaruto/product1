export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect className="logo-bg" width="32" height="32" rx="8" />
      <circle className="logo-fg" cx="11" cy="16" r="3.2" />
      <path className="logo-stroke" d="M16.5 10.5a7.5 7.5 0 0 1 0 11M20.5 7a12.5 12.5 0 0 1 0 18" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="brand">
      <LogoMark />
      <span>Beacon</span>
    </span>
  )
}
