export default function Logo({ size = 32, monochrome = false }) {
  const h = size * 1.625

  const c = {
    base:      monochrome ? '#ffffff'               : '#ffffff',
    light:     monochrome ? 'rgba(255,255,255,0.7)' : '#7B96FF',
    dark:      monochrome ? 'rgba(255,255,255,0.45)': '#2E4FD4',
    highlight: monochrome ? 'rgba(255,255,255,0.55)': '#A0B4FF',
    faint:     monochrome ? 'rgba(255,255,255,0.25)': '#ffffff',
  }

  return (
    <svg width={size} height={h} viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,26 14,4 28,26 14,48"   fill={c.base} />
      <polygon points="14,4 28,26 42,4"           fill={c.light} />
      <polygon points="0,26 14,48 28,26"          fill={c.dark} />
      <polygon points="14,4 28,4 28,26"           fill={c.highlight} opacity="0.7" />
      <polygon points="28,26 42,4 44,26 42,48"    fill={c.faint} opacity="0.4" />
    </svg>
  )
}
