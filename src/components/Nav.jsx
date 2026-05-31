import { useEffect, useState } from 'react'
import { scrollToId } from '../hooks/useLenis.js'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import LangToggle from './LangToggle.jsx'

const LINKS = [
  { key: 'menu.home', target: '#home' },
  { key: 'menu.product', target: '#product' },
  { key: 'menu.about', target: '#about' },
  { key: 'menu.contact', target: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { openCart, openTrack, openOrders, openAuth, currentUser, openLocation, selectedAddress, openCare } = useCart()
  const { t } = useLang()
  const locLabel = selectedAddress
    ? (selectedAddress.customLabel || selectedAddress.city || selectedAddress.address || t('loc.set'))
    : t('loc.set')
  const firstName = currentUser?.name?.split(/\s+/)[0] || ''
  const initial = firstName ? firstName.charAt(0).toUpperCase() : ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (target) => {
    setMenuOpen(false)
    setTimeout(() => scrollToId(target), 250)
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        {/* Left: MENU + LOGIN */}
        <div className="nav__left">
          <button className="nav__menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span className="nav__burger"><i /><i /><i /></span>
            {t('nav.menu')}
          </button>

          {currentUser ? (
            <button className="nav__auth nav__auth--in" onClick={openAuth} aria-label={`Account: ${firstName}`}>
              <span className="nav__auth-avatar" aria-hidden="true">{initial}</span>
              <span className="nav__auth-name">{firstName}</span>
            </button>
          ) : (
            <button className="nav__auth" onClick={openAuth} aria-label="Log in or sign up">
              {t('nav.login')}
            </button>
          )}

          <button className="nav__care" onClick={openCare} aria-label={t('menu.care')} title={t('menu.care')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 13a8 8 0 0 1 16 0" />
              <rect x="2" y="13" width="4" height="7" rx="1.5" fill="currentColor" stroke="none" />
              <rect x="18" y="13" width="4" height="7" rx="1.5" fill="currentColor" stroke="none" />
              <path d="M20 18v1a3 3 0 0 1-3 3h-3" />
            </svg>
          </button>
        </div>

        {/* Center: logo */}
        <button className="nav__brand" onClick={() => scrollToId('#home')} aria-label="MUTHU WIN SS KANGAYAM — Home">
          <img className="nav__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
        </button>

        {/* Right: location + language toggle + BUY NOW */}
        <div className="nav__right">
          <button className="nav__loc" onClick={openLocation} aria-label={t('loc.title')}>
            <span className="nav__loc-pin" aria-hidden="true">◉</span>
            <span className="nav__loc-text">
              <span className="nav__loc-label">{t('loc.chip')}</span>
              <span className="nav__loc-value">{locLabel}</span>
            </span>
          </button>
          <LangToggle />
          <button className="nav__buy" onClick={openCart} aria-label="Buy now — open cart">
            {t('nav.buy')}
          </button>
        </div>
      </nav>

      {/* Full-screen menu overlay */}
      <div className={`menu-overlay${menuOpen ? ' is-open' : ''}`}>
        <button className="menu-overlay__close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        <ul className="menu-overlay__links">
          {LINKS.map((l) => (
            <li key={l.target}>
              <button onClick={() => go(l.target)}>{t(l.key)}</button>
            </li>
          ))}
          <li>
            <button onClick={() => { setMenuOpen(false); setTimeout(() => openTrack(), 220) }}>
              {t('menu.track')}
            </button>
          </li>
          <li>
            <button onClick={() => { setMenuOpen(false); setTimeout(() => openOrders(), 220) }}>
              {t('menu.orders')}
            </button>
          </li>
          <li>
            <button onClick={() => { setMenuOpen(false); setTimeout(() => openCare(), 220) }}>
              {t('menu.care')}
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
