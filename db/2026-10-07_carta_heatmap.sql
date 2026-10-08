-- Mapa de calor das cartas (/carta e afins). Uma linha = um retrato acumulado de (sessão, página da carta).
-- O tracker manda retratos cumulativos; a leitura pega o último retrato de cada (sid, page).
create table if not exists public.carta_hm (
  id bigserial primary key,
  ts timestamptz not null default now(),
  slug text not null,
  ver text not null,
  page text not null,
  sid text not null,
  n_blocks int not null,
  reached int not null,
  active_ms int not null default 0,
  dwell jsonb not null default '[]'::jsonb,
  clicks jsonb not null default '[]'::jsonb,
  checkout boolean not null default false,
  mobile boolean,
  vw int,
  utm_source text,
  utm_campaign text,
  utm_content text,
  constraint carta_hm_sizes check (
    length(slug) <= 40 and length(ver) <= 40 and length(page) <= 10 and length(sid) <= 80
    and n_blocks between 0 and 2000 and reached between -1 and 2000
    and jsonb_array_length(dwell) <= 2000 and jsonb_array_length(clicks) <= 80
    and coalesce(length(utm_source),0) <= 200 and coalesce(length(utm_campaign),0) <= 300 and coalesce(length(utm_content),0) <= 300
  )
);
create index if not exists carta_hm_slug_ts on public.carta_hm (slug, ts desc);
create index if not exists carta_hm_sid_page on public.carta_hm (sid, page, ts desc);

alter table public.carta_hm enable row level security;
drop policy if exists carta_hm_insert on public.carta_hm;
create policy carta_hm_insert on public.carta_hm for insert to anon with check (true);
grant insert on public.carta_hm to anon;
grant usage, select on sequence public.carta_hm_id_seq to anon;

-- Leitura agregada pro visualizador (?hm=1 na própria carta).
-- p_device: 'all' | 'mobile' | 'desktop' · p_utm: filtra utm_content (null = todos)
-- Sessão válida = pelo menos 2 s de leitura ativa naquela página (corta prefetch do Instagram e robô).
drop function if exists public.fr_carta_heatmap(text, text, int, text, text);
-- p_qa: true = só sessões de teste (sid qa_*), pro QA do visualizador
create or replace function public.fr_carta_heatmap(p_slug text, p_ver text, p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false)
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
grant execute on function public.fr_carta_heatmap(text, text, int, text, text, boolean) to anon;
