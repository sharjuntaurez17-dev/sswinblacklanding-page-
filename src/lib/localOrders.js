// Per-browser order history. We don't have user auth, so every order placed
// from this device is remembered in localStorage so the customer can re-open
// the Your Orders dashboard later and look up their IDs.

const KEY = 'sswin.orders.v1'

function readRaw() {
  try {
    const s = localStorage.getItem(KEY)
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {
    /* quota or private mode — fail silently; dashboard just won't show this order */
  }
}

// Newest first.
export function getOrders() {
  return readRaw().sort((a, b) => (b.placedAt || 0) - (a.placedAt || 0))
}

export function getOrder(id) {
  return readRaw().find((o) => o.orderId === id) || null
}

// Save (or replace, if same ID). Returns the saved record.
export function saveOrder(order) {
  if (!order || !order.orderId) return null
  const record = {
    placedAt: Date.now(),
    ...order,
  }
  const all = readRaw().filter((o) => o.orderId !== order.orderId)
  all.push(record)
  // Cap to last 50 to keep storage tidy.
  const trimmed = all.slice(-50)
  writeRaw(trimmed)
  return record
}

export function removeOrder(id) {
  writeRaw(readRaw().filter((o) => o.orderId !== id))
}

export function clearOrders() {
  writeRaw([])
}
