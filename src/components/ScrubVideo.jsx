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

    // Prime the decoder: briefly play+pause (muted) so the first frames are
    // decoded and the element always has a painted frame to show. Without this
    // the video can render blank until it has played once.
    const prime = () => {
      const p = video.play()
      if (p && p.then) p.then(() => video.pause()).catch(() => {})
      else video.pause()
    }
    if (video.readyState >= 2) prime()
    else video.addEventListener('loadeddata', prime, { once: true })

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

    // Throttle seeks to the decoder's pace: never start a new seek while one is
    // still in progress (that pile-up is what causes dropped/blank frames).
    let seeking = false
    const onSeeked = () => { seeking = false }
    video.addEventListener('seeked', onSeeked)

    let raf
    const tick = () => {
      current.current += (target.current - current.current) * 0.12
      const dur = duration.current || 0
      const t = current.current * dur
      // Reason: precise currentTime (not fastSeek) paints the exact frame; only
      // issue a seek when the previous one finished and the delta is meaningful.
      if (!seeking && dur && Number.isFinite(t) && Math.abs(video.currentTime - t) > 0.02) {
        seeking = true
        video.currentTime = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      st.kill()
      video.removeEventListener('loadedmetadata', setDuration)
      video.removeEventListener('loadeddata', prime)
      video.removeEventListener('seeked', onSeeked)
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
