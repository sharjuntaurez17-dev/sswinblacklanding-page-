import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PACKS } from '../lib/product.js'
import { useLang } from '../context/LanguageContext.jsx'

gsap.registerPlugin(ScrollTrigger)

const CHIP_KEYS = ['hi.chip1', 'hi.chip2', 'hi.chip3', 'hi.chip4']

export default function Highlights({ bagSrc }) {
  const ref = useRef(null)
  const { t } = useLang()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.highlights__bag', {
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
      })
      gsap.to('.chip', {
        scrollTrigger: { trigger: '.chips', start: 'top 85%' },
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      })
      gsap.from(['.highlights__title', '.highlights__lead', '.highlights__packs'], {
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="highlights" id="product" ref={ref}>
      {/* Left: copy + Buy Now */}
      <div className="highlights__copy">
        <span className="kicker">{t('hi.kicker')}</span>
        <h2 className="highlights__title">{t('hi.title')}</h2>
        <p className="highlights__lead">{t('hi.lead')}</p>
        <div className="chips">
          {CHIP_KEYS.map((c) => (
            <span className="chip" key={c}>{t(c)}</span>
          ))}
        </div>
        <div className="highlights__packs">
          {PACKS.map((p) => (
            <div className="pack" key={p.size}>
              <span className="pack__size">{p.size}</span>
              <span className="pack__price">₹{p.price.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: bag image */}
      <div className="highlights__media">
        <img
          className="highlights__bag"
          src={bagSrc}
          alt="MUTHU WIN SS KANGAYAM Nei Kichadi Ponni premium rice bag"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
        />
        <div className="bag-placeholder" style={{ display: 'none' }}>
          <span><i className="green">S</i><i className="red">S</i></span>
          <small>Drop your bag image at<br /><code>public/ss-win-bag.png</code></small>
        </div>
      </div>
    </section>
  )
}
