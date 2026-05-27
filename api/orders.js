import { createClient } from '@supabase/supabase-js'

// Vercel serverless function: POST /api/orders
// Inserts an order into Supabase using the service-role key (server-side only).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server not configured (missing Supabase env vars)' })
    return
  }

  const { name, phone, address, pincode, quantity, amount } = req.body || {}
  if (!name || !phone || !address || !pincode) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await supabase
    .from('orders')
    .insert({
      name,
      phone,
      address,
      pincode,
      quantity: Number(quantity) || 1,
      amount: Number(amount) || 0,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(200).json({ ok: true, id: data.id })
}
