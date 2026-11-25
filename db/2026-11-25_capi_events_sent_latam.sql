create table if not exists public.capi_events_sent (id bigserial primary key, event_id text not null unique, event_name text, order_id text, created_at timestamptz not null default now()); alter table public.capi_events_sent enable row level security;
grant select, insert on public.capi_events_sent to service_role; grant usage, select on sequence public.capi_events_sent_id_seq to service_role;
