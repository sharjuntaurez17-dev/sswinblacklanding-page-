import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { submitOrder } from '../lib/orders.js'
import { useCart } from '../context/CartContext.jsx'

gsap.registerPlugin(ScrollTrigger)

const EMPTY = { name: '', phone: '', address: '', pincode: '' }

export default function Order({ bagSrc }) {
  const ref = useRef(null)
  const { sizes, size, setSize, unitPrice, qty, setQty } = useCart()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.order__col', {
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        y: 40, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = 'Enter your name'
    if (!/^\d{10}$/.test(form.phone.trim())) er.phone = 'Enter a 10-digit phone number'
    if (!form.address.trim()) er.address = 'Enter your delivery address'
    if (!/^\d{6}$/.test(form.pincode.trim())) er.pincode = 'Enter a 6-digit pincode'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      await submitOrder({
        ...form,
        size,
        unitPrice,
        quantity: qty,
        amount: qty * unitPrice * 100, // paise
      })
      setStatus('done')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  const total = qty * unitPrice

  return (
    <section className="order" id="order" ref={ref}>
      <div className="order__inner">
        <div className="order__col order__form-col">
          <span className="kicker">Place your order</span>
          <h2 className="order__title">Choose your pack</h2>
          <p className="order__lead">
            Fresh, Sortex-sorted Ponni rice delivered to your door. Pick the
            pack size you'd like — 5 kg, 10 kg or 26 kg.
          </p>

          {status === 'done' ? (
            <div className="order__success">
              <h3>Thank you! 🎉</h3>
              <p>Your order request is received. We'll contact you shortly to confirm.</p>
              <button className="order__btn" onClick={() => setStatus('idle')}>Place another order</button>
            </div>
          ) : (
            <form className="order__form" onSubmit={onSubmit} noValidate>
              <div className="order__field">
                <span>Pack size</span>
                <div className="size-select" role="radiogroup" aria-label="Pack size">
                  {sizes.map((p) => (
                    <button
                      key={p.size}
                      type="button"
                      role="radio"
                      aria-checked={p.size === size}
                      className={`size-select__btn size-select__btn--lg${p.size === size ? ' is-selected' : ''}`}
                      onClick={() => setSize(p.size)}
                    >
                      <strong>{p.size}</strong>
                      <em>₹{p.price.toLocaleString('en-IN')}</em>
                    </button>
                  ))}
                </div>
              </div>

              <label className="order__field">
                <span>Full name</span>
                <input value={form.name} onChange={set('name')} placeholder="Your name" />
                {errors.name && <em>{errors.name}</em>}
              </label>

              <label className="order__field">
                <span>Phone</span>
                <input value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" inputMode="numeric" />
                {errors.phone && <em>{errors.phone}</em>}
              </label>

              <label className="order__field">
                <span>Delivery address</span>
                <textarea value={form.address} onChange={set('address')} placeholder="House no, street, area, city" rows={3} />
                {errors.address && <em>{errors.address}</em>}
              </label>

              <div className="order__row">
                <label className="order__field">
                  <span>Pincode</span>
                  <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit" inputMode="numeric" />
                  {errors.pincode && <em>{errors.pincode}</em>}
                </label>
                <label className="order__field">
                  <span>Quantity (bags)</span>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                </label>
              </div>

              <div className="order__total">
                <span>{size} &times; {qty}</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>

              <button className="order__btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Placing…' : 'Place order'}
              </button>
              {status === 'error' && <p className="order__err">Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>

        <div className="order__col order__media">
          <img className="order__bag" src={bagSrc} alt={`MUTHU WIN SS KANGAYAM ${size} premium sortex rice bag`} />
        </div>
      </div>
    </section>
  )
}
