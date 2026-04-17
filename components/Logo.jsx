export default function Logo({ size = 32, monochrome = false }) {
  const aspect = 650 / 356
  const width = Math.round(size * aspect)
  return (
    <img
      src="/brand/cloudarch-neon.png"
      alt="Cloudarch"
      width={width}
      height={size}
      draggable={false}
      style={{
        display: 'block',
        width,
        height: size,
        filter: monochrome ? 'brightness(0) invert(1)' : undefined,
      }}
    />
  )
}
