import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { PRODUCT } from '../lib/product.js'
import { getOrders } from '../lib/localOrders.js'

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return '' }
}

export default function Orders() {
  const { isOrdersOpen, closeOrders, openTrack } = useCart()
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
        <h2 className="checkout__title">Your Orders</h2>
        <button className="checkout__close" onClick={closeOrders} aria-label="Close">×</button>
      </div>

      <div className="checkout__body">
        <div className="orders__wrap">
          {orders.length === 0 ? (
            <div className="orders__empty">
              <div className="orders__empty-mark" aria-hidden="true">✦</div>
              <h3>No orders yet</h3>
              <p>
                Once you place your first order it'll show up here, with the order ID and a
                shortcut to track it.
              </p>
              <button className="co-place" onClick={closeOrders}>Browse the shop</button>
            </div>
          ) : (
            <>
              <div className="orders__head">
                <span className="orders__count">
                  {orders.length} order{orders.length === 1 ? '' : 's'} on this device
                </span>
              </div>

              <ul className="orders__list">
                {orders.map((o) => (
                  <li key={o.orderId} className="order-card">
                    <header className="order-card__head">
                      <div>
                        <span className="order-card__label">Order ID</span>
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
                            <span>{it.size} &nbsp;·&nbsp; Qty {it.qty} &nbsp;·&nbsp; ₹{it.price.toLocaleString('en-IN')} / bag</span>
                          </div>
                          <span className="order-card__item-total">₹{it.subtotal.toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>

                    <footer className="order-card__foot">
                      <div className="order-card__total">
                        <span>Total</span>
                        <strong>₹{(o.subtotal ?? 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="order-card__actions">
                        <button
                          type="button"
                          className="co-place order-card__btn"
                          onClick={() => openTrack(o.orderId)}
                        >
                          Track
                        </button>
                      </div>
                    </footer>
                  </li>
                ))}
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
