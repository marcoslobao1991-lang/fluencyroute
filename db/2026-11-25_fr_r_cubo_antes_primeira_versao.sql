CREATE OR REPLACE FUNCTION public.fr_r_cubo(p_funnel text, p_de date, p_ate date, p_oferta integer DEFAULT 999)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET "TimeZone" TO 'America/Sao_Paulo'
 SET statement_timeout TO '10s'
AS $function$
with meus as (
  select distinct campaign_id::text as id from public.ad_spend_daily
), e as (
  select session_id, ts, case when page = 'vsl2' then 'vsl' else page end as page, event, detail, variant, path,
         utm_campaign, utm_content, utm_source, user_agent, fbclid, pais
    from public.funnel_events
   where funnel = p_funnel and ts >= p_de::timestamptz and ts < (p_ate + 1)::timestamptz and coalesce(page, '') <> 'obrigado'
), s as (
  select session_id,
         (array_agg(page order by ts))[1] as pg1,
         (array_agg(path order by ts) filter (where path is not null))[1] as path1,
         max(variant) filter (where page = 'vsl') as variant,
         max(pais) as pais, max(utm_campaign) as camp, max(utm_content) as cont, max(utm_source) as src, max(user_agent) as ua, max(fbclid) as fbc,
         min(ts) as ini,
         max(ts) filter (where page = 'vsl') - min(ts) filter (where page = 'vsl') as dur,
         max(detail) filter (where event = 'play_modo') as modo_ev,
         bool_or(event = 'pageview') as pv,
         bool_or(event = 'pageview' and page = 'vsl') as pvv,
         bool_or((event in ('video_play', 'presell_play') or (event = 'video_minute' and detail ~ '^[0-9]+$')) and page = 'vsl') as play,  -- 19/11: minuto assistido prova o play (no iPhone/IG o evento do toque às vezes se perde)
         coalesce(max(case when event = 'video_minute' and page = 'vsl' and detail ~ '^[0-9]+$' then detail::int end), 0) as mx,
         bool_or(event = 'video_reveal') as rev,
         bool_or(event = 'checkout_click') as ic
    from e group by 1
), k as (
  select s.*,
         case when camp like '%|%' then regexp_replace(camp, '^.*\|', '') when camp ~ '^[0-9]+$' then camp end as cid
    from s
   where coalesce(ua, '') not ilike '%en_US%' and coalesce(src, '') not ilike 'qa%'
), d as (
  select k.*,
         case when cid in (select id from meus) then 'minhas'
              when variant like 'af\_%' or path1 like '%af=%' or path1 like '/bridge-af%' or (p_funnel = 'tabuada' and path1 like '/vsl97%') then 'afiliado'
              when camp ~ '^[0-9]+$' then 'afiliado'
              when camp is not null then 'minhas'
              else 'direto' end as origem,
         case when pg1 like 'bridge%' then 'Bridge' when pg1 = 'quiz' then 'Quiz' when pg1 like 'carta%' then 'Carta'
              when pg1 = 'vsl' then 'VSL' else coalesce(pg1, '?') end as entrada,
         coalesce(nullif(regexp_replace(regexp_replace(regexp_replace(coalesce(variant, ''), '^(af_)?vsl_', ''), '_ig$', ''), '_x[0-9]+$', ''), ''),
                  substring(path1 from '[?&]af=([a-z0-9]+)'), substring(path1 from '[?&]vsl=([a-z0-9]+)'),
                  nullif(regexp_replace(split_part(coalesce(path1, ''), '?', 1), '/$', ''), ''), '-') as versao,
         coalesce(modo_ev,
                  case when coalesce(variant, '') like '%vsl_friends%'
                       then case when ini >= '2026-11-18 16:07:00+00' then 'presell' else 'cadeado' end
                       else 'padrao' end) as modo,
         nullif(split_part(coalesce(camp, ''), '|', 1), '') as campnome,
         nullif(split_part(coalesce(cont, ''), '|', 1), '') as anuncio,
         nullif(split_part(coalesce(cont, ''), '|', 2), '') as adid,
         rev or mx >= case when coalesce(variant, '') like '%vsl_aula%' then 46 when coalesce(variant, '') like '%vsl_friends%' then 12 else p_oferta end as oferta
    from k
), g1 as (  -- 1) mesmo clique (fbclid) = 1
  select d.*, case when fbc is not null and length(fbc) > 20 then 'f:' || md5(fbc) else 's:' || session_id end as k1,
         lower(coalesce(substring(ua from '\((iPhone[0-9]+,[0-9]+);'), '') || '|' || regexp_replace(coalesce(substring(ua from '\(([^)]*)\)'), ''), '; wv|;? ?build/[^;]*', '', 'gi')) as dev
    from d
), g2 as (
  select *, sum(novo) over (partition by coalesce(anuncio, k1), dev order by ini rows unbounded preceding) as grp
    from (select g1.*, case when anuncio is null or lag(ini) over w is null then 1 when lag(k1) over w = k1 then 0 when ini - lag(ini) over w > interval '15 minutes' then 1 else 0 end as novo from g1 window w as (partition by anuncio, dev order by ini)) z
), pe as (  -- 2) mesmo aparelho + mesmo anúncio em 15 min = 1 pessoa (só tráfego de anúncio); o resto fica por clique/sessão
  select (array_agg(origem order by ini))[1] as origem, (array_agg(entrada order by ini))[1] as entrada, (array_agg(versao order by ini))[1] as versao,
         (array_agg(modo order by ini))[1] as modo, (array_agg(campnome order by ini))[1] as campnome, (array_agg(anuncio order by ini))[1] as anuncio,
         (array_agg(adid order by ini))[1] as adid, (array_agg(pais order by ini) filter (where pais is not null))[1] as pais, (array_agg(cid order by ini))[1] as cid, min(ini) as ini,
         bool_or(pv) as pv, bool_or(pvv) as pvv, max(dur) as dur, bool_or(play) as play, max(mx) as mx, bool_or(oferta) as oferta, bool_or(ic) as ic
    from g2 group by case when anuncio is not null then 'a:' || anuncio || '|' || dev || '|' || grp else k1 end
), p0 as (
  select fe.ts, fe.value, fe.detail, split_part(fe.detail, ':', 2) as oid, nullif(split_part(fe.detail, ':', 3), '') as prod,
         fe.utm_campaign, fe.utm_content, fe.pais
    from public.funnel_events fe
   where fe.event = 'purchase' and fe.ts >= p_de::timestamptz and fe.ts < (p_ate + 1)::timestamptz
     and (fe.funnel = p_funnel or (p_funnel = 'tabuada' and fe.funnel = 'escola'))
     and fe.detail not like 'kiwify:sim-%'
), p1 as (
  select case when p0.prod is null then p0.detail else to_char(date_trunc('minute', p0.ts), 'YYYYMMDDHH24MI') || coalesce(p0.utm_content, '') end as chave,
         min(p0.ts) as ts, sum(p0.value) as valor,
         string_agg(coalesce(p0.prod, 'principal'), ' + ' order by p0.value desc) as itens,
         bool_or(p0.prod is null or p0.prod = p_funnel) as principal,
         max(coalesce(o.utm_campaign, p0.utm_campaign)) as camp, max(coalesce(o.utm_content, p0.utm_content)) as cont, max(o.vturb_sck) as sck,
         max(o.meta_fbc) as fbc, max(o.meta_fbp) as fbp, max(p0.pais) as pais, max(o.utm_source) as osrc, max(o.utm_medium) as omed
    from p0 left join public.orders o on o.pagarme_order_id = p0.oid
   group by 1
), p as (
  select p1.*, case when camp like '%|%' then regexp_replace(camp, '^.*\|', '') when camp ~ '^[0-9]+$' then camp end as cid
    from p1 where principal
)
select json_build_object(
  'de', p_de, 'ate', p_ate,
  'linhas', coalesce((select json_agg(x) from (
      select to_char(ini, 'YYYY-MM-DD') as dia, origem, entrada, versao, modo,
             coalesce(anuncio, '') as anuncio, coalesce(adid, '') as adid, coalesce(campnome, '') as campanha, coalesce(cid, '') as cid, coalesce(pais, '?') as pais,
             count(*) filter (where pv) as entrou, count(*) filter (where pvv) as vsl,
             count(*) filter (where pvv and dur >= interval '3 seconds') as ficou,
             count(*) filter (where play) as play, count(*) filter (where play and oferta) as oferta,
             count(*) filter (where ic and pv) as ic,
             coalesce(array_agg(mx) filter (where play), '{}') as mxs
        from pe where pv
       group by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10) x), '[]'::json),
  'vendas', coalesce((select json_agg(x order by x.ts desc) from (
      select ts, to_char(ts, 'YYYY-MM-DD') as dia, to_char(ts, 'DD/MM HH24:MI') as quando, round(valor::numeric, 2) as valor, itens,
             case when cid in (select id from meus) then 'minhas' when sck like 'af\_%' then 'afiliado'
                  when camp ~ '^[0-9]+$' then 'afiliado' when camp is not null then 'minhas' else 'direto' end as origem,
             coalesce(nullif(regexp_replace(regexp_replace(regexp_replace(regexp_replace(coalesce(sck, ''), '_[^_]*$', ''), '^(af_)?vsl_', ''), '_ig$', ''), '_x[0-9]+$', ''), ''), '-') as versao,
             coalesce(nullif(split_part(coalesce(camp, ''), '|', 1), ''), '') as campanha, coalesce(cid, '') as cid,
             coalesce(nullif(split_part(coalesce(cont, ''), '|', 1), ''), '') as anuncio,
             coalesce(nullif(split_part(coalesce(cont, ''), '|', 2), ''), '') as adid, coalesce(p.pais, '?') as pais,
             /* 24/11 BIO: fria = entrou pela bio sem anúncio antes; anuncio = clicou num anúncio (mesmo celular) entre a 1ª visita ao site (pixel _fbp) e a compra, e depois voltou pela bio */
             bio.tipo as bio, bio.anuncio as bio_anuncio, bio.campanha as bio_campanha
        from p
        left join lateral (
          select case when not coalesce(coalesce(p.sck, '') like '%\_bio\_%' or p.osrc = 'igbio' or (p.osrc = 'instagram' and p.omed = 'bio'), false) then null
                      when ad.cont is not null then 'anuncio' else 'fria' end as tipo,
                 split_part(ad.cont, '|', 1) as anuncio, split_part(ad.camp, '|', 1) as campanha
            from (select 1) um
            left join lateral (
              select a.utm_content as cont, a.utm_campaign as camp
                from public.funnel_events a
               where coalesce(coalesce(p.sck, '') like '%\_bio\_%' or p.osrc = 'igbio' or (p.osrc = 'instagram' and p.omed = 'bio'), false)
                 and a.utm_campaign like '%|%' and a.ts <= p.ts
                 and a.ts >= coalesce(to_timestamp(nullif(split_part(p.fbp, '.', 3), '')::bigint / 1000.0) - interval '3 minutes', p.ts - interval '7 days')
                 and a.ts >= p.ts - interval '30 days'
                 and a.user_agent in (select b.user_agent from public.funnel_events b
                                        where b.fbclid = nullif(split_part(coalesce(p.fbc, ''), '.', 4), '')
                                          and b.ts between p.ts - interval '2 days' and p.ts and b.user_agent is not null)
               order by a.ts limit 1) ad on true
        ) bio on true
        order by ts desc limit 500) x), '[]'::json)
)
$function$
