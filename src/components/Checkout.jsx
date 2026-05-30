import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { PRODUCT } from '../lib/product.js'
import { submitOrder, generateOrderId } from '../lib/orders.js'
import { saveOrder as saveLocalOrder } from '../lib/localOrders.js'
import { getAddresses, saveAddress, deleteAddress, ADDRESS_LABELS, labelOf, displayLabel } from '../lib/addressBook.js'
import SparklesText from './SparklesText.jsx'

const EMPTY = {
  name: '', phone: '', email: '',
  address: '', city: '', state: '', pincode: '', country: 'India',
  labelType: 'home',
  customLabel: '',
  payment: 'cod',
}

export default function Checkout() {
  const {
    lines, totalQty, subtotal,
    isCheckoutOpen, closeCheckout, clear,
    openTrack,
    currentUser,
  } = useCart()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderName, setOrderName] = useState('') // remember for the thank-you screen after we clear the form
  const [copied, setCopied] = useState(false)

  // Address book (saved addresses) state
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [saveAddressForLater, setSaveAddressForLater] = useState(true)

  // Refresh saved addresses each time the checkout opens
  useEffect(() => {
    if (isCheckoutOpen) setSavedAddresses(getAddresses())
  }, [isCheckoutOpen])

  // Prefill name + phone from the logged-in user whenever the overlay opens
  // and the user is signed in. Fields stay editable so they can still order
  // for someone else.
  useEffect(() => {
    if (isCheckoutOpen && currentUser) {
      setForm((f) => ({ ...f,
        name: f.name || currentUser.name || '',
        phone: f.phone || currentUser.phone || '',
      }))
    }
  }, [isCheckoutOpen, currentUser])

  // Apply a saved address to the form (fills name + phone + every shipping field
  // + the label tab + custom label).
  const applySavedAddress = (addr) => {
    setForm((f) => ({
      ...f,
      name: addr.name || f.name,
      phone: addr.phone || f.phone,
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      labelType: addr.labelType || 'home',
      customLabel: addr.customLabel || '',
    }))
    setSelectedAddressId(addr.id)
    setErrors({})
  }

  const onDeleteAddress = (id) => {
    deleteAddress(id)
    setSavedAddresses(getAddresses())
    if (selectedAddressId === id) setSelectedAddressId(null)
  }

  // Robust copy: tries the modern Clipboard API, then the legacy execCommand
  // fallback, and *always* selects the visible order ID so the user can
  // Ctrl+C / long-press → Copy even in environments where JS clipboard access
  // is blocked (permissions, extensions, missing focus, etc.).
  async function copyOrderId(text) {
    let viaApi = false
    try {
      if (navigator?.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        viaApi = true
      }
    } catch {}

    if (!viaApi) {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.top = '-1000px'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ta.setSelectionRange(0, ta.value.length)
        viaApi = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {}
    }

    // Always select the visible order ID. Either the JS copy already populated
    // the clipboard (then this is just a nice visual confirmation), or it
    // didn't — and the user can immediately hit Ctrl+C / right-click → Copy.
    try {
      const span = document.querySelector('.order-id-card__id')
      if (span) {
        const range = document.createRange()
        range.selectNodeContents(span)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
      }
    } catch {}

    return true
  }

  // Lock background scroll while the overlay is open.
  // The overlay itself uses a flex layout with an internal scroll container,
  // so the user can scroll the checkout content freely.
  useEffect(() => {
    if (!isCheckoutOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isCheckoutOpen])

  useEffect(() => {
    if (!isCheckoutOpen) {
      setStatus('idle'); setErrors({}); setErrMsg(''); setOrderId(''); setOrderName(''); setCopied(false)
      setSelectedAddressId(null); setSaveAddressForLater(true)
      // Reset form too, so the next checkout doesnt inherit the previous orders
      // customLabel/labelType/name/etc. The user will either pick a saved address
      // (which refills everything) or fill a fresh one.
      setForm(EMPTY)
    }
  }, [isCheckoutOpen])

  if (!isCheckoutOpen) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const er = {}
    if (!form.name.trim()) er.name = 'Enter your name'
    if (!/^\d{10}$/.test(form.phone.trim())) er.phone = 'Enter a 10-digit phone number'
    // Email is optional — only validate format if the user actually entered one
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'Enter a valid email'
    if (!form.address.trim()) er.address = 'Enter your street address'
    if (!form.city.trim()) er.city = 'Enter your city'
    if (!form.state.trim()) er.state = 'Enter your state'
    if (!/^\d{6}$/.test(form.pincode.trim())) er.pincode = 'Enter a 6-digit pincode'
    if (!form.country.trim()) er.country = 'Enter your country'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const orderedLines = lines.filter((l) => l.qty > 0)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (orderedLines.length === 0) {
      setErrMsg('Your bag is empty.')
      return
    }
    if (!validate()) return
    setStatus('sending'); setErrMsg('')
    const id = generateOrderId()
    try {
      const items = orderedLines.map((l) => ({ size: l.size, price: l.price, qty: l.qty, subtotal: l.subtotal }))
      await submitOrder({
        orderId: id,
        ...form,
        items,
        totalQty,
        amount: subtotal * 100,
      })
      // Remember this order on this device so it shows up in Your Orders.
      saveLocalOrder({
        orderId: id,
        items,
        totalQty,
        subtotal,
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        payment: form.payment,
      })

      // Save this shipping address to the address book if the user opted in.
      // We always save when an existing one was selected (so updatedAt/usage moves it to the top).
      if (saveAddressForLater || selectedAddressId) {
        saveAddress({
          id: selectedAddressId || undefined,
          labelType: form.labelType,
          customLabel: form.customLabel,
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        })
      }
      setOrderId(id)
      setOrderName(form.name.trim().split(/\s+/)[0])
      setStatus('done')
      clear()
    } catch (err) {
      setStatus('error')
      setErrMsg(err?.message || 'Could not place the order. Please try again.')
    }
  }

  return (
    <div className="checkout" role="dialog" aria-modal="true" aria-label="Checkout">
      {/* Header bar — fixed at the top of the overlay, not the page */}
      <div className="checkout__head">
        <a className="checkout__brand" href="#home" onClick={closeCheckout} aria-label="MUTHU WIN SS KANGAYAM — back to home">
          <img className="checkout__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
        </a>
        <h2 className="checkout__title">Checkout</h2>
        <button className="checkout__close" onClick={closeCheckout} aria-label="Close checkout">×</button>
      </div>

      {/* Scrollable body — wraps the entire form + summary so all content scrolls */}
      <div className="checkout__body">
        {status === 'done' ? (
          <div className="checkout__success">
            <div className="checkout__success-mark" aria-hidden="true">✦</div>
            <h3 className="checkout__success-heading">
              <SparklesText sparklesCount={14}>
                Thank you for joining our family{orderName ? `, ${orderName}` : ''} 🌾
              </SparklesText>
            </h3>
            <p>
              Your order has been received. Our team will reach out to you shortly to deliver the product.
            </p>

            <div className="order-id-card">
              <span className="order-id-card__label">Your Order ID</span>
              <div className="order-id-card__row">
                <strong className="order-id-card__id">{orderId}</strong>
                <button
                  type="button"
                  className={`order-id-card__copy${copied ? ' is-copied' : ''}`}
                  onClick={async () => {
                    await copyOrderId(orderId)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1600)
                  }}
                  aria-label={copied ? 'Order ID copied' : 'Copy order ID'}
                >{copied ? 'Copied!' : 'Copy'}</button>
              </div>
              <span className="order-id-card__hint">Please mention this ID when we call to confirm.</span>
            </div>

            <div className="checkout__success-actions">
              <button className="co-place" onClick={closeCheckout}>Continue browsing</button>
              <button
                type="button"
                className="track__ghost"
                onClick={() => { closeCheckout(); openTrack() }}
              >
                Track Order
              </button>
              <p className="checkout__success-hint">
                You can access <strong>Track Order</strong> anytime from the menu.
              </p>
            </div>
          </div>
        ) : (
          <form className="checkout__grid" onSubmit={onSubmit} noValidate>
            {/* LEFT: form sections */}
            <div className="checkout__form">
              {/* 1. Customer Info */}
              <section className="co-card">
                <header className="co-card__head">
                  <h3>Customer Info</h3>
                  <span className="co-card__req">* Required</span>
                </header>

                <label className="co-field">
                  <span>Full Name<i>*</i></span>
                  <input value={form.name} onChange={set('name')} placeholder="Enter full name" />
                  {errors.name && <em className="co-err">{errors.name}</em>}
                </label>

                <label className="co-field">
                  <span>Phone<i>*</i></span>
                  <input value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" inputMode="numeric" />
                  {errors.phone && <em className="co-err">{errors.phone}</em>}
                </label>

                <label className="co-field">
                  <span>Email <em>(optional)</em></span>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  {errors.email && <em className="co-err">{errors.email}</em>}
                </label>
              </section>

              {/* 2. Shipping Address */}
              <section className="co-card">
                <header className="co-card__head">
                  <h3>Shipping Address</h3>
                  <span className="co-card__req">* Required</span>
                </header>

                {/* Saved addresses — picker at the top so the user can switch in one click */}
                {savedAddresses.length > 0 && (
                  <div className="addr-picker">
                    <div className="addr-picker__head">
                      <span className="addr-picker__label">Saved addresses</span>
                      {selectedAddressId && (
                        <button
                          type="button"
                          className="addr-picker__new"
                          onClick={() => {
                            setSelectedAddressId(null)
                            setForm((f) => ({ ...f,
                              name: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India',
                              labelType: 'home', customLabel: '',
                            }))
                          }}
                        >+ New address</button>
                      )}
                    </div>
                    <ul className="addr-picker__list">
                      {savedAddresses.map((a) => {
                        const lab = labelOf(a.labelType)
                        const title = displayLabel(a)
                        const isCustom = !!(a.customLabel && a.customLabel.trim())
                        const selected = selectedAddressId === a.id
                        return (
                          <li key={a.id} className={`addr-card${selected ? ' is-selected' : ''}`}>
                            <button type="button" className="addr-card__main" onClick={() => applySavedAddress(a)}>
                              <span className="addr-card__icon" aria-hidden="true">{lab.icon}</span>
                              <span className="addr-card__body">
                                <span className="addr-card__row">
                                  <strong>{title}</strong>
                                  {isCustom && <span className="addr-card__tag">{lab.label}</span>}
                                  {a.name && <em className="addr-card__name">{a.name}</em>}
                                  {selected && <span className="addr-card__selected">Selected</span>}
                                </span>
                                <span className="addr-card__line">
                                  {[a.address, a.city, a.state, a.pincode].filter(Boolean).join(', ')}
                                </span>
                              </span>
                            </button>
                            <button
                              type="button"
                              className="addr-card__delete"
                              onClick={(e) => { e.stopPropagation(); onDeleteAddress(a.id) }}
                              aria-label={`Delete ${title} address`}
                              title="Delete"
                            >×</button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                <label className="co-field">
                  <span>Street Address<i>*</i></span>
                  <textarea value={form.address} onChange={set('address')} rows={3} placeholder="Enter street address" />
                  {errors.address && <em className="co-err">{errors.address}</em>}
                </label>

                <div className="co-row co-row--3">
                  <label className="co-field">
                    <span>City<i>*</i></span>
                    <input value={form.city} onChange={set('city')} placeholder="Enter city" />
                    {errors.city && <em className="co-err">{errors.city}</em>}
                  </label>
                  <label className="co-field">
                    <span>State<i>*</i></span>
                    <input value={form.state} onChange={set('state')} placeholder="Enter state" />
                    {errors.state && <em className="co-err">{errors.state}</em>}
                  </label>
                  <label className="co-field">
                    <span>Pincode<i>*</i></span>
                    <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit" inputMode="numeric" />
                    {errors.pincode && <em className="co-err">{errors.pincode}</em>}
                  </label>
                </div>

                <label className="co-field">
                  <span>Country<i>*</i></span>
                  <input value={form.country} onChange={set('country')} placeholder="Country" />
                  {errors.country && <em className="co-err">{errors.country}</em>}
                </label>

                {/* Address label tabs — Home / Work / Friend / Other */}
                <div className="co-field addr-tabs-wrap">
                  <span>Save this address as</span>
                  <div className="addr-tabs" role="radiogroup" aria-label="Address label">
                    {ADDRESS_LABELS.map((l) => {
                      const checked = form.labelType === l.id
                      return (
                        <button
                          key={l.id}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          className={`addr-tab${checked ? ' is-selected' : ''}`}
                          onClick={() => setForm((f) => ({ ...f, labelType: l.id }))}
                        >
                          <span className="addr-tab__icon" aria-hidden="true">{l.icon}</span>
                          <span>{l.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Optional custom label — overrides the tab name when shown in the picker */}
                <label className="co-field addr-custom">
                  <span>Or name this address <em>(optional)</em></span>
                  <input
                    value={form.customLabel}
                    onChange={set('customLabel')}
                    placeholder="e.g. Mom's House, Office Annex"
                    maxLength={40}
                  />
                </label>

                {/* Save toggle */}
                <label className="addr-save">
                  <input
                    type="checkbox"
                    checked={saveAddressForLater}
                    onChange={(e) => setSaveAddressForLater(e.target.checked)}
                  />
                  <span className="addr-save__box" aria-hidden="true" />
                  <span className="addr-save__text">
                    Save this address for next time
                  </span>
                </label>
              </section>

              {/* 3. Payment Info */}
              <section className="co-card">
                <header className="co-card__head">
                  <h3>Payment Info</h3>
                  <span className="co-card__req co-card__req--soft">Choose one</span>
                </header>

                <div className="co-pay">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives.' },
                    { id: 'upi', label: 'UPI on Delivery',  desc: 'Scan & pay via UPI when the order is delivered.' },
                  ].map((opt) => {
                    const checked = form.payment === opt.id
                    return (
                      <label key={opt.id} className={`co-pay__opt${checked ? ' is-selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={opt.id}
                          checked={checked}
                          onChange={set('payment')}
                        />
                        <div className="co-pay__body">
                          <strong>{opt.label}</strong>
                          <span>{opt.desc}</span>
                        </div>
                        <span className="co-pay__check" aria-hidden="true" />
                      </label>
                    )
                  })}
                </div>
                <p className="co-note">Online card/UPI checkout is coming soon.</p>
              </section>
            </div>

            {/* RIGHT: items + summary + place order */}
            <aside className="checkout__summary">
              {/* ITEM(S) IN ORDER */}
              <section className="co-card">
                <header className="co-card__head">
                  <h3>Item(s) in Order</h3>
                </header>

                {orderedLines.length === 0 ? (
                  <p className="co-empty">Your bag is empty.</p>
                ) : (
                  <ul className="co-items">
                    {orderedLines.map((l) => (
                      <li key={l.size} className="co-item">
                        <img src={PRODUCT.image} alt="" />
                        <div className="co-item__info">
                          <strong>{PRODUCT.shortName}</strong>
                          <span>{l.size} &nbsp;·&nbsp; Qty {l.qty}</span>
                        </div>
                        <div className="co-item__price">
                          ₹{l.subtotal.toLocaleString('en-IN')}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ORDER SUMMARY */}
              <section className="co-card">
                <header className="co-card__head">
                  <h3>Order Summary</h3>
                </header>

                <div className="co-totals">
                  <div className="co-total-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="co-total-row">
                    <span>Taxes</span>
                    <span>₹0</span>
                  </div>
                  <div className="co-total-row co-total-row--grand">
                    <strong>Total</strong>
                    <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </section>

              <button className="co-place" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Placing order…' : 'Place order'}
              </button>
              {errMsg && <p className="co-err co-err--bottom">{errMsg}</p>}
            </aside>
          </form>
        )}
      </div>
    </div>
  )
}
