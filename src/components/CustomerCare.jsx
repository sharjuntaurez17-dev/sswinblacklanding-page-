import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { PRODUCT } from '../lib/product.js'
import { getOrders } from '../lib/localOrders.js'
import { shopForPincode } from '../lib/pricing.js'
import { createTicket, getTickets, ticketStatus } from '../lib/tickets.js'
import { saveFeedback } from '../lib/feedback.js'

const CARE = {
  phone: '918122361187',
  whatsapp: '918122361187',
  hours: 'Mon – Sat, 9 AM – 7 PM',
}

function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

export default function CustomerCare() {
  const { isCareOpen, closeCare } = useCart()
  const { t } = useLang()

  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [openId, setOpenId] = useState(null)   // which order card is expanded
  const [message, setMessage] = useState('')
  // per-ticket feedback drafts
  const [rating, setRating] = useState({})      // { ticketId: n }
  const [hover, setHover] = useState({})        // { ticketId: n }
  const [improve, setImprove] = useState({})    // { ticketId: text }
  const [rated, setRated] = useState({})        // { ticketId: true }

  useEffect(() => {
    if (!isCareOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isCareOpen])

  useEffect(() => {
    if (isCareOpen) {
      setOrders(getOrders()); setTickets(getTickets())
      setOpenId(null); setMessage('')
      setRating({}); setHover({}); setImprove({}); setRated({})
    }
  }, [isCareOpen])

  if (!isCareOpen) return null

  const ticketForOrder = (orderId) =>
    tickets.find((tk) => tk.orderId === orderId) || null

  const raise = (order) => {
    if (!message.trim()) return
    createTicket({ orderId: order.orderId, message })
    setTickets(getTickets())
    setMessage('')
    setOpenId(null)
  }

  const submitRating = (tk) => {
    const r = rating[tk.id]
    if (!r) return
    saveFeedback({ rating: r, message: improve[tk.id] || '', orderId: tk.orderId, ticketId: tk.id })
    setRated((m) => ({ ...m, [tk.id]: true }))
  }

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
          {/* Contact: phone (main) + email */}
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
          </div>
          <p className="care__hours"><span>{t('care.hours')}</span> {CARE.hours}</p>

          {/* Orders → tap to raise a ticket */}
          <div className="care__orders-head">{t('care.raise')}</div>

          {orders.length === 0 ? (
            <p className="care__none">{t('care.noOrders')}</p>
          ) : (
            <ul className="care__orders">
              {orders.map((o) => {
                const tk = ticketForOrder(o.orderId)
                const st = tk ? ticketStatus(tk) : null
                const shop = shopForPincode(o.pincode)
                const expanded = openId === o.orderId
                return (
                  <li key={o.orderId} className="order-card care__order">
                    {/* clickable header */}
                    <button
                      type="button"
                      className="care__order-toggle"
                      onClick={() => { setOpenId(expanded ? null : o.orderId); setMessage('') }}
                    >
                      <header className="order-card__head">
                        <div>
                          <span className="order-card__label">{t('or.orderId')}</span>
                          <strong className="order-card__id">{o.orderId}</strong>
                        </div>
                        <span className="order-card__date">{fmtDate(o.placedAt)}</span>
                      </header>
                      <ul className="order-card__items">
                        {(o.items || []).map((it) => (
                          <li key={it.size} className="order-card__item">
                            <img src={PRODUCT.image} alt="" />
                            <div className="order-card__item-info">
                              <strong>{PRODUCT.shortName}</strong>
                              <span>{it.size} &nbsp;·&nbsp; {t('common.qty')} {it.qty}</span>
                            </div>
                            <span className="order-card__item-total">₹{it.subtotal.toLocaleString('en-IN')}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="order-card__foot">
                        <div className="order-card__total">
                          <span>{t('or.total')}</span>
                          <strong>₹{(o.subtotal ?? 0).toLocaleString('en-IN')}</strong>
                        </div>
                        {tk ? (
                          <span className={`care__badge care__badge--${st}`}>
                            {st === 'closed' ? t('care.closed') : t('care.raisedStatus')}
                          </span>
                        ) : (
                          <span className="care__raise-hint">{expanded ? '▲' : t('care.raiseFor')}</span>
                        )}
                      </div>
                    </button>

                    {/* ticket form (no ticket yet, expanded) */}
                    {!tk && expanded && (
                      <div className="care__panel">
                        <a className="care__shopcall" href={`tel:+${shop.phone}`}>
                          ✆ {t('loc.callShop')} · {shop.name}
                        </a>
                        <label className="co-field">
                          <span>{t('care.issue')}<i>*</i></span>
                          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder={t('care.issuePlaceholder')} />
                        </label>
                        <button className="co-place" disabled={!message.trim()} onClick={() => raise(o)}>
                          {t('care.submitTicket')}
                        </button>
                      </div>
                    )}

                    {/* existing ticket: id + status (+ rate after closed) */}
                    {tk && (
                      <div className="care__panel">
                        <div className="care__ticket-row">
                          <span className="care__ticket-label">{t('care.ticketNo')}</span>
                          <strong className="care__ticket-id-inline">{tk.id}</strong>
                        </div>
                        <p className="care__ticket-msg">“{tk.message}”</p>
                        <a className="care__shopcall" href={`tel:+${shop.phone}`}>
                          ✆ {t('loc.callShop')}
                        </a>

                        {st === 'closed' && (
                          rated[tk.id] ? (
                            <p className="care__rated">★ {t('care.rateThanks')}</p>
                          ) : (
                            <div className="care__rate">
                              <span className="care__rate-label">{t('care.howWas')}</span>
                              <div className="care__stars" role="radiogroup" aria-label="Rating">
                                {[1,2,3,4,5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    className={`care__star${n <= (hover[tk.id] || rating[tk.id] || 0) ? ' is-on' : ''}`}
                                    onMouseEnter={() => setHover((m) => ({ ...m, [tk.id]: n }))}
                                    onMouseLeave={() => setHover((m) => ({ ...m, [tk.id]: 0 }))}
                                    onClick={() => setRating((m) => ({ ...m, [tk.id]: n }))}
                                    aria-label={`${n} star`}
                                  >★</button>
                                ))}
                              </div>
                              <textarea
                                className="care__improve"
                                value={improve[tk.id] || ''}
                                onChange={(e) => setImprove((m) => ({ ...m, [tk.id]: e.target.value }))}
                                rows={2}
                                placeholder={t('care.improvePlaceholder')}
                              />
                              <button className="co-place" disabled={!rating[tk.id]} onClick={() => submitRating(tk)}>
                                {t('care.submitRating')}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
