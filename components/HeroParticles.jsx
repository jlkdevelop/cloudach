import { useEffect, useRef } from 'react'

const COUNT = 16
const rand = (a, b) => a + Math.random() * (b - a)

function makeParticle(cw, ch) {
  const angle = Math.random() * Math.PI * 2
  const speed = rand(0.20, 0.55)
  return {
    x: rand(0, cw),
    y: rand(0, ch),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: rand(3, 6),
    alpha: rand(0.55, 1.0),
    glow: Math.random() > 0.55,
  }
}

export default function HeroParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 900) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let raf
    let particles = []
    let zone = null

    function measure() {
      const cRect = canvas.getBoundingClientRect()
      canvas.width = Math.round(cRect.width)
      canvas.height = Math.round(cRect.height)

      const term = document.querySelector('.da-wrap')
      if (term) {
        const t = term.getBoundingClientRect()
        zone = {
          x: t.left - cRect.left,
          y: t.top - cRect.top,
          w: t.width,
          h: t.height,
        }
      }
    }

    function init() {
      measure()
      particles = Array.from({ length: COUNT }, () =>
        makeParticle(canvas.width, canvas.height)
      )
    }

    function tick() {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        // Advance
        p.x += p.vx
        p.y += p.vy

        // Canvas edge bounce
        if (p.x - p.r < 0)  { p.x = p.r;     p.vx =  Math.abs(p.vx) }
        if (p.x + p.r > W)  { p.x = W - p.r; p.vx = -Math.abs(p.vx) }
        if (p.y - p.r < 0)  { p.y = p.r;     p.vy =  Math.abs(p.vy) }
        if (p.y + p.r > H)  { p.y = H - p.r; p.vy = -Math.abs(p.vy) }

        // Terminal zone bounce — push particle back to nearest edge
        if (zone) {
          const pad = 20
          const zx  = zone.x - pad
          const zy  = zone.y - pad
          const zx2 = zone.x + zone.w + pad
          const zy2 = zone.y + zone.h + pad

          if (p.x > zx && p.x < zx2 && p.y > zy && p.y < zy2) {
            const dL = p.x - zx
            const dR = zx2 - p.x
            const dT = p.y - zy
            const dB = zy2 - p.y
            const min = Math.min(dL, dR, dT, dB)

            if (min === dL)       { p.x = zx - p.r;        p.vx = -Math.abs(p.vx) }
            else if (min === dR)  { p.x = zx2 + p.r;       p.vx =  Math.abs(p.vx) }
            else if (min === dT)  { p.y = zy - p.r;        p.vy = -Math.abs(p.vy) }
            else                  { p.y = zy2 + p.r;       p.vy =  Math.abs(p.vy) }
          }
        }

        // Draw
        ctx.save()
        if (p.glow) {
          ctx.shadowColor = 'rgba(255,255,255,0.45)'
          ctx.shadowBlur = p.r * 6
        }
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(tick)
    }

    // Re-measure when hero resizes (orientation change, window resize)
    const ro = new ResizeObserver(measure)
    ro.observe(canvas.parentElement)

    init()
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
