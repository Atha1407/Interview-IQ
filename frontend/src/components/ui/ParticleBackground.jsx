import React, { useEffect, useRef } from 'react'

const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return { r: 124, g: 143, b: 178 }
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('')
  }
  const num = parseInt(c, 16)
  if (isNaN(num)) return { r: 124, g: 143, b: 178 }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export const ParticleBackground = ({
  color = '#7C8FB2',
  particleCount = 75,
  maxDistance = 120,
  className = '',
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { r, g, b } = hexToRgb(color)
    // Secondary indigo tint for particle color variation
    const secondaryRgb = { r: 129, g: 140, b: 248 }

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Mouse tracking
    const mouse = { x: -1000, y: -1000, radius: 150 }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Particle definition with size/opacity/glow variation
    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.28
        this.vy = (Math.random() - 0.5) * 0.28
        this.radius = Math.random() * 1.6 + 0.9
        this.baseAlpha = Math.random() * 0.35 + 0.18
        this.alpha = this.baseAlpha
        this.pulseSpeed = Math.random() * 0.015 + 0.005
        this.pulseAngle = Math.random() * Math.PI * 2
        this.isGlowing = Math.random() > 0.65
        this.useSecondaryColor = Math.random() > 0.7
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Wrap boundaries smoothly
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0

        // Organic pulse oscillation
        this.pulseAngle += this.pulseSpeed
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.08

        // Mouse reaction
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius
          this.x -= (dx / dist) * force * 0.45
          this.y -= (dy / dist) * force * 0.45
        }
      }

      draw() {
        const activeRgb = this.useSecondaryColor ? secondaryRgb : { r, g, b }
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)

        if (this.isGlowing) {
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}, 0.6)`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${activeRgb.r}, ${activeRgb.g}, ${activeRgb.b}, ${Math.max(0.1, this.alpha)})`
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Responsive density scaling
    const targetCount = Math.min(particleCount, Math.floor((width * height) / 10500))
    const particles = Array.from({ length: Math.max(30, targetCount) }, () => new Particle())

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw subtle ambient background glows
      const glowGrad1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 10, width * 0.2, height * 0.25, width * 0.45)
      glowGrad1.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.035)`)
      glowGrad1.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad1
      ctx.fillRect(0, 0, width, height)

      const glowGrad2 = ctx.createRadialGradient(width * 0.8, height * 0.65, 10, width * 0.8, height * 0.65, width * 0.4)
      glowGrad2.addColorStop(0, `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.03)`)
      glowGrad2.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad2
      ctx.fillRect(0, 0, width, height)

      // Update and draw particles + vector connections
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`
            ctx.lineWidth = 0.65
            ctx.stroke()
          }
        }

        // Draw line to mouse cursor when close
        const dxMouse = particles[i].x - mouse.x
        const dyMouse = particles[i].y - mouse.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
        if (distMouse < mouse.radius) {
          const lineAlpha = (1 - distMouse / mouse.radius) * 0.2
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`
          ctx.lineWidth = 0.85
          ctx.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [color, particleCount, maxDistance])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  )
}

export default ParticleBackground
