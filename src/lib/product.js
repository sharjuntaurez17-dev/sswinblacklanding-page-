// Single source of truth for the product + pricing (shared by cart, etc.)
export const PRODUCT = {
  name: 'MUTHU WIN SS — Sortex Ponni Rice',
  shortName: 'Sortex Ponni Rice',
  pricePerBag: 1500, // ₹ for the default (26kg) pack used by the cart
  image: '/ss-win-bag.png',
}

// Available pack sizes shown on the product section.
// NOTE: 10kg & 5kg prices are placeholders — replace with the real prices.
export const PACKS = [
  { size: '26 kg', price: 1500 },
  { size: '10 kg', price: 600 },
  { size: '5 kg', price: 320 },
]
