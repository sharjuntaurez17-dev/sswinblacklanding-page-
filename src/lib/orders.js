// Order submission. POSTs to the serverless API (/api/orders -> Supabase).
// In local `vite dev` there is no /api, so we fall back to a simulated success
// to keep the preview usable. In production a real failure surfaces an error.
export async function submitOrder(order) {
  if (!order?.name || !order?.phone || !order?.address || !order?.pincode) {
    throw new Error('Missing required fields')
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
