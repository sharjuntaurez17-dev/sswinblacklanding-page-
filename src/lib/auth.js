// Per-browser user store. Phone is the unique identifier.
// In production this would call a backend + OTP; for now we trust the device.

const USERS_KEY = 'sswin.users.v1'
const CURRENT_KEY = 'sswin.currentUser.v1'

function readUsers() {
  try {
    const s = localStorage.getItem(USERS_KEY)
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function writeUsers(arr) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(arr)) } catch {}
}

function normalizePhone(phone) {
  return (phone || '').toString().replace(/\D/g, '').slice(-10)
}

export function getUsers() {
  return readUsers()
}

export function getUser(phone) {
  const p = normalizePhone(phone)
  return readUsers().find((u) => u.phone === p) || null
}

export function getCurrentUser() {
  try {
    const s = localStorage.getItem(CURRENT_KEY)
    if (!s) return null
    const parsed = JSON.parse(s)
    if (!parsed?.phone) return null
    // Re-hydrate from the canonical record so name updates land.
    const fresh = getUser(parsed.phone)
    return fresh || parsed
  } catch { return null }
}

function setCurrent(user) {
  try {
    if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user))
    else localStorage.removeItem(CURRENT_KEY)
  } catch {}
}

// Returns { ok: true, user } | { ok: false, error }
export function signUp(name, phone) {
  const n = (name || '').trim()
  const p = normalizePhone(phone)
  if (!n) return { ok: false, error: 'Please enter your name.' }
  if (p.length !== 10) return { ok: false, error: 'Enter a valid 10-digit phone number.' }

  const all = readUsers()
  const existing = all.find((u) => u.phone === p)
  if (existing) {
    // If the phone is already registered, treat as login but keep the existing
    // record (don't overwrite their original name).
    setCurrent(existing)
    return { ok: true, user: existing, existed: true }
  }
  const user = { phone: p, name: n, createdAt: Date.now() }
  all.push(user)
  writeUsers(all)
  setCurrent(user)
  return { ok: true, user }
}

export function login(phone) {
  const p = normalizePhone(phone)
  if (p.length !== 10) return { ok: false, error: 'Enter a valid 10-digit phone number.' }
  const user = getUser(p)
  if (!user) return { ok: false, error: 'No account with this number. Please sign up first.' }
  setCurrent(user)
  return { ok: true, user }
}

export function logout() {
  setCurrent(null)
}
