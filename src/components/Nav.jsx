import { useEffect, useState } from 'react'
import { scrollToId } from '../hooks/useLenis.js'
import { useCart } from '../context/CartContext.jsx'

const LINKS = [
  { label: 'Home', target: '#home' },
  { label: 'Product', target: '#product' },
  { label: 'About', target: '#about' },
  { label: 'Order', target: '#order' },
  { label: 'Contact', target: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { qty, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <button className="nav__brand" onClick={() => scrollToId('#home')} aria-label="MUTHU WIN SS KANGAYAM — Home">
        <img className="nav__logo" src="/winss-logo.webp" alt="MUTHU WIN SS KANGAYAM" />
      </button>
      <div className="nav__right">
        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.target}>
              <button onClick={() => scrollToId(l.target)}>{l.label}</button>
            </li>
          ))}
        </ul>
        <button className="nav__cart" onClick={openCart} aria-label="Open cart">
          🛒<span className="nav__cart-count">{qty}</span>
        </button>
      </div>
    </nav>
  )
}
