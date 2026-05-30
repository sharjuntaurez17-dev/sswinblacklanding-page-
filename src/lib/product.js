// Single source of truth for the product + pricing.
// Prices below are rough placeholders — swap for real wholesale prices
// when confirmed.
export const PRODUCT = {
  name: 'MUTHU WIN SS — Nei Kichadi Ponni Rice',
  shortName: 'Nei Kichadi Ponni Rice',
  image: '/ss-win-bag.png',
}

// Available pack sizes. Order here drives display order in the UI.
export const PACKS = [
  { size: '5 kg', price: 320 },
  { size: '10 kg', price: 600 },
  { size: '26 kg', price: 1500 },
]

// The pack selected by default when the page loads.
export const DEFAULT_SIZE = '26 kg'
