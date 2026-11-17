CREATE OR REPLACE FUNCTION public.fr_r_origem_periodo(p_funnel text, p_de date, p_ate date, p_oferta integer DEFAULT 999)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET "TimeZone" TO 'America/Sao_Paulo'
AS $function$
with meus as (
  select distinct campaign_id::text as id from public.ad_spend_daily
), e as (
  select session_id, ts, case when page = 'vsl2' then 'vsl' else page end as page, event, detail, variant, path, utm_campaign, user_agent
    from public.funnel_events
   where funnel = p_funnel and ts >= p_de::timestamptz and ts < (p_ate + 1)::timestamptz and coalesce(page, '') <> 'obrigado'
), s as (
  select session_id,
         (array_agg(page order by ts))[1] as pg1,
         (array_agg(path order by ts) filter (where path is not null))[1] as path1,
         max(variant) filter (where page = 'vsl') as variant,
         max(utm_campaign) as camp,
         min(ts) as ini,
         bool_or(event = 'pageview') as pv,
         bool_or(event = 'pageview' and page = 'vsl') as pvv,
         bool_or(event = 'video_play' and page = 'vsl') as play,
         coalesce(max(case when event = 'video_minute' and page = 'vsl' and detail ~ '^[0-9]+$' then detail::int end), -1) as mx,
         (bool_or(event = 'video_reveal')
           or coalesce(max(case when event = 'video_minute' and page = 'vsl' and detail ~ '^[0-9]+$' then detail::int end), -1) >= case when max(variant) filter (where page = 'vsl') like '%vsl_aula%' then 46 else p_oferta end) as oferta,
         bool_or(event = 'cta_click' and page <> 'vsl') as cta,
         bool_or(event = 'checkout_click') as ic,
         bool_or(event = 'video_pause') as pausou
    from e group by 1
), c as (
  select s.*,
         case when camp like '%|%' then regexp_replace(camp, '^.*\|', '') when camp ~ '^[0-9]+$' then camp end as cid
    from s
), k as (
  select c.*,
         case when cid in (select id from meus) then 'minhas'
              when variant like 'af\_%' or path1 like '%af=%' or path1 like '/bridge-af%' or (p_funnel = 'tabuada' and path1 like '/vsl97%') then 'afiliado'
              when camp ~ '^[0-9]+$' then 'afiliado'
              when camp is not null then 'minhas'
              else 'direto' end as origem,
         case when pg1 like 'bridge%' then 'Bridge' when pg1 = 'quiz' then 'Quiz' when pg1 like 'carta%' then 'Carta'
              when pg1 = 'vsl' then 'VSL' else coalesce(pg1, '?') end as entrada,
         -- versão = a da VSL que a sessão viu (fk1, lead, lead1x, fk2); se não chegou na VSL, a do link (?af= / ?vsl=); senão o caminho
         coalesce(nullif(regexp_replace(regexp_replace(regexp_replace(coalesce(variant, ''), '^(af_)?vsl_', ''), '_ig$', ''), '_x[0-9]+$', ''), ''),
                  substring(path1 from '[?&]af=([a-z0-9]+)'), substring(path1 from '[?&]vsl=([a-z0-9]+)'),
                  nullif(regexp_replace(split_part(coalesce(path1, ''), '?', 1), '/$', ''), ''), '-') as versao,
         nullif(split_part(coalesce(camp, ''), '|', 1), '') as campnome
    from c
), cv as (
  -- retenção por caminho: de quem deu play, quantos passaram de cada minuto
  select origem, entrada, versao, m, count(*) filter (where m = 0 or mx >= m) as n
    from k cross join generate_series(0, 55) m where play group by 1, 2, 3, 4
), cvc as (
  -- 14/11: retenção por CAMPANHA (Marcos quer a retenção de cada campanha do afiliado, não só a global)
  select origem, coalesce(campnome, '(sem campanha)') as campanha, cid, m, count(*) filter (where m = 0 or mx >= m) as n
    from k cross join generate_series(0, 55) m where play group by 1, 2, 3, 4
), ce as (
  -- cliques no checkout do período já com a página de entrada da sessão, casados com o checkout_sessions da mesma hora e aparelho
  select split_part(cs.session_id, '-click-', 1) as sid, k.entrada
    from public.checkout_sessions cs
    join e fe on fe.event = 'checkout_click' and fe.user_agent = cs.ua
         and fe.ts between cs.created_at - interval '20 seconds' and cs.created_at + interval '20 seconds'
    join k on k.session_id = fe.session_id
   where cs.created_at >= p_de::timestamptz - interval '1 minute' and cs.created_at < (p_ate + 1)::timestamptz + interval '1 minute'
), p0 as (
  select fe.ts, fe.value, fe.detail, split_part(fe.detail, ':', 2) as oid, nullif(split_part(fe.detail, ':', 3), '') as prod,
         fe.utm_campaign, fe.utm_content
    from public.funnel_events fe
   where fe.event = 'purchase' and fe.ts >= p_de::timestamptz and fe.ts < (p_ate + 1)::timestamptz
     and (fe.funnel = p_funnel or (p_funnel = 'tabuada' and fe.funnel = 'escola'))
     and fe.detail not like 'kiwify:sim-%'
), p1 as (
  select case when p0.prod is null then p0.detail else to_char(date_trunc('minute', p0.ts), 'YYYYMMDDHH24MI') || coalesce(p0.utm_content, '') end as chave,
         min(p0.ts) as ts, sum(p0.value) as valor,
         string_agg(coalesce(p0.prod, 'principal'), ' + ' order by p0.value desc) as itens,
         bool_or(p0.prod is null or p0.prod = p_funnel) as principal,
         max(coalesce(o.utm_campaign, p0.utm_campaign)) as camp, max(coalesce(o.utm_content, p0.utm_content)) as cont, max(o.vturb_sck) as sck
    from p0 left join public.orders o on o.pagarme_order_id = p0.oid
   group by 1
), p as (
  select p1.*,
         case when camp like '%|%' then regexp_replace(camp, '^.*\|', '') when camp ~ '^[0-9]+$' then camp end as cid
    from p1 where principal
), v as (
  select p.*,
         case when cid in (select id from meus) then 'minhas'
              when sck like 'af\_%' then 'afiliado'
              when camp ~ '^[0-9]+$' then 'afiliado'
              when camp is not null then 'minhas'
              else 'direto' end as origem,
         coalesce(nullif(regexp_replace(regexp_replace(regexp_replace(regexp_replace(coalesce(sck, ''), '_[^_]*$', ''), '^(af_)?vsl_', ''), '_ig$', ''), '_x[0-9]+$', ''), ''), '-') as versao,
         -- página de entrada da venda: sck termina no id do checkout_sessions; o clique no checkout da mesma hora e mesmo aparelho dá a sessão
         (select ce.entrada from ce where ce.sid = regexp_replace(p.sck, '^.*_', '') limit 1) as entrada
    from p
)
select json_build_object(
  'de', p_de, 'ate', p_ate,
  'grupos', coalesce((select json_agg(x) from (
      select origem, entrada, versao,
             count(*) filter (where pv) as entrou, count(*) filter (where pvv) as vsl, count(*) filter (where play) as plays,
             count(*) filter (where oferta and play) as oferta, count(*) filter (where ic and pv) as ic,
             count(*) filter (where ic and not pv) as robos, count(*) filter (where pausou) as pausas,
             count(*) filter (where cta and pv) as cta,
             coalesce(sum(greatest(mx, 0) + 0.5) filter (where play), 0) as minutos,
             (select json_agg(cv.n order by cv.m) from cv where cv.origem = k.origem and cv.entrada = k.entrada and cv.versao = k.versao) as curva
        from k group by 1, 2, 3 order by 4 desc) x), '[]'::json),
  'campanhas', coalesce((select json_agg(x) from (
      select origem, coalesce(campnome, '(sem campanha)') as campanha, cid,
             count(*) filter (where pv) as entrou, count(*) filter (where pvv) as vsl, count(*) filter (where play) as plays,
             count(*) filter (where oferta and play) as oferta, count(*) filter (where ic and pv) as ic,
             coalesce(sum(greatest(mx, 0) + 0.5) filter (where play), 0) as minutos,
             (select json_agg(cvc.n order by cvc.m) from cvc where cvc.origem = k.origem and cvc.campanha = coalesce(k.campnome, '(sem campanha)') and cvc.cid is not distinct from k.cid) as curva
        from k group by origem, campnome, cid order by 4 desc limit 80) x), '[]'::json),
  'dias', coalesce((select json_agg(x order by x.dia) from (
      select to_char(ini, 'YYYY-MM-DD') as dia, origem,
             count(*) filter (where pvv) as vsl, count(*) filter (where play) as plays, count(*) filter (where ic and pv) as ic
        from k group by 1, 2) x), '[]'::json),
  'vendas', coalesce((select json_agg(x order by x.ts desc) from (
      select ts, to_char(ts, 'DD/MM HH24:MI') as quando, to_char(ts, 'YYYY-MM-DD') as dia, round(valor::numeric, 2) as valor, itens, origem, versao, entrada,
             nullif(split_part(coalesce(camp, ''), '|', 1), '') as campanha, cid, nullif(split_part(coalesce(cont, ''), '|', 1), '') as anuncio
        from v order by ts desc limit 300) x), '[]'::json)
)
$function$
