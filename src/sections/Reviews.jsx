import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../context/LanguageContext.jsx'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '1000+', key: 'rv.stat.customers' },
  { value: '60+',   key: 'rv.stat.years' },
  { value: '4.9★',  key: 'rv.stat.rating' },
]

// 20 reviews across the Kongu belt + Nilgiris of Tamil Nadu.
const REVIEWS = [
  { quote: 'The rice cooks fluffy every single time. The aroma fills the whole house.', name: 'Lakshmi R.', place: 'Coimbatore' },
  { quote: 'Clean, sorted grains with zero stones. My mess customers always ask which rice I use!', name: 'Senthil Kumar', place: 'Tiruppur' },
  { quote: 'Ordered the 26kg bag for a wedding. Quality and delivery were both perfect.', name: 'Anitha M.', place: 'Erode' },
  { quote: 'Been buying for years now. Consistent quality, never disappointed.', name: 'Murugan S.', place: 'Salem' },
  { quote: 'Up here in the hills good rice is hard to find — MUTHU WIN SS delivers right to Ooty.', name: 'Priya N.', place: 'Ooty' },
  { quote: 'Soft, white and full of taste. Perfect for daily meals and special occasions.', name: 'Ramesh V.', place: 'Coonoor' },
  { quote: 'The Nei Kichadi Ponni is exactly like my grandmother used to cook with.', name: 'Kavitha P.', place: 'Mettupalayam' },
  { quote: 'Bulk ordered for our temple annadhanam. Everyone praised the rice quality.', name: 'Bala Subramani', place: 'Pollachi' },
  { quote: 'Fair price for premium quality. The 10kg pack lasts our family a full month.', name: 'Deepa K.', place: 'Karur' },
  { quote: 'Sortex sorted, no impurities. You can feel the difference in every grain.', name: 'Karthik R.', place: 'Namakkal' },
  { quote: 'Switched from another brand and never looking back. Truly the best rice.', name: 'Saravanan M.', place: 'Gobichettipalayam' },
  { quote: 'My biryani turned out restaurant-quality. Long, separate grains every time.', name: 'Fathima S.', place: 'Avinashi' },
  { quote: 'Delivery to Sathyamangalam was quick and the bag was perfectly sealed.', name: 'Vignesh T.', place: 'Sathyamangalam' },
  { quote: 'Trusted name in our town for decades. Quality you can rely on.', name: 'Meena L.', place: 'Bhavani' },
  { quote: 'Great for idli and dosa batter — ferments beautifully and stays soft.', name: 'Arun Prakash', place: 'Tiruchengode' },
  { quote: 'Ordered for my catering business. Customers can taste the premium quality.', name: 'Selvi R.', place: 'Dharapuram' },
  { quote: 'The grains stay firm and don’t turn mushy. Exactly what I wanted.', name: 'Manoj K.', place: 'Udumalaipettai' },
  { quote: 'Reasonable rates and always fresh stock. My go-to rice shop now.', name: 'Geetha S.', place: 'Palladam' },
  { quote: 'Excellent rice and friendly service. Highly recommend to every family.', name: 'Dinesh R.', place: 'Sulur' },
  { quote: 'From Mettur to my kitchen — reliable delivery and unbeatable taste.', name: 'Revathi M.', place: 'Mettur' },
]

function Stars() {
  return (
    <span className="review-card__stars" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => <span key={i}>★</span>)}
    </span>
  )
}

function ReviewCard({ r }) {
  return (
    <figure className="review-card">
      <Stars />
      <blockquote className="review-card__quote">&ldquo;{r.quote}&rdquo;</blockquote>
      <figcaption className="review-card__author">
        <span className="review-card__avatar" aria-hidden="true">{r.name.charAt(0)}</span>
        <span className="review-card__meta">
          <strong>{r.name}</strong>
          <span>{r.place}</span>
        </span>
      </figcaption>
    </figure>
  )
}

export default function Reviews() {
  const ref = useRef(null)
  const { t } = useLang()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.reviews__stat', {
        scrollTrigger: { trigger: '.reviews__stats', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  // Split into two rows that scroll in opposite directions for a lively wall.
  const half = Math.ceil(REVIEWS.length / 2)
  const rowA = REVIEWS.slice(0, half)
  const rowB = REVIEWS.slice(half)

  return (
    <section className="reviews" id="reviews" ref={ref}>
      <div className="reviews__inner">
        <div className="reviews__head">
          <span className="kicker">{t('rv.kicker')}</span>
          <h2 className="reviews__title">{t('rv.title')}</h2>
        </div>

        <div className="reviews__stats">
          {STATS.map((s) => (
            <div className="reviews__stat" key={s.key}>
              <strong className="reviews__stat-value">{s.value}</strong>
              <span className="reviews__stat-label">{t(s.key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Continuously moving marquee rows (full-bleed) */}
      <div className="reviews__marquee">
        <div className="reviews__track reviews__track--left">
          {[...rowA, ...rowA].map((r, i) => <ReviewCard key={`a-${i}`} r={r} />)}
        </div>
      </div>
      <div className="reviews__marquee">
        <div className="reviews__track reviews__track--right">
          {[...rowB, ...rowB].map((r, i) => <ReviewCard key={`b-${i}`} r={r} />)}
        </div>
      </div>
    </section>
  )
}
