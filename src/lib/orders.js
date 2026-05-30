// Generates a short, human-readable order ID, unique per order.
// Format: SSW-YYMMDD-XXXX  (e.g. SSW-260530-A7K3)
// Uses crypto.getRandomValues when available so the trailing block is unguessable.
export function generateOrderId() {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // skip ambiguous chars
  let suffix = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(4)
    crypto.getRandomValues(buf)
    for (let i = 0; i < 4; i++) suffix += ALPHABET[buf[i] % ALPHABET.length]
  } else {
    for (let i = 0; i < 4; i++) suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return `SSW-${yy}${mm}${dd}-${suffix}`
}

// Order submission. POSTs to the serverless API (/api/orders -> Supabase).
// In local `vite dev` there is no /api, so we fall back to a simulated success
// to keep the preview usable. In production a real failure surfaces an error.
export async function submitOrder(order) {
  if (!order?.name || !order?.phone || !order?.address) {
    throw new Error('Missing required fields (name, phone, address)')
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    if (res.ok) return res.json()
    // No backend in local dev (404) — simulate success so the form is testable.
    if (import.meta.env.DEV && res.status === 404) return devStub()
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not place order')
  } catch (err) {
    if (import.meta.env.DEV) return devStub()
    throw err
  }
}

function devStub() {
  return { ok: true, id: `local-${Date.now()}` }
}
