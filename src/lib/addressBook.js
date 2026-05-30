// Per-browser address book. Saves shipping addresses (with a Home/Work/Friend/Other
// label) so the customer can re-use them on later checkouts and order to someone
// else's address without retyping. Designed so GPS coordinates can be added later
// without breaking existing records.

const KEY = 'sswin.addresses.v1'

// Label palette — used by the tabs UI and to render an icon on saved cards.
export const ADDRESS_LABELS = [
  { id: 'home',   label: 'Home',   icon: '🏠' },
  { id: 'work',   label: 'Work',   icon: '💼' },
  { id: 'friend', label: 'Friend', icon: '👥' },
  { id: 'other',  label: 'Other',  icon: '📍' },
]

export const labelOf = (id) => ADDRESS_LABELS.find((l) => l.id === id) || ADDRESS_LABELS[3]

// What to show as the card title. If the user gave the address a custom name
// (e.g. "Mom's House") that's used; otherwise we fall back to the tab default.
export const displayLabel = (addr) =>
  (addr?.customLabel && addr.customLabel.trim()) || labelOf(addr?.labelType).label

function newId() {
  return 'addr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
}

function readRaw() {
  try {
    const s = localStorage.getItem(KEY)
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function writeRaw(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch { /* quota / private mode */ }
}

// Newest first.
export function getAddresses() {
  return readRaw().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

// Save an address. If an existing record matches by id, it's updated; otherwise a
// near-duplicate (same address + pincode + label) is updated in place instead of
// piling up clones. Otherwise a new record is appended.
export function saveAddress(addr) {
  if (!addr || !addr.address?.trim()) return null
  const all = readRaw()

  let id = addr.id
  let target = id ? all.find((a) => a.id === id) : null

  if (!target) {
    target = all.find((a) =>
      (a.address || '').trim() === addr.address.trim() &&
      (a.pincode || '').trim() === (addr.pincode || '').trim() &&
      (a.labelType || 'home') === (addr.labelType || 'home')
    )
    id = target?.id || newId()
  }

  const record = {
    id,
    labelType: addr.labelType || 'home',
    customLabel: (addr.customLabel || '').trim(),
    name: addr.name || '',
    phone: addr.phone || '',
    address: addr.address || '',
    city: addr.city || '',
    state: addr.state || '',
    pincode: addr.pincode || '',
    country: addr.country || 'India',
    // GPS slots — populated later by the upcoming geolocation flow.
    lat: addr.lat ?? null,
    lng: addr.lng ?? null,
    updatedAt: Date.now(),
  }

  const next = all.filter((a) => a.id !== id)
  next.push(record)
  // Cap to 30 to keep storage tidy.
  writeRaw(next.slice(-30))
  return record
}

export function deleteAddress(id) {
  writeRaw(readRaw().filter((a) => a.id !== id))
}
