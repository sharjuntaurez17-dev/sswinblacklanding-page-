import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Story() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.story__inner > *', {
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        y: 30, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="story" id="about" ref={ref}>
      <div className="story__inner">
        <span className="kicker">Since 1963</span>
        <h2 className="story__title">Six decades of milling excellence.</h2>
        <p className="story__p">
          From the heart of Kangayam, the MUTHU WIN SS name has stood for trust on
          every kitchen shelf for over 60 years — bringing families premium, naturally
          rich Nei Kichadi Ponni rice, milled and Sortex-sorted to an uncompromising standard.
        </p>
        <p className="story__p tamil">
          கங்கயம் மண்ணில் இருந்து 60 ஆண்டுகளாக, முத்து வின் எஸ்.எஸ் பெயர்
          ஒவ்வொரு வீட்டிலும் நம்பிக்கையின் அடையாளமாக நிலைத்து நிற்கிறது.
        </p>
        <div className="rule" />
      </div>
    </section>
  )
}
