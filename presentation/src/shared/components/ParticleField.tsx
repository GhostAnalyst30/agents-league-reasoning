import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
}

interface ParticleFieldProps {
  count?: number
  burst?: boolean
  className?: string
}

export default function ParticleField({ count = 80, burst = false, className = '' }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#38bdf8', '#6366f1', '#22d3ee', '#818cf8']
    particlesRef.current = Array.from({ length: count }, () => ({
      x: burst ? canvas.width / 2 : Math.random() * canvas.width,
      y: burst ? canvas.height / 2 : Math.random() * canvas.height,
      vx: burst ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 0.4,
      vy: burst ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        if (!burst) {
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        } else {
          p.alpha *= 0.985
          p.vx *= 0.98
          p.vy *= 0.98
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [count, burst])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    />
  )
}
