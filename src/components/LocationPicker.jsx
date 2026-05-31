import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { getAddresses, saveAddress, labelOf, displayLabel } from '../lib/addressBook.js'
import { zoneForPincode, deliveryAvailable, shopForPincode } from '../lib/pricing.js'

const EMPTY = { name: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India', labelType: 'home', customLabel: '' }
const WHATSAPP = '919876543210' // TODO: replace with the business WhatsApp number

export default function LocationPicker() {
  const { isLocationOpen, closeLocation, setSelectedAddress, selectedAddress, fulfilment, setFulfilment } = useCart()
  const { t } = useLang()
  const [addresses, setAddresses] = useState([])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('list')   // 'list' | 'add'
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [geoMsg, setGeoMsg] = useState('')

  useEffect(() => {
    if (!isLocationOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isLocationOpen])

  useEffect(() => {
    if (isLocationOpen) { setAddresses(getAddresses()); setMode('list'); setQuery(''); setGeoMsg('') }
  }, [isLocationOpen])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return addresses
    return addresses.filter((a) =>
      [displayLabel(a), a.name, a.address, a.city, a.state, a.pincode]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [addresses, query])

  if (!isLocationOpen) return null

  // Select an address but stay open so the shop + delivery/pickup panel shows.
  // If delivery isn't available for that area, force pickup.
  const pick = (addr) => {
    setSelectedAddress(addr)
    if (addr?.pincode && !deliveryAvailable(addr.pincode)) setFulfilment('pickup')
  }

  const canDeliver = selectedAddress?.pincode ? deliveryAvailable(selectedAddress.pincode) : true
  const shop = shopForPincode(selectedAddress?.pincode)

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setGeoMsg(t('loc.geoUnsupported')); return }
    setGeoMsg(t('loc.geoLocating'))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // GPS captured. Reverse-geocoding (lat/lng -> address/pincode) will be
        // wired with the maps API later; for now save the coords as a location.
        const addr = {
          ...EMPTY,
          labelType: 'other',
          customLabel: t('loc.current'),
          address: t('loc.current'),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        setSelectedAddress(addr)
        setGeoMsg('')
      },
      () => setGeoMsg(t('loc.geoDenied')),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submitNew = (e) => {
    e.preventDefault()
    const er = {}
    if (!form.name.trim()) er.name = t('loc.errName')
    if (!/^\d{10}$/.test(form.phone.trim())) er.phone = t('loc.errPhone')
    if (!form.address.trim()) er.address = t('loc.errAddr')
    if (!/^\d{6}$/.test(form.pincode.trim())) er.pincode = t('loc.errPin')
    setErrors(er)
    if (Object.keys(er).length) return
    const saved = saveAddress(form)
    setSelectedAddress(saved)
    if (saved?.pincode && !deliveryAvailable(saved.pincode)) setFulfilment('pickup')
    setAddresses(getAddresses())
    setMode('list') // back to list so the shop + fulfilment panel shows
  }

  return (
    <div className="locp" role="dialog" aria-modal="true" aria-label="Select your location">
      <div className="locp__head">
        <button className="locp__back" onClick={mode === 'add' ? () => setMode('list') : closeLocation} aria-label="Back">←</button>
        <h2 className="locp__title">{mode === 'add' ? t('loc.addTitle') : t('loc.title')}</h2>
        <button className="checkout__close" onClick={closeLocation} aria-label="Close">×</button>
      </div>

      <div className="locp__body">
        {mode === 'add' ? (
          <form className="locp__form co-card" onSubmit={submitNew}>
            <label className="co-field"><span>{t('co.fullName')}<i>*</i></span>
              <input value={form.name} onChange={set('name')} placeholder="Enter full name" />
              {errors.name && <em className="co-err">{errors.name}</em>}
            </label>
            <label className="co-field"><span>{t('co.phone')}<i>*</i></span>
              <input value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" inputMode="numeric" />
              {errors.phone && <em className="co-err">{errors.phone}</em>}
            </label>
            <label className="co-field"><span>{t('co.street')}<i>*</i></span>
              <textarea value={form.address} onChange={set('address')} rows={2} placeholder="Enter street address" />
              {errors.address && <em className="co-err">{errors.address}</em>}
            </label>
            <div className="co-row co-row--3">
              <label className="co-field"><span>{t('co.city')}</span>
                <input value={form.city} onChange={set('city')} placeholder="City" />
              </label>
              <label className="co-field"><span>{t('co.state')}</span>
                <input value={form.state} onChange={set('state')} placeholder="State" />
              </label>
              <label className="co-field"><span>{t('co.pincode')}<i>*</i></span>
                <input value={form.pincode} onChange={set('pincode')} placeholder="6-digit" inputMode="numeric" />
                {errors.pincode && <em className="co-err">{errors.pincode}</em>}
              </label>
            </div>
            <button className="co-place" type="submit">{t('loc.saveUse')}</button>
          </form>
        ) : (
          <>
            <div className="locp__search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('loc.search')}
              />
              <span className="locp__search-icon" aria-hidden="true">⌕</span>
            </div>

            <div className="locp__actions">
              <button className="locp__action" onClick={useCurrentLocation}>
                <span className="locp__action-icon locp__action-icon--gps" aria-hidden="true">◎</span>
                <span>{t('loc.useCurrent')}</span>
              </button>
              <button className="locp__action" onClick={() => { setForm(EMPTY); setErrors({}); setMode('add') }}>
                <span className="locp__action-icon locp__action-icon--add" aria-hidden="true">＋</span>
                <span>{t('loc.addNew')}</span>
              </button>
              <a
                className="locp__action"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, please help me set my delivery address.')}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="locp__action-icon locp__action-icon--wa" aria-hidden="true">✆</span>
                <span>{t('loc.request')}</span>
              </a>
            </div>
            {geoMsg && <p className="locp__geo">{geoMsg}</p>}

            <div className="locp__saved">
              <span className="locp__saved-label">{t('loc.saved')}</span>
              {filtered.length === 0 ? (
                <p className="locp__empty">{t('loc.none')}</p>
              ) : (
                <ul className="locp__list">
                  {filtered.map((a) => {
                    const lab = labelOf(a.labelType)
                    const isSel = selectedAddress && (selectedAddress.id === a.id)
                    const z = a.pincode ? zoneForPincode(a.pincode).label : ''
                    return (
                      <li key={a.id} className="locp__item">
                        <button className="locp__item-main" onClick={() => pick(a)}>
                          <span className="locp__item-icon" aria-hidden="true">{lab.icon}</span>
                          <span className="locp__item-body">
                            <span className="locp__item-row">
                              <strong>{a.customLabel ? a.customLabel : lab.label}</strong>
                              {isSel && <span className="locp__selected">{t('loc.selected')}</span>}
                            </span>
                            <span className="locp__item-line">
                              {[a.address, a.city, a.pincode].filter(Boolean).join(', ')}
                            </span>
                            {z && <span className="locp__item-zone">{z}</span>}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Once an address is selected: fulfilment choice + shop card */}
            {selectedAddress && (
              <div className="locp__fulfil">
                <span className="locp__saved-label">{t('loc.howGet')}</span>

                <div className="locp__methods">
                  <button
                    type="button"
                    className={`locp__method${fulfilment === 'delivery' ? ' is-active' : ''}${canDeliver ? '' : ' is-disabled'}`}
                    disabled={!canDeliver}
                    onClick={() => canDeliver && setFulfilment('delivery')}
                  >
                    <span className="locp__method-icon" aria-hidden="true">🚚</span>
                    <span className="locp__method-body">
                      <strong>{t('loc.delivery')}</strong>
                      <span>{canDeliver ? t('loc.deliveryOk') : t('loc.deliveryNo')}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`locp__method${fulfilment === 'pickup' ? ' is-active' : ''}`}
                    onClick={() => setFulfilment('pickup')}
                  >
                    <span className="locp__method-icon" aria-hidden="true">🏬</span>
                    <span className="locp__method-body">
                      <strong>{t('loc.pickup')}</strong>
                      <span>{t('loc.pickupDesc')}</span>
                    </span>
                  </button>
                </div>

                {/* Shop address + call (always shown; the pickup point) */}
                <div className="locp__shop">
                  <span className="locp__shop-icon" aria-hidden="true">📍</span>
                  <div className="locp__shop-body">
                    <strong>{shop.name}</strong>
                    <span>{shop.address}</span>
                    <div className="locp__shop-actions">
                      <a className="locp__shop-call" href={`tel:+${shop.phone}`}>
                        ✆ {t('loc.callShop')}
                      </a>
                      <a className="locp__shop-map" href={shop.mapsUrl} target="_blank" rel="noreferrer">
                        {t('loc.directions')}
                      </a>
                    </div>
                  </div>
                </div>

                <button className="co-place locp__confirm" onClick={closeLocation}>
                  {t('loc.confirm')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
