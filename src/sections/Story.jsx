import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../context/LanguageContext.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function Story() {
  const ref = useRef(null)
  const { t, lang } = useLang()

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
        <span className="kicker">{t('st.kicker')}</span>
        <h2 className="story__title">{t('st.title')}</h2>
        <p className={`story__p${lang === 'ta' ? ' tamil' : ''}`}>{t('st.body')}</p>
        {lang === 'en' && (
          <p className="story__p tamil">
            கங்கயம் மண்ணில் இருந்து 60 ஆண்டுகளாக, முத்து வின் எஸ்.எஸ் பெயர்
            ஒவ்வொரு வீட்டிலும் நம்பிக்கையின் அடையாளமாக நிலைத்து நிற்கிறது.
          </p>
        )}
        <div className="rule" />
      </div>
    </section>
  )
}
