// Per-browser order history. We don't have user auth, so every order placed
// from this device is remembered in localStorage so the customer can re-open
// the Your Orders dashboard later and look up their IDs.

const KEY = 'sswin.orders.v1'

// How long after placing an order we consider it delivered (matches the
// "2-3 days" ETA shown in tracking). A real backend can override this by
// setting order.status = 'delivered' explicitly.
export const DELIVERY_WINDOW_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

// True once the order is delivered — either flagged by the backend/status, or
// because its delivery window has elapsed.
export function isDelivered(order) {
  if (!order) return false
  if (order.status === 'delivered' || order.deliveredAt) return true
  return !!order.placedAt && (Date.now() - order.placedAt) >= DELIVERY_WINDOW_MS
}

// Persist an explicit status for an order (used by the tracking write-back and
// future backend sync).
export function setOrderStatus(id, status) {
  const all = readRaw()
  const o = all.find((x) => x.orderId === id)
  if (!o) return
  o.status = status
  if (status === 'delivered' && !o.deliveredAt) o.deliveredAt = Date.now()
  writeRaw(all)
}

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
