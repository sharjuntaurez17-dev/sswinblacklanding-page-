import { useEffect, useState } from 'react'
import { scrollToId } from '../hooks/useLenis.js'
import { useCart } from '../context/CartContext.jsx'

const LINKS = [
  { label: 'Home', target: '#home' },
  { label: 'Product', target: '#product' },
  { label: 'About', target: '#about' },
  { label: 'Contact', target: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { openCart, openTrack, openOrders, openAuth, currentUser } = useCart()
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
            Menu
          </button>

          {currentUser ? (
            <button className="nav__auth nav__auth--in" onClick={openAuth} aria-label={`Account: ${firstName}`}>
              <span className="nav__auth-avatar" aria-hidden="true">{initial}</span>
              <span className="nav__auth-name">{firstName}</span>
            </button>
          ) : (
            <button className="nav__auth" onClick={openAuth} aria-label="Log in or sign up">
              Login / Sign up
            </button>
          )}
        </div>

        {/* Center: logo */}
        <button className="nav__brand" onClick={() => scrollToId('#home')} aria-label="MUTHU WIN SS KANGAYAM — Home">
          <img className="nav__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
        </button>

        {/* Right: BUY NOW */}
        <button className="nav__buy" onClick={openCart} aria-label="Buy now — open cart">
          Buy Now
        </button>
      </nav>

      {/* Full-screen menu overlay */}
      <div className={`menu-overlay${menuOpen ? ' is-open' : ''}`}>
        <button className="menu-overlay__close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        <ul className="menu-overlay__links">
          {LINKS.map((l) => (
            <li key={l.target}>
              <button onClick={() => go(l.target)}>{l.label}</button>
            </li>
          ))}
          <li>
            <button onClick={() => { setMenuOpen(false); setTimeout(() => openTrack(), 220) }}>
              Track Order
            </button>
          </li>
          <li>
            <button onClick={() => { setMenuOpen(false); setTimeout(() => openOrders(), 220) }}>
              Your Orders
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
