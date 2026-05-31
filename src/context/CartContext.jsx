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
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isCareOpen, setIsCareOpen] = useState(false)
  const [selectedAddress, setSelectedAddressState] = useState(() => {
    try {
      const s = localStorage.getItem('sswin.selectedAddr.v1')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [fulfilment, setFulfilmentState] = useState(() => {
    try { return localStorage.getItem('sswin.fulfilment.v1') || 'delivery' } catch { return 'delivery' }
  })

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

      // Selected delivery location (drives pincode pricing + checkout prefill)
      isLocationOpen,
      openLocation: () => { setIsOpen(false); setIsLocationOpen(true) },
      closeLocation: () => setIsLocationOpen(false),
      selectedAddress,
      setSelectedAddress: (addr) => {
        setSelectedAddressState(addr)
        try {
          if (addr) localStorage.setItem('sswin.selectedAddr.v1', JSON.stringify(addr))
          else localStorage.removeItem('sswin.selectedAddr.v1')
        } catch {}
      },
      fulfilment,
      setFulfilment: (m) => {
        setFulfilmentState(m)
        try { localStorage.setItem('sswin.fulfilment.v1', m) } catch {}
      },

      // Customer care
      isCareOpen,
      openCare: () => { setIsOpen(false); setIsCareOpen(true) },
      closeCare: () => setIsCareOpen(false),
    }
  }, [quantities, isOpen, isCheckoutOpen, isTrackOpen, isOrdersOpen, trackTargetId, isAuthOpen, currentUser, isLocationOpen, selectedAddress, fulfilment, isCareOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
