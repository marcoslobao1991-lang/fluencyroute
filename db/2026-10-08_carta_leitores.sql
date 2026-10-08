-- Aba "Leitores" do mapa de calor: uma linha por pessoa (sessão), com tempo ativo e quanto viu de cada página.
-- Não filtra por versão (a pessoa pode cruzar páginas de versões diferentes); usa o último retrato de cada (sid, page).
-- Sessão válida = pelo menos 2 s de leitura ativa somando as páginas (mesmo corte do mapa).
create or replace function public.fr_carta_leitores(p_slug text, p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false)
returns jsonb
language sql
security definer
set search_path = public
as $$
with rows as (
  select * from carta_hm
  where slug = p_slug
    and ts > now() - make_interval(days => greatest(1, least(p_days, 365)))
    and (p_device = 'all' or (p_device = 'mobile' and mobile) or (p_device = 'desktop' and not mobile))
    and (p_utm is null or utm_content = p_utm)
    and (case when p_qa then sid like 'qa_%' else sid not like 'qa_%' end)
),
last as (select distinct on (sid, page) * from rows order by sid, page, ts desc),
ini as (select sid, min(ts) as ini, max(ts) as fim from rows group by sid),
ses as (
  select l.sid, i.ini, i.fim,
    bool_or(l.mobile) as mobile, max(l.utm_content) as utm,
    sum(l.active_ms)::int as total_ms, bool_or(l.checkout) as checkout,
    jsonb_object_agg(l.page, jsonb_build_array(l.active_ms, l.reached + 1, l.n_blocks)) as pages
  from last l join ini i using (sid)
  group by l.sid, i.ini, i.fim
),
ok as (select * from ses where total_ms >= 2000)
select jsonb_build_object(
  'n', (select count(*) from ok),
  'checkouts', (select count(*) from ok where checkout),
  'median_ms', (select percentile_cont(0.5) within group (order by total_ms)::int from ok),
  'faixas', jsonb_build_array(
    (select count(*) from ok where total_ms < 10000),
    (select count(*) from ok where total_ms >= 10000 and total_ms < 60000),
    (select count(*) from ok where total_ms >= 60000 and total_ms < 180000),
    (select count(*) from ok where total_ms >= 180000 and total_ms < 600000),
    (select count(*) from ok where total_ms >= 600000)),
  'list', coalesce((select jsonb_agg(jsonb_build_object('ini', ini, 'fim', fim, 'mobile', mobile, 'utm', utm, 'ms', total_ms, 'ck', checkout, 'p', pages) order by checkout desc, ini desc)
     from (select * from ok order by checkout desc, ini desc limit 300) z), '[]'::jsonb)
);
$$;
grant execute on function public.fr_carta_leitores(text, int, text, text, boolean) to anon;
notify pgrst, 'reload schema';
