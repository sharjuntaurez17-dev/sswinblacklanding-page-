import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { PRODUCT } from '../lib/product.js'

export default function CartDrawer() {
  const {
    lines, totalQty, subtotal,
    inc, dec, setQty,
    isOpen, closeCart,
    openCheckout,
  } = useCart()
  const { t } = useLang()

  const checkout = () => openCheckout()

  return (
    <>
      <div className={`cart-overlay${isOpen ? ' is-open' : ''}`} onClick={closeCart} />
      <aside className={`cart${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="cart__head">
          <h3>{t('cart.title')}</h3>
          <button className="cart__close" onClick={closeCart} aria-label="Close cart">×</button>
        </div>

        <div className="cart__lines">
          {lines.map((line) => (
            <div key={line.size} className="cart__line">
              <img src={PRODUCT.image} alt={`${PRODUCT.shortName} ${line.size}`} />
              <div className="cart__line-info">
                <strong>{PRODUCT.shortName}</strong>
                <span className="cart__line-size">{line.size}</span>
                <span className="cart__line-price">₹{line.price.toLocaleString('en-IN')} {t('cart.perBag')}</span>

                <div className="cart__qty">
                  <button onClick={() => dec(line.size)} aria-label={`Decrease ${line.size}`}>−</button>
                  <input
                    value={line.qty}
                    onChange={(e) => setQty(line.size, e.target.value)}
                    inputMode="numeric"
                    aria-label={`${line.size} quantity`}
                  />
                  <button onClick={() => inc(line.size)} aria-label={`Increase ${line.size}`}>+</button>
                </div>
              </div>
              <div className="cart__line-subtotal">
                ₹{line.subtotal.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        <div className="cart__foot">
          <div className="cart__subtotal">
            <span>{t('cart.subtotal')}{totalQty > 0 ? ` (${totalQty})` : ''}</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <button
            className="cart__checkout"
            onClick={checkout}
            disabled={totalQty === 0}
          >
            {t('cart.checkout')}
          </button>
          <button className="cart__continue" onClick={closeCart}>{t('cart.continue')}</button>
        </div>
      </aside>
    </>
  )
}
