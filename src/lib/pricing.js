// Pincode-zone pricing. The per-bag price changes by delivery zone, and the
// zone is decided by the pincode the customer enters at checkout.
//
// ⚠️ The rates below are EDITABLE PLACEHOLDERS — replace the numbers with your
// real zone rates. Zones are matched top-to-bottom (most specific first); the
// first zone whose `match(pincode)` returns true wins. `DEFAULT_ZONE` is used
// when no/blank/unknown pincode is entered (e.g. in the cart before checkout).

// `delivery` = whether home delivery is available for that zone. Where it's
// false, only pickup from the shop is offered.
export const ZONES = [
  {
    id: 'local',
    label: 'Coimbatore (Local)',
    // Coimbatore city pincodes start 6410xx–6414xx
    match: (p) => ['6410', '6411', '6412', '6413', '6414'].some((pre) => p.startsWith(pre)),
    prices: { '5 kg': 320, '10 kg': 600, '26 kg': 1500 },
    delivery: true,
    // The branch that serves this area (located within it).
    shop: {
      name: 'MUTHU WIN SS · Coimbatore',
      address: 'Gandhipuram, Coimbatore, Tamil Nadu 641012',
      pincode: '641012',
      phone: '919876543210',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gandhipuram+Coimbatore+641012',
    },
  },
  {
    id: 'kongu',
    label: 'Kongu Belt',
    // Tiruppur (641/642), Erode (638), Salem (636), Namakkal (637), Karur (639)
    match: (p) => ['641', '642', '638', '637', '636', '639'].some((pre) => p.startsWith(pre)),
    prices: { '5 kg': 335, '10 kg': 630, '26 kg': 1560 },
    delivery: true,
    shop: {
      name: 'MUTHU WIN SS · Kangayam',
      address: 'Main Road, Kangayam, Tiruppur District, Tamil Nadu 638701',
      pincode: '638701',
      phone: '919876543211',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kangayam+638701',
    },
  },
  {
    id: 'tn',
    label: 'Tamil Nadu',
    // any other Tamil Nadu pincode (6xxxxx)
    match: (p) => p.startsWith('6'),
    prices: { '5 kg': 350, '10 kg': 660, '26 kg': 1620 },
    delivery: false, // outside the Kongu belt — pickup only for now
    shop: {
      name: 'MUTHU WIN SS · Chennai',
      address: 'Koyambedu Market, Chennai, Tamil Nadu 600092',
      pincode: '600092',
      phone: '919876543212',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Koyambedu+Chennai+600092',
    },
  },
  {
    id: 'other',
    label: 'Other States',
    match: () => true, // everything else
    prices: { '5 kg': 370, '10 kg': 700, '26 kg': 1700 },
    delivery: false, // pickup only
    shop: {
      name: 'MUTHU WIN SS · Kangayam (Main)',
      address: 'Main Road, Kangayam, Tiruppur District, Tamil Nadu 638701',
      pincode: '638701',
      phone: '919876543211',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kangayam+638701',
    },
  },
]

// Default shop (used before a pincode is known). Each zone above has its own
// branch; the picker shows the branch for the customer's pincode area.
export const SHOP = ZONES[1].shop // Kangayam main

// Zone shown before a pincode is entered (cart drawer, fresh checkout).
export const DEFAULT_ZONE = ZONES[0] // Local

function normalize(pincode) {
  return (pincode || '').toString().replace(/\D/g, '')
}

// Resolve the zone for a pincode. Needs a full 6-digit pincode to be specific;
// otherwise falls back to the default zone.
export function zoneForPincode(pincode) {
  const p = normalize(pincode)
  if (p.length !== 6) return DEFAULT_ZONE
  return ZONES.find((z) => z.match(p)) || DEFAULT_ZONE
}

// Per-bag price for a size at a given pincode.
export function priceFor(size, pincode) {
  const zone = zoneForPincode(pincode)
  return zone.prices[size] ?? DEFAULT_ZONE.prices[size] ?? 0
}

// Is home delivery available for this pincode's zone?
export function deliveryAvailable(pincode) {
  return !!zoneForPincode(pincode).delivery
}

// The branch that serves a given pincode (located in that area).
export function shopForPincode(pincode) {
  return zoneForPincode(pincode).shop || SHOP
}
