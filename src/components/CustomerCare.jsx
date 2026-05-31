import { useEffect } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

// Customer care contact details — edit with the real numbers / email / hours.
const CARE = {
  phone: '919876543210',
  whatsapp: '919876543210',
  email: 'care@muthuwinss.com',
  hours: 'Mon – Sat, 9 AM – 7 PM',
}

export default function CustomerCare() {
  const { isCareOpen, closeCare } = useCart()
  const { t } = useLang()

  useEffect(() => {
    if (!isCareOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isCareOpen])

  if (!isCareOpen) return null

  return (
    <div className="care" role="dialog" aria-modal="true" aria-label="Customer care">
      <div className="checkout__head">
        <a className="checkout__brand" href="#home" onClick={closeCare} aria-label="Home">
          <img className="checkout__logo" src="/winss-logo.webp" alt="" />
        </a>
        <h2 className="checkout__title">{t('care.title')}</h2>
        <button className="checkout__close" onClick={closeCare} aria-label="Close">×</button>
      </div>

      <div className="checkout__body">
        <div className="care__wrap">
          <p className="care__lead">{t('care.lead')}</p>

          <div className="care__cards">
            <a className="care__card" href={`tel:+${CARE.phone}`}>
              <span className="care__icon" aria-hidden="true">✆</span>
              <span className="care__card-body">
                <strong>{t('care.call')}</strong>
                <span>+91 {CARE.phone.slice(2)}</span>
              </span>
            </a>

            <a
              className="care__card"
              href={`https://wa.me/${CARE.whatsapp}?text=${encodeURIComponent('Hi, I need help with my order.')}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="care__icon care__icon--wa" aria-hidden="true">✆</span>
              <span className="care__card-body">
                <strong>{t('care.whatsapp')}</strong>
                <span>+91 {CARE.whatsapp.slice(2)}</span>
              </span>
            </a>

            <a className="care__card" href={`mailto:${CARE.email}`}>
              <span className="care__icon" aria-hidden="true">✉</span>
              <span className="care__card-body">
                <strong>{t('care.email')}</strong>
                <span>{CARE.email}</span>
              </span>
            </a>
          </div>

          <p className="care__hours"><span>{t('care.hours')}</span> {CARE.hours}</p>
        </div>
      </div>
    </div>
  )
}
