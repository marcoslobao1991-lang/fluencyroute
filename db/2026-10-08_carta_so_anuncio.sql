-- Filtro "só anúncio" (padrão) nas 3 leituras do mapa de calor.
-- Clique real de anúncio chega com utm_content = "{{ad.name}}|{{ad.id}}" (termina em |número do anúncio).
-- Fica de fora: visita sem UTM (nós, direto, orgânico), prévia/teste com UTM quebrada (codificada, sem o id)
-- e janela invisível (vw = 0).
drop function if exists public.fr_carta_heatmap(text, text, int, text, text, boolean);
drop function if exists public.fr_carta_leitores(text, int, text, text, boolean);
drop function if exists public.fr_carta_sessoes(text, text[], int, text, text, boolean);

create or replace function public.fr_carta_hm_ok(u text, vw int) returns boolean
language sql immutable as $$ select coalesce(u ~ '\|[0-9]{8,}$', false) and coalesce(vw, 0) > 0 $$;

create or replace function public.fr_carta_heatmap(p_slug text, p_ver text, p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false, p_ads boolean default true)
returns jsonb
language sql
security definer
set search_path = public
as $$
with last as (
  select distinct on (sid, page) *
  from carta_hm
  where slug = p_slug and ver = p_ver
    and ts > now() - make_interval(days => greatest(1, least(p_days, 365)))
    and (p_device = 'all' or (p_device = 'mobile' and mobile) or (p_device = 'desktop' and not mobile))
    and (p_utm is null or utm_content = p_utm)
    and (case when p_qa then sid like 'qa_%' else sid not like 'qa_%' end)
    and (p_qa or not p_ads or fr_carta_hm_ok(utm_content, vw))
  order by sid, page, ts desc
),
ok as (select * from last where active_ms >= 2000),
pages as (
  select page,
    count(*) as sessions,
    count(*) filter (where checkout) as checkouts,
    max(n_blocks) as n_blocks,
    round(avg(active_ms))::int as avg_ms
  from ok group by page
),
blk as (
  select o.page, b.i,
    count(*) filter (where o.reached >= b.i) as reach,
    round(avg((o.dwell->>b.i)::numeric) filter (where o.reached >= b.i))::int as dwell_ms
  from ok o
  cross join lateral generate_series(0, o.n_blocks - 1) as b(i)
  group by o.page, b.i
),
clk as (
  select page, jsonb_agg(c) as clicks
  from (select page, c, row_number() over (partition by page order by ts desc) rn
        from ok, jsonb_array_elements(ok.clicks) c) z
  where rn <= 3000
  group by page
)
select jsonb_build_object(
  'slug', p_slug, 'ver', p_ver, 'days', p_days, 'device', p_device, 'utm', p_utm,
  'utms', (select coalesce(jsonb_agg(u order by n desc), '[]') from (select utm_content u, count(distinct sid) n from ok where utm_content is not null group by 1 order by 2 desc limit 30) q),
  'pages', coalesce((select jsonb_object_agg(p.page, jsonb_build_object(
      'sessions', p.sessions, 'checkouts', p.checkouts, 'n_blocks', p.n_blocks, 'avg_ms', p.avg_ms,
      'reach', (select jsonb_agg(reach order by i) from blk where blk.page = p.page),
      'dwell', (select jsonb_agg(coalesce(dwell_ms,0) order by i) from blk where blk.page = p.page),
      'clicks', coalesce((select clicks from clk where clk.page = p.page), '[]'::jsonb)
    )) from pages p), '{}'::jsonb)
);
$$;

create or replace function public.fr_carta_leitores(p_slug text, p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false, p_ads boolean default true)
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
    and (p_qa or not p_ads or fr_carta_hm_ok(utm_content, vw))
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
  'list', coalesce((select jsonb_agg(jsonb_build_object('sid', sid, 'ini', ini, 'fim', fim, 'mobile', mobile, 'utm', utm, 'ms', total_ms, 'ck', checkout, 'p', pages) order by checkout desc, ini desc)
     from (select * from ok order by checkout desc, ini desc limit 300) z), '[]'::jsonb)
);
$$;

create or replace function public.fr_carta_sessoes(p_slug text, p_vers text[], p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false, p_ads boolean default true)
returns jsonb
language sql
security definer
set search_path = public
as $$
with rows as (
  select * from carta_hm
  where slug = p_slug and ver = any(p_vers)
    and ts > now() - make_interval(days => greatest(1, least(p_days, 365)))
    and (p_device = 'all' or (p_device = 'mobile' and mobile) or (p_device = 'desktop' and not mobile))
    and (p_utm is null or utm_content = p_utm)
    and (case when p_qa then sid like 'qa_%' else sid not like 'qa_%' end)
    and (p_qa or not p_ads or fr_carta_hm_ok(utm_content, vw))
),
last as (select distinct on (sid, page) sid, page, reached, active_ms, dwell, checkout from rows order by sid, page, ts desc),
ok as (select sid from last group by sid having sum(active_ms) >= 2000 order by max(active_ms) desc limit 600)
select coalesce(jsonb_agg(jsonb_build_array(l.sid, l.page, l.reached, l.dwell, l.checkout)), '[]'::jsonb)
from last l join ok using (sid);
$$;

grant execute on function public.fr_carta_heatmap(text, text, int, text, text, boolean, boolean) to anon;
grant execute on function public.fr_carta_leitores(text, int, text, text, boolean, boolean) to anon;
grant execute on function public.fr_carta_sessoes(text, text[], int, text, text, boolean, boolean) to anon;
notify pgrst, 'reload schema';
