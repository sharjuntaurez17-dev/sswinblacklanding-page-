import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHIPS = ['26 kg', 'Sortex Rice', 'Ponni', '100% Satisfaction', 'Naturally Rich']

export default function Highlights({ bagSrc }) {
  const ref = useRef(null)

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
      gsap.from(['.highlights__title', '.highlights__lead'], {
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
        y: 30, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="highlights" ref={ref}>
      <div className="highlights__media">
        <img
          className="highlights__bag"
          src={bagSrc}
          alt="MUTHU WIN SS KANGAYAM 26kg premium sortex rice bag"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
        />
        <div className="bag-placeholder" style={{ display: 'none' }}>
          <span><i className="green">S</i><i className="red">S</i></span>
          <small>Drop your bag image at<br /><code>public/ss-win-bag.png</code></small>
        </div>
      </div>
      <div className="highlights__copy">
        <span className="kicker">Premium Sortex Ponni</span>
        <h2 className="highlights__title">Every grain, perfected.</h2>
        <p className="highlights__lead">
          Multi-stage Sortex colour sorting removes every impurity, leaving only
          clean, uniform, naturally rich Ponni grains — sealed fresh in our 26&nbsp;kg pack.
        </p>
        <div className="chips">
          {CHIPS.map((c) => (
            <span className="chip" key={c}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
