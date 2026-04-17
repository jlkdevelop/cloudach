export default function Logo({ size = 40 }) {
  const aspect = 650 / 356
  const width = Math.round(size * aspect)
  return (
    <img
      src="/brand/cloudarch-neon.png"
      alt="Cloudarch"
      width={width}
      height={size}
      draggable={false}
      style={{ display: 'block', width, height: size }}
    />
  )
}
