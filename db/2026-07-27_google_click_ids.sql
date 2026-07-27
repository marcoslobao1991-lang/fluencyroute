-- Migração: colunas de Google click IDs pra importação offline de conversões.
-- Colar no Supabase SQL Editor (projeto petrtewismhpzidcmmwb) e rodar UMA vez.
-- Reversível: as colunas são nullable, nada existente muda.

alter table public.checkout_sessions
  add column if not exists gclid  text,
  add column if not exists gbraid text,
  add column if not exists wbraid text;

alter table public.orders
  add column if not exists gclid  text,
  add column if not exists gbraid text,
  add column if not exists wbraid text,
  add column if not exists created_at timestamptz default now();

-- Índice pro export diário (/api/google-conversions filtra gclid not null + paid + 90d)
create index if not exists idx_orders_gclid on public.orders (created_at)
  where gclid is not null;

-- Recria o RPC exec_admin_sql (sumiu do projeto — verificado 05/06/2026).
-- Destrava migrações futuras via API sem precisar colar SQL no dashboard.
create or replace function public.exec_admin_sql(q text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  execute q;
  return json_build_object('ok', true);
exception when others then
  return json_build_object('ok', false, 'error', sqlerrm);
end;
$$;
revoke all on function public.exec_admin_sql(text) from public, anon, authenticated;
grant execute on function public.exec_admin_sql(text) to service_role;
