import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance = null

// Smooth-scroll to a section by CSS selector, used by the nav. Falls back to
// native scrolling when Lenis is disabled (reduced motion).
export function scrollToId(selector) {
  const el = document.querySelector(selector)
  if (!el) return
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: -68 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

// Reason: keep Lenis smooth-scroll and GSAP ScrollTrigger driven by the same
// RAF loop so pinned scrub timing stays in sync with the inertial scroll.
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Don't intercept wheel/touch events that originate inside overlays
      // that own their own scroll (cart drawer, checkout). Without this,
      // Lenis swallows the event and the overlay's internal scroll never moves.
      prevent: (node) =>
        !!(node && node.closest && node.closest('.checkout, .cart, .orders, .auth, .locp, .care')),
    })
    lenisInstance = lenis

    const raf = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}
