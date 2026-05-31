// Per-browser star ratings + improvement feedback.
const KEY = 'sswin.feedback.v1'

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

export function getFeedback() {
  return readRaw().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function saveFeedback({ rating, message }) {
  const rec = {
    id: 'FB-' + Date.now().toString(36),
    rating: Math.max(1, Math.min(5, Math.round(rating) || 0)),
    message: (message || '').slice(0, 1000),
    createdAt: Date.now(),
  }
  const all = readRaw()
  all.push(rec)
  writeRaw(all.slice(-100))
  return rec
}
