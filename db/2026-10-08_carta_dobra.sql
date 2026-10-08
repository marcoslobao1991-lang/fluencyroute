-- Altura da tela do leitor (vh) pra linha de dobra média do scrollmap (igual Crazy Egg) + RPC devolvendo fold por página.
alter table public.carta_hm add column if not exists vh int;
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
    round(avg(active_ms))::int as avg_ms,
    round(avg(vh) filter (where vh > 0))::int as fold
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
      'sessions', p.sessions, 'checkouts', p.checkouts, 'n_blocks', p.n_blocks, 'avg_ms', p.avg_ms, 'fold', p.fold,
      'reach', (select jsonb_agg(reach order by i) from blk where blk.page = p.page),
      'dwell', (select jsonb_agg(coalesce(dwell_ms,0) order by i) from blk where blk.page = p.page),
      'clicks', coalesce((select clicks from clk where clk.page = p.page), '[]'::jsonb)
    )) from pages p), '{}'::jsonb)
);
$$;

grant execute on function public.fr_carta_heatmap(text, text, int, text, text, boolean, boolean) to anon;
notify pgrst, 'reload schema';
