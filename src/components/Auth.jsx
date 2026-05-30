import { useEffect, useState, Suspense, lazy } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { login, signUp } from '../lib/auth.js'
import Spotlight from './Spotlight.jsx'

// Lazy-load the Spline scene — it's heavy and we only need it when the overlay
// is open. Wrapped in our own Suspense boundary with a themed loader.
const Spline = lazy(() => import('@splinetool/react-spline'))

// Placeholder demo scene URL. Replace with a brand-aligned scene (a 3D rice bag
// or wheat sheaf) when one is published from Spline.
const SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

export default function Auth() {
  const { isAuthOpen, closeAuth, currentUser, setCurrentUser, logout: doLogout } = useCart()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Lock background scroll while open.
  useEffect(() => {
    if (!isAuthOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isAuthOpen])

  // Reset on close.
  useEffect(() => {
    if (!isAuthOpen) {
      setMode('login'); setName(''); setPhone(''); setError(''); setSubmitting(false)
    }
  }, [isAuthOpen])

  if (!isAuthOpen) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      let result
      if (mode === 'login') result = login(phone)
      else                  result = signUp(name, phone)
      if (!result.ok) { setError(result.error); setSubmitting(false); return }
      setCurrentUser(result.user)
      // Tiny pause so the success ripple plays before the overlay closes.
      setTimeout(() => closeAuth(), 250)
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // If we're already logged in, show a "you're signed in" panel with a Sign out CTA.
  if (currentUser) {
    return (
      <div className="auth" role="dialog" aria-modal="true" aria-label="Account">
        <div className="auth__head">
          <a className="checkout__brand" href="#home" onClick={closeAuth} aria-label="Home">
            <img className="checkout__logo" src="/winss-logo.webp" alt="" />
          </a>
          <h2 className="checkout__title">Account</h2>
          <button className="checkout__close" onClick={closeAuth} aria-label="Close">×</button>
        </div>
        <div className="auth__body">
          <div className="auth__card">
            <Spotlight />
            <div className="auth__pane auth__pane--left">
              <span className="auth__kicker">Signed in</span>
              <h3 className="auth__title">
                Welcome back, <em>{currentUser.name.split(/\s+/)[0]}</em>.
              </h3>
              <p className="auth__lead">
                We'll use <strong>+91 {currentUser.phone}</strong> to find your orders and
                addresses on this device. Sign out any time.
              </p>
              <button
                className="co-place auth__submit"
                onClick={() => { doLogout(); closeAuth() }}
              >Sign out</button>
            </div>
            <div className="auth__pane auth__pane--right">
              <Suspense fallback={<SceneFallback />}>
                <Spline scene={SCENE_URL} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Log in' : 'Sign up'}>
      <div className="auth__head">
        <a className="checkout__brand" href="#home" onClick={closeAuth} aria-label="Home">
          <img className="checkout__logo" src="/winss-logo.webp" alt="" />
        </a>
        <h2 className="checkout__title">{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
        <button className="checkout__close" onClick={closeAuth} aria-label="Close">×</button>
      </div>

      <div className="auth__body">
        <div className="auth__card">
          <Spotlight />

          {/* LEFT — form */}
          <div className="auth__pane auth__pane--left">
            <span className="auth__kicker">Premium rice, on your terms</span>
            <h3 className="auth__title">
              {mode === 'login' ? <>Welcome <em>back.</em></> : <>Join the <em>family.</em></>}
            </h3>
            <p className="auth__lead">
              {mode === 'login'
                ? 'Sign in with your phone number to see your saved orders and addresses.'
                : 'Your phone number is your key — we use it to find your orders and deliver to your address.'}
            </p>

            <div className="auth__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={`auth__tab${mode === 'login' ? ' is-active' : ''}`}
                onClick={() => setMode('login')}
              >Log in</button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                className={`auth__tab${mode === 'signup' ? ' is-active' : ''}`}
                onClick={() => setMode('signup')}
              >Sign up</button>
            </div>

            <form className="auth__form" onSubmit={onSubmit} noValidate>
              {mode === 'signup' && (
                <label className="co-field">
                  <span>Full Name<i>*</i></span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
              )}

              <label className="co-field">
                <span>Phone<i>*</i></span>
                <div className="auth__phone">
                  <span className="auth__phone-prefix">+91</span>
                  <input
                    autoFocus={mode === 'login'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
              </label>

              {error && <p className="co-err co-err--bottom">{error}</p>}

              <button className="co-place auth__submit" type="submit" disabled={submitting}>
                {submitting ? '…' : (mode === 'login' ? 'Continue' : 'Create account')}
              </button>

              <p className="auth__switch">
                {mode === 'login' ? (
                  <>New here? <button type="button" onClick={() => { setMode('signup'); setError('') }}>Create an account</button></>
                ) : (
                  <>Already with us? <button type="button" onClick={() => { setMode('login'); setError('') }}>Log in</button></>
                )}
              </p>
            </form>
          </div>

          {/* RIGHT — Spline 3D scene */}
          <div className="auth__pane auth__pane--right">
            <Suspense fallback={<SceneFallback />}>
              <Spline scene={SCENE_URL} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function SceneFallback() {
  return (
    <div className="auth__scene-fallback" aria-hidden="true">
      <div className="auth__scene-orb" />
    </div>
  )
}
