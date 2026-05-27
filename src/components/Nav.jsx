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
  const { openCart } = useCart()

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
        {/* Left: MENU */}
        <button className="nav__menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="nav__burger"><i /><i /><i /></span>
          Menu
        </button>

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
        </ul>
      </div>
    </>
  )
}
