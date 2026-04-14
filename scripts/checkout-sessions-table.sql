-- ═══════════════════════════════════════════════════════════════
-- checkout_sessions — cart stitching for Kiwify Purchase CAPI
-- Captures fbc/fbp/ua/ip/fbclid at /vsl CTA click, webhook reads
-- them back via session_id passed through Kiwify query params.
-- ═══════════════════════════════════════════════════════════════

create table if not exists checkout_sessions (
  id          uuid primary key default gen_random_uuid(),
  session_id  text unique not null,
  fbc         text,
  fbp         text,
  fbclid      text,
  ip          text,
  ua          text,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  utm_content text,
  utm_term    text,
  sck         text,
  created_at  timestamptz default now()
);

create index if not exists checkout_sessions_session_id_idx on checkout_sessions(session_id);
create index if not exists checkout_sessions_created_at_idx on checkout_sessions(created_at desc);

-- RLS kept off (service-role inserts/reads only)
alter table checkout_sessions disable row level security;
