// Per-browser support tickets. A customer raises a ticket against an order with
// a comment; it gets a ticket ID and starts "open" (Raised). A real backend
// would flip it to closed; here we also auto-close after a window so the
// "Ticket Closed" state is demonstrable.

const KEY = 'sswin.tickets.v1'

// Demo auto-resolve window (a real backend overrides via status='closed').
export const RESOLVE_WINDOW_MS = 24 * 60 * 60 * 1000 // 1 day

function readRaw() {
  try {
    const s = localStorage.getItem(KEY)
    const p = s ? JSON.parse(s) : []
    return Array.isArray(p) ? p : []
  } catch { return [] }
}
function writeRaw(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {}
}

function genId() {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const b = new Uint8Array(4); crypto.getRandomValues(b)
    for (let i = 0; i < 4; i++) s += A[b[i] % A.length]
  } else { for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)] }
  return `TKT-${yy}${mm}${dd}-${s}`
}

export function getTickets() {
  return readRaw().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function createTicket({ orderId, message }) {
  const rec = {
    id: genId(),
    orderId: orderId || '',
    message: (message || '').slice(0, 1000),
    status: 'open',
    createdAt: Date.now(),
  }
  const all = readRaw()
  all.push(rec)
  writeRaw(all.slice(-100))
  return rec
}

// 'closed' if flagged by backend OR the resolve window has elapsed; else 'open'.
export function ticketStatus(t) {
  if (!t) return 'open'
  if (t.status === 'closed' || t.closedAt) return 'closed'
  return t.createdAt && (Date.now() - t.createdAt) >= RESOLVE_WINDOW_MS ? 'closed' : 'open'
}
