import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { submitOrder } from '../lib/orders.js'

gsap.registerPlugin(ScrollTrigger)

const PRICE_PER_BAG = 1500 // ₹ per 26kg bag (placeholder until pricing is set)

const EMPTY = { name: '', phone: '', address: '', pincode: '', quantity: 1 }

export default function Order({ bagSrc }) {
  const ref = useRef(null)
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
    if (!(Number(form.quantity) >= 1)) er.quantity = 'Quantity must be at least 1'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const qty = Number(form.quantity)
      await submitOrder({ ...form, quantity: qty, amount: qty * PRICE_PER_BAG * 100 })
      setStatus('done')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  const total = (Number(form.quantity) || 0) * PRICE_PER_BAG

  return (
    <section className="order" id="order" ref={ref}>
      <div className="order__inner">
        <div className="order__col order__form-col">
          <span className="kicker">Place your order</span>
          <h2 className="order__title">Order your 26kg pack</h2>
          <p className="order__lead">
            Fresh, Sortex-sorted Ponni rice delivered to your door. Fill in your
            details and we'll confirm your order.
          </p>

          {status === 'done' ? (
            <div className="order__success">
              <h3>Thank you! 🎉</h3>
              <p>Your order request is received. We'll contact you shortly to confirm.</p>
              <button className="order__btn" onClick={() => setStatus('idle')}>Place another order</button>
            </div>
          ) : (
            <form className="order__form" onSubmit={onSubmit} noValidate>
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
                  <input type="number" min="1" value={form.quantity} onChange={set('quantity')} />
                  {errors.quantity && <em>{errors.quantity}</em>}
                </label>
              </div>

              <div className="order__total">
                <span>Estimated total</span>
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
          <img className="order__bag" src={bagSrc} alt="MUTHU WIN SS KANGAYAM 26kg premium sortex rice bag" />
        </div>
      </div>
    </section>
  )
}
