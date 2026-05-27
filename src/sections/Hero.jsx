import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero({ videoSrc }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero__wordmark', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out' })
      gsap.from('.hero__sub', { y: 24, opacity: 0, duration: 1, delay: 0.25, ease: 'power3.out' })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <header className="hero" id="home" ref={ref}>
      <video className="hero__bg" src={videoSrc} muted playsInline autoPlay loop preload="auto" />
      <div className="hero__veil" />
      <div className="hero__inner">
        <h1 className="hero__wordmark">
          MUTHU WIN <span className="dot">·</span> SS <span className="dot">·</span> KANGAYAM
        </h1>
        <p className="hero__sub">
          27 Years of Excellence &nbsp;·&nbsp; <span className="tamil">27 ஆண்டுகால சிறப்பு</span>
        </p>
      </div>
    </header>
  )
}
