-- 26/11/2026: Fluency Fast-Track (upsell do espanhol, entregue por IA). Uma linha por comprador; 'data' guarda onboarding, dias feitos e o Accent Check semanal.
create table if not exists public.spanish_coach (email text primary key, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), transaction text, data jsonb not null default '{}'::jsonb);
alter table public.spanish_coach enable row level security;
grant all on public.spanish_coach to service_role;
alter table public.spanish_coach add column if not exists phone text; create index if not exists spanish_coach_phone on public.spanish_coach(phone);
alter table public.spanish_access add column if not exists phone text; create index if not exists spanish_access_phone on public.spanish_access(phone);
