-- SS WIN orders table. Run this in Supabase → SQL Editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  address text not null,
  pincode text not null,
  quantity int not null default 1,
  amount int not null default 0,          -- total in paise
  status text not null default 'pending', -- pending | paid | failed
  razorpay_order_id text,
  razorpay_payment_id text
);

-- Row Level Security: lock the table down. Writes/reads go through serverless
-- functions using the service-role key (which bypasses RLS), so no public
-- policies are needed. The admin dashboard reads via a server function too.
alter table public.orders enable row level security;
