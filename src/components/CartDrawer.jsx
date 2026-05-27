import { useCart } from '../context/CartContext.jsx'
import { PRODUCT } from '../lib/product.js'
import { scrollToId } from '../hooks/useLenis.js'

export default function CartDrawer() {
  const { qty, inc, dec, setQty, isOpen, closeCart } = useCart()
  const subtotal = qty * PRODUCT.pricePerBag

  const checkout = () => {
    closeCart()
    // Let the drawer close, then scroll to the checkout form.
    setTimeout(() => scrollToId('#order'), 250)
  }

  return (
    <>
      <div className={`cart-overlay${isOpen ? ' is-open' : ''}`} onClick={closeCart} />
      <aside className={`cart${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
        <div className="cart__head">
          <h3>Your Cart</h3>
          <button className="cart__close" onClick={closeCart} aria-label="Close cart">×</button>
        </div>

        <div className="cart__item">
          <img src={PRODUCT.image} alt={PRODUCT.name} />
          <div className="cart__item-info">
            <strong>{PRODUCT.shortName}</strong>
            <span>₹{PRODUCT.pricePerBag.toLocaleString('en-IN')} / bag</span>
            <div className="cart__qty">
              <button onClick={dec} aria-label="Decrease quantity">−</button>
              <input
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                inputMode="numeric"
                aria-label="Quantity"
              />
              <button onClick={inc} aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>

        <div className="cart__foot">
          <div className="cart__subtotal">
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <button className="cart__checkout" onClick={checkout}>Proceed to checkout</button>
          <button className="cart__continue" onClick={closeCart}>Continue browsing</button>
        </div>
      </aside>
    </>
  )
}
