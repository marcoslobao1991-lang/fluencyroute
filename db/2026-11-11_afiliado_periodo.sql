-- 11/11/2026: painel do AFILIADO (Inglês + Tabuada) no período escolhido.
-- Afiliado = Inglês: variant 'af_%' (links da Kiwify com ?af=<versão>, desde 11/11) ou, antes disso, as versões que só o afiliado usa
--            (vsl_lead*, vsl_fk2* desde 10/11 sem UTM); Tabuada: path /vsl97 (link de página do afiliado).
-- 'sem UTM' = /vsl sem utm_source (pode ser afiliado com link antigo, visita direta ou você testando).
-- 'robo' = clicou no checkout sem pageview (botão ainda escondido): revisor de anúncio/crawler, não é gente.
create or replace function public.fr_r_afiliado_periodo(p_de date, p_ate date)
 returns json
 language sql stable security definer set search_path to 'public' set "TimeZone" to 'America/Sao_Paulo'
as $function$
with e as (
  select * from public.funnel_events
   where funnel in ('ingles','tabuada') and page = 'vsl'
     and ts >= p_de::timestamptz and ts < (p_ate + 1)::timestamptz
), s as (
  select e.session_id, e.funnel,
         max(e.variant) as variant, min(e.path) as path, max(e.utm_source) as utm,
         bool_or(e.event = 'pageview') as pv,
         bool_or(e.event = 'video_play') as play,
         bool_or(e.event = 'checkout_click') as ic,
         bool_or(e.event = 'video_reveal') as revelou,
         coalesce(max(case when e.event = 'video_minute' and e.detail ~ '^[0-9]+$' then e.detail::int end), -1) as mx,
         min(e.ts) as ini, max(e.ts) as fim,
         max(case when e.user_agent ~* 'iphone|ipad' then 'iPhone' when e.user_agent ~* 'android' then 'Android' else 'outro' end) as disp,
         max(case when e.user_agent ~* 'instagram' then 'Instagram' when e.user_agent ~* 'FBAN|FBAV|FB_IAB' then 'Facebook'
                  when e.referrer ~* 'facebook' then 'Facebook' when e.referrer ~* 'instagram' then 'Instagram'
                  when e.referrer is null then 'direto' else 'outro' end) as origem
    from e group by 1, 2
), c as (
  select s.*,
         case
           when funnel = 'ingles' and variant like 'af\_%' then 'afiliado'
           when funnel = 'ingles' and utm is null and (variant like 'vsl\_lead%' or variant like 'vsl\_fk2%') and ini >= '2026-11-10' then 'afiliado'
           when funnel = 'tabuada' and path like '/vsl97%' then 'afiliado'
           when utm is null and coalesce(path, '') not like '%utm\_%' then 'sem UTM'
         end as grupo,
         case when funnel = 'tabuada' then case when path like '/vsl97%' then 'Tabuada /vsl97' else 'Tabuada /vsl' end
              else regexp_replace(regexp_replace(coalesce(variant, '?'), '^(af_)?vsl_', ''), '_ig$', '') end as versao
    from s
), g as (
  select c.*, (ic and not pv) as robo,
         case when funnel = 'tabuada' then revelou
              else mx >= case when versao like 'fk1%' then 20 else 21 end end as oferta
    from c where grupo is not null
), o as (
  select regexp_replace(regexp_replace(vturb_sck, '_[^_]*$', ''), '^af_vsl_|_ig$', '', 'g') as versao,
         count(*) as vendas, sum(amount_cents) / 100.0 as receita
    from public.orders
   where status = 'paid' and vturb_sck like 'af\_%' and created_at >= p_de::timestamptz and created_at < (p_ate + 1)::timestamptz
   group by 1
), v as (
  select funnel, grupo, versao,
         count(*) filter (where pv) as visitas, count(*) filter (where robo) as robos,
         count(*) filter (where play) as plays,
         coalesce(sum(greatest(mx, 0) + 0.5) filter (where play), 0) as minutos,
         count(*) filter (where oferta and play) as oferta,
         count(*) filter (where ic and not robo) as ic
    from g group by 1, 2, 3
), cv as (
  select funnel, grupo, versao, m, count(*) filter (where mx >= m) as n
    from g cross join generate_series(0, 26) m where play group by 1, 2, 3, 4
)
select json_build_object(
  'de', p_de, 'ate', p_ate,
  'grupos', coalesce((select json_agg(json_build_object(
       'funnel', v.funnel, 'grupo', v.grupo, 'versao', v.versao, 'visitas', v.visitas, 'robos', v.robos, 'plays', v.plays,
       'minutos', v.minutos, 'oferta', v.oferta, 'ic', v.ic,
       'vendas', case when v.grupo = 'afiliado' and v.funnel = 'ingles' then coalesce(o.vendas, 0) end,
       'receita', case when v.grupo = 'afiliado' and v.funnel = 'ingles' then coalesce(o.receita, 0) end,
       'curva', (select json_agg(cv.n order by cv.m) from cv where cv.funnel = v.funnel and cv.grupo = v.grupo and cv.versao = v.versao))
       order by v.grupo, v.funnel, v.versao)
     from v left join o on o.versao = v.versao and v.grupo = 'afiliado' and v.funnel = 'ingles'), '[]'::json),
  'visitas', coalesce((select json_agg(x order by x.ini desc) from (
       select funnel, grupo, versao, to_char(ini, 'DD/MM HH24:MI') as hora, ini, disp, origem, pv, play, mx, oferta, ic, robo,
              extract(epoch from (fim - ini))::int as seg
         from g order by ini desc limit 80) x), '[]'::json)
)
$function$;
grant execute on function public.fr_r_afiliado_periodo(date, date) to anon;
notify pgrst, 'reload schema';
