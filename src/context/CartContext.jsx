import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

// Holds the single-product cart: quantity + the open/close state of the drawer.
export function CartProvider({ children }) {
  const [qty, setQty] = useState(1)
  const [isOpen, setIsOpen] = useState(false)

  const value = {
    qty,
    setQty: (n) => setQty(Math.max(1, Math.min(99, Math.floor(n) || 1))),
    inc: () => setQty((q) => Math.min(99, q + 1)),
    dec: () => setQty((q) => Math.max(1, q - 1)),
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
