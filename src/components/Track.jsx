import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { getOrder, isDelivered, setOrderStatus } from '../lib/localOrders.js'

// Stages every order goes through (labels resolved via t() at render).
const STAGES = [
  { key: 'received' },
  { key: 'shipped' },
  { key: 'delivered' },
]

// Order IDs follow SSW-YYMMDD-XXXX  (4 unambiguous alphanumerics).
const ID_RE = /^SSW-\d{6}-[A-Z2-9]{4}$/i

export default function Track() {
  const { isTrackOpen, closeTrack, trackTargetId } = useCart()
  const { t } = useLang()
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null) // null | { id, stageIndex, eta }
  const [loading, setLoading] = useState(false)

  // Lock background scroll while open.
  useEffect(() => {
    if (!isTrackOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isTrackOpen])

  // Reset on close.
  useEffect(() => {
    if (!isTrackOpen) { setId(''); setError(''); setStatus(null); setLoading(false) }
  }, [isTrackOpen])

  // When opened with a target ID (e.g. from the Orders dashboard "Track" button),
  // pre-fill the input AND auto-submit so the user lands directly on the timeline.
  useEffect(() => {
    if (!isTrackOpen || !trackTargetId) return
    setId(trackTargetId)
    // Fire the submit on the next tick so the input state has applied.
    setTimeout(() => {
      const formEl = document.querySelector('.track form')
      if (formEl) formEl.requestSubmit ? formEl.requestSubmit() : formEl.submit()
    }, 0)
  }, [isTrackOpen, trackTargetId])

  if (!isTrackOpen) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = id.trim().toUpperCase()
    if (!ID_RE.test(v)) {
      setError('Please enter a valid order ID (e.g. SSW-260530-XJM9).')
      return
    }
    setError(''); setLoading(true)
    try {
      // Try the real API; in dev there is no backend so we fall back to a
      // friendly local status.
      const res = await fetch(`/api/orders?id=${encodeURIComponent(v)}`)
      let stageIndex = 0, eta = '2-3 days'
      if (res.ok) {
        const data = await res.json()
        // Map backend status -> stage index; safe defaults if missing.
        if (typeof data.stageIndex === 'number') stageIndex = data.stageIndex
        else if (data.status) {
          const i = STAGES.findIndex((s) => s.key === data.status)
          if (i >= 0) stageIndex = i
        }
        if (data.eta) eta = data.eta
      }

      // Fall back to the locally-saved order: once its delivery window has
      // elapsed (or it's flagged delivered), show the final stage and persist
      // the delivered status so Your Orders shows the green badge.
      const local = getOrder(v)
      if (local && isDelivered(local)) {
        stageIndex = STAGES.length - 1 // Delivered
        eta = 'Delivered'
        setOrderStatus(v, 'delivered')
      }

      // Smooth perceived delay for the spinner
      await new Promise((r) => setTimeout(r, 500))
      setStatus({ id: v, stageIndex, eta })
    } catch {
      setStatus({ id: v, stageIndex: 0, eta: '2-3 days' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout track" role="dialog" aria-modal="true" aria-label="Track order">
      <div className="checkout__head">
        <a className="checkout__brand" href="#home" onClick={closeTrack} aria-label="Home">
          <img className="checkout__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
        </a>
        <h2 className="checkout__title">{t('tk.title')}</h2>
        <button className="checkout__close" onClick={closeTrack} aria-label="Close">×</button>
      </div>

      <div className="checkout__body">
        <div className="track__wrap">
          {status ? (
            <div className="track__result">
              <span className="track__kicker">{t('tk.tracking')}</span>
              <h3 className="track__id">{status.id}</h3>
              <p className="track__eta">{t('tk.eta')} <strong>{status.eta}</strong></p>

              <ol className="track__stages">
                {STAGES.map((s, i) => {
                  const state = i < status.stageIndex ? 'done' : i === status.stageIndex ? 'current' : 'todo'
                  return (
                    <li key={s.key} className={`track__stage is-${state}`}>
                      <span className="track__dot" aria-hidden="true" />
                      <div className="track__stage-info">
                        <strong>{t('tk.stage.' + s.key)}</strong>
                        <span>{t('tk.stage.' + s.key + 'Desc')}</span>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <div className="track__actions">
                <button className="co-place" onClick={() => setStatus(null)}>{t('tk.another')}</button>
                <button className="track__ghost" onClick={closeTrack}>{t('tk.close')}</button>
              </div>
            </div>
          ) : (
            <form className="co-card track__card" onSubmit={onSubmit}>
              <header className="co-card__head">
                <h3>{t('tk.find')}</h3>
              </header>

              <p className="track__lead">
                {t('tk.lead') !== 'tk.lead' ? t('tk.lead') : <>Enter the order ID we sent you on checkout. Format: <code>SSW-YYMMDD-XXXX</code>.</>}
              </p>

              <label className="co-field">
                <span>{t('tk.orderId')}<i>*</i></span>
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="SSW-260530-XJM9"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
                {error && <em className="co-err">{error}</em>}
              </label>

              <button className="co-place" type="submit" disabled={loading}>
                {loading ? t('tk.looking') : t('tk.btn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
