import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Drives video.currentTime from the scroll progress of its parent .scrub
// container (which is taller than the viewport). The actual currentTime eases
// toward the scroll target each frame so seeking feels fluid, not jumpy.
export default function ScrubVideo({ src, poster, triggerRef, onProgress }) {
  const videoRef = useRef(null)
  const target = useRef(0)
  const current = useRef(0)
  const duration = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    const trigger = triggerRef.current
    if (!video || !trigger) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const setDuration = () => {
      duration.current = video.duration || 0
    }
    if (video.readyState >= 1) setDuration()
    else video.addEventListener('loadedmetadata', setDuration, { once: true })

    if (reduce) {
      video.preload = 'metadata'
      return
    }

    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        target.current = self.progress
        onProgress?.(self.progress)
      },
    })

    let raf
    const tick = () => {
      current.current += (target.current - current.current) * 0.12
      const t = current.current * (duration.current || 0)
      if (Number.isFinite(t)) {
        if (video.fastSeek) video.fastSeek(t)
        else video.currentTime = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      st.kill()
      video.removeEventListener('loadedmetadata', setDuration)
    }
  }, [triggerRef, onProgress])

  return (
    <video
      ref={videoRef}
      className="scrub__video"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
    />
  )
}
