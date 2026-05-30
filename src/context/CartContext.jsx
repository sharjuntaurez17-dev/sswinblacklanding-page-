import { createContext, useContext, useMemo, useState } from 'react'
import { PACKS } from '../lib/product.js'
import { getCurrentUser, logout as authLogout } from '../lib/auth.js'

const CartContext = createContext(null)

// Each pack size has its own quantity. All sizes start at 0 — the user
// adds to whichever sizes they want, and the subtotal sums across all of them.
const ZERO_QTY = Object.fromEntries(PACKS.map((p) => [p.size, 0]))

const clamp = (n) => Math.max(0, Math.min(99, Math.floor(Number(n) || 0)))

export function CartProvider({ children }) {
  const [quantities, setQuantities] = useState(ZERO_QTY)
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isTrackOpen, setIsTrackOpen] = useState(false)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [trackTargetId, setTrackTargetId] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())

  const value = useMemo(() => {
    const lines = PACKS.map((p) => {
      const qty = quantities[p.size] ?? 0
      return { ...p, qty, subtotal: qty * p.price }
    })
    const totalQty = lines.reduce((s, l) => s + l.qty, 0)
    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)

    return {
      sizes: PACKS,
      lines,
      totalQty,
      subtotal,

      setQty: (size, n) =>
        setQuantities((q) => ({ ...q, [size]: clamp(n) })),
      inc: (size) =>
        setQuantities((q) => ({ ...q, [size]: clamp((q[size] ?? 0) + 1) })),
      dec: (size) =>
        setQuantities((q) => ({ ...q, [size]: clamp((q[size] ?? 0) - 1) })),
      clear: () => setQuantities(ZERO_QTY),

      // Cart drawer
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),

      // Checkout overlay
      isCheckoutOpen,
      openCheckout: () => { setIsOpen(false); setIsCheckoutOpen(true) },
      closeCheckout: () => setIsCheckoutOpen(false),

      // Track-order overlay (optionally pre-loaded with a specific ID)
      isTrackOpen,
      trackTargetId,
      openTrack: (idToTrack) => {
        setTrackTargetId(typeof idToTrack === 'string' ? idToTrack : '')
        setIsOpen(false); setIsCheckoutOpen(false); setIsOrdersOpen(false)
        setIsTrackOpen(true)
      },
      closeTrack: () => { setIsTrackOpen(false); setTrackTargetId('') },

      // Your Orders dashboard
      isOrdersOpen,
      openOrders: () => { setIsOpen(false); setIsCheckoutOpen(false); setIsTrackOpen(false); setIsOrdersOpen(true) },
      closeOrders: () => setIsOrdersOpen(false),

      // Auth (Login / Sign up)
      isAuthOpen,
      openAuth: () => { setIsOpen(false); setIsCheckoutOpen(false); setIsTrackOpen(false); setIsOrdersOpen(false); setIsAuthOpen(true) },
      closeAuth: () => setIsAuthOpen(false),
      currentUser,
      setCurrentUser,
      logout: () => { authLogout(); setCurrentUser(null) },
    }
  }, [quantities, isOpen, isCheckoutOpen, isTrackOpen, isOrdersOpen, trackTargetId, isAuthOpen, currentUser])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
