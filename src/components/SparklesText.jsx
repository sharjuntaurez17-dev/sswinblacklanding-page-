import { useEffect, useState } from 'react'

// CSS-animation port of the framer-motion SparklesText component.
// Same behaviour — random sparkle stars that fade/scale/rotate around the text
// and recycle on a lifespan — but driven by CSS keyframes (see `@keyframes
// sparkleText` in base.css) so it needs no extra dependency.

const STAR_PATH =
  'M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z'

export default function SparklesText({
  text,
  // Brand gold palette instead of the demo purple/pink. White for extra pop.
  colors = { first: '#d4af37', second: '#f5e6c3' },
  sparklesCount = 12,
  className = '',
  children,
}) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    const generateStar = () => ({
      id: `${Math.random()}-${Date.now()}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: Math.random() > 0.5 ? colors.first : colors.second,
      delay: Math.random() * 2,
      scale: Math.random() * 1 + 0.3,
      lifespan: Math.random() * 10 + 5,
    })

    setSparkles(Array.from({ length: sparklesCount }, generateStar))

    const interval = setInterval(() => {
      setSparkles((curr) =>
        curr.map((s) => (s.lifespan <= 0 ? generateStar() : { ...s, lifespan: s.lifespan - 0.1 }))
      )
    }, 100)

    return () => clearInterval(interval)
  }, [colors.first, colors.second, sparklesCount])

  return (
    <span className={`sparkles-text ${className}`}>
      <span className="sparkles-text__inner">
        {sparkles.map((s) => (
          <svg
            key={s.id}
            className="sparkles-text__star"
            style={{
              left: s.x,
              top: s.y,
              animationDelay: `${s.delay}s`,
              '--spark-scale': s.scale,
            }}
            width="18"
            height="18"
            viewBox="0 0 21 21"
            aria-hidden="true"
          >
            <path d={STAR_PATH} fill={s.color} />
          </svg>
        ))}
        <strong className="sparkles-text__label">{children ?? text}</strong>
      </span>
    </span>
  )
}
