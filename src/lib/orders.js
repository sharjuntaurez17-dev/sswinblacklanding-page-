// Order submission. Phase 1: no backend yet, so this validates and resolves
// locally. Phase 2 will POST to /api/orders (Supabase); Phase 4 will kick off
// Razorpay checkout. Keeping this isolated means the UI doesn't change later.
export async function submitOrder(order) {
  // Basic shape guard; the form already validates fields.
  if (!order?.name || !order?.phone || !order?.address || !order?.pincode) {
    throw new Error('Missing required fields')
  }

  // TODO (Phase 2): replace with a real request once the backend exists.
  // const res = await fetch('/api/orders', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(order),
  // })
  // if (!res.ok) throw new Error('Could not place order')
  // return res.json()

  await new Promise((r) => setTimeout(r, 600)) // simulate network
  return { ok: true, id: `local-${Date.now()}` }
}
