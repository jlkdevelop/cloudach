export default function Logo({ size = 32 }) {
  const h = size * 1.625
  return (
    <svg width={size} height={h} viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,26 14,4 28,26 14,48" fill="#4F6EF7" />
      <polygon points="14,4 28,26 42,4" fill="#7B96FF" />
      <polygon points="0,26 14,48 28,26" fill="#2E4FD4" />
      <polygon points="14,4 28,4 28,26" fill="#A0B4FF" opacity="0.7" />
      <polygon points="28,26 42,4 44,26 42,48" fill="#4F6EF7" opacity="0.4" />
    </svg>
  )
}
