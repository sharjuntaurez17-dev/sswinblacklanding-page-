# SS WIN — Order & Payment System Plan

Adds ordering, storage, an admin dashboard, and payments to the landing page.

## Stack
- **Frontend:** existing Vite + React (this repo)
- **Backend:** Vercel serverless functions (`/api/*`)
- **Database + Auth:** Supabase (Postgres)
- **Payments:** Razorpay (Card + UPI incl. GPay/PhonePe + netbanking, one checkout)

## Data model (Supabase `orders` table)
| column | type | notes |
|---|---|---|
| id | uuid (pk, default gen) | |
| created_at | timestamptz default now() | |
| name | text | customer name |
| phone | text | |
| address | text | |
| pincode | text | |
| quantity | int | number of 26kg bags |
| amount | int | total in paise |
| status | text | `pending` / `paid` / `failed` |
| razorpay_order_id | text | |
| razorpay_payment_id | text | |

## Phases (each independently shippable)
1. **Order section UI** — form (Name, Phone, Address, Pincode, Quantity) on the left, bag image on the right. Submit goes through `src/lib/orders.js` (stubbed now, wired to API later). *No accounts needed.*
2. **Backend + DB** — `POST /api/orders` inserts into Supabase. *Needs: Supabase project URL + anon key + service-role key (env vars on Vercel).*
3. **Admin dashboard** — protected `/admin` route lists orders. *Auth via Supabase.*
4. **Payments** — `POST /api/payment/create` (Razorpay order) + `POST /api/payment/verify` (signature check); Razorpay Checkout on the frontend updates order `status`. *Needs: Razorpay key_id + key_secret (test first).*

## What the user must provide (per phase)
- **Phase 2:** Supabase account → create project → URL + anon key + service-role key.
- **Phase 4:** Razorpay account → Test Mode API keys (key_id, key_secret); live keys after KYC.
- **Deploy:** connect this GitHub repo to Vercel; set the above as Environment Variables.

## Secrets
All keys live in Vercel Environment Variables / `.env.local` (gitignored) — never committed. Only the Razorpay `key_id` and Supabase `anon` key are exposed to the browser; service-role key and Razorpay secret stay server-side in serverless functions.
