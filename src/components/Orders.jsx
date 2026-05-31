import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { PRODUCT } from '../lib/product.js'
import { getOrders, isDelivered } from '../lib/localOrders.js'
import { useLang } from '../context/LanguageContext.jsx'

// Green check-circle (recreates the delivered logo as an inline SVG).
function DeliveredIcon() {
  return (
    <svg className="delivered-badge__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#6cbf3f" />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return '' }
}

export default function Orders() {
  const { isOrdersOpen, closeOrders, openTrack } = useCart()
  const { t } = useLang()
  const [orders, setOrders] = useState([])

  // Lock background scroll while the overlay is open
  useEffect(() => {
    if (!isOrdersOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOrdersOpen])

  // Reload from localStorage every time the overlay opens
  useEffect(() => {
    if (isOrdersOpen) setOrders(getOrders())
  }, [isOrdersOpen])

  if (!isOrdersOpen) return null

  return (
    <div className="checkout orders" role="dialog" aria-modal="true" aria-label="Your orders">
      <div className="checkout__head">
        <a className="checkout__brand" href="#home" onClick={closeOrders} aria-label="Home">
          <img className="checkout__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
        </a>
        <h2 className="checkout__title">{t('or.title')}</h2>
        <button className="checkout__close" onClick={closeOrders} aria-label="Close">×</button>
      </div>

      <div className="checkout__body">
        <div className="orders__wrap">
          {orders.length === 0 ? (
            <div className="orders__empty">
              <div className="orders__empty-mark" aria-hidden="true">✦</div>
              <h3>{t('or.empty')}</h3>
              <p>{t('or.emptyDesc')}</p>
              <button className="co-place" onClick={closeOrders}>{t('or.browse')}</button>
            </div>
          ) : (
            <>
              <div className="orders__head">
                <span className="orders__count">
                  {orders.length} {orders.length === 1 ? t('or.count') : t('or.countPlural')}
                </span>
              </div>

              <ul className="orders__list">
                {orders.map((o) => {
                  const delivered = isDelivered(o)
                  return (
                  <li key={o.orderId} className="order-card">
                    <header className="order-card__head">
                      <div>
                        <span className="order-card__label">{t('or.orderId')}</span>
                        <strong className="order-card__id">{o.orderId}</strong>
                      </div>
                      <span className="order-card__date">{fmtDate(o.placedAt)}</span>
                    </header>

                    {(o.name || o.address) && (
                      <div className="order-card__ship">
                        <span className="order-card__ship-label">{t('or.deliverTo')}</span>
                        <div className="order-card__ship-body">
                          {o.name && (
                            <strong className="order-card__ship-name">
                              {o.name}{o.phone ? ` · +91 ${o.phone}` : ''}
                            </strong>
                          )}
                          {(o.address || o.city || o.pincode) && (
                            <span className="order-card__ship-addr">
                              {[o.address, o.city, o.pincode].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <ul className="order-card__items">
                      {(o.items || []).map((it) => (
                        <li key={it.size} className="order-card__item">
                          <img src={PRODUCT.image} alt="" />
                          <div className="order-card__item-info">
                            <strong>{PRODUCT.shortName}</strong>
                            <span>{it.size} &nbsp;·&nbsp; {t('common.qty')} {it.qty} &nbsp;·&nbsp; ₹{it.price.toLocaleString('en-IN')} {t('cart.perBag')}</span>
                          </div>
                          <span className="order-card__item-total">₹{it.subtotal.toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>

                    <footer className="order-card__foot">
                      <div className="order-card__total">
                        <span>{t('or.total')}</span>
                        <strong>₹{(o.subtotal ?? 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="order-card__actions">
                        {delivered ? (
                          <span className="delivered-badge">
                            <DeliveredIcon />
                            {t('or.delivered')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="co-place order-card__btn"
                            onClick={() => openTrack(o.orderId)}
                          >
                            {t('or.track')}
                          </button>
                        )}
                      </div>
                    </footer>
                  </li>
                  )
                })}
              </ul>

              <p className="orders__note">
                Orders are saved on this device only. We never store them in your browser
                across devices — for shared family orders please share the order ID.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
