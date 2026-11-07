-- 07/11/2026: painel de stats escolhe QUALQUER período (ontem, um dia, de/até), não só "últimos N dias".
-- Versões _periodo das consultas que só aceitavam p_days. As originais ficam intactas.

create or replace function public.fr_rollup_by_ad_periodo(p_funnel text, p_de date, p_ate date)
 returns table(ad text, minute integer, sessions bigint)
 language sql stable security definer set search_path to 'public'
as $function$
  select r.ad, r.minute, sum(r.sessions)::bigint
    from public.fr_video_rollup r
   where r.funnel = p_funnel and r.dia between p_de and p_ate
   group by 1,2 order by 1,2
$function$;

create or replace function public.fr_r_campaigns_periodo(p_funnel text, p_de date, p_ate date)
 returns table(utm_campaign text, utm_content text, visitas bigint, plays bigint, cta_clicks bigint, vsl_visitas bigint, vendas bigint)
 language sql stable security definer set search_path to 'public'
as $function$
  select r.utm_campaign, r.utm_content,
    coalesce(sum(r.sessions) filter (where r.page='bridge'   and r.event='pageview'),0),
    coalesce(sum(r.sessions) filter (where r.page='bridge'   and r.event='play'),0),
    coalesce(sum(r.sessions) filter (where r.page='bridge'   and r.event='cta_click'),0),
    coalesce(sum(r.sessions) filter (where r.page='vsl'      and r.event='pageview'),0),
    coalesce(sum(r.hits) filter (where r.page='obrigado' and r.event='purchase'),0)
  from public.fr_funil_rollup r
  where r.funnel = p_funnel and r.dia between p_de and p_ate
  group by 1,2 order by 3 desc
$function$;

-- daily continua 30 dias (gráfico dia a dia); campanhas/anúncios/contas = só o período
create or replace function public.fr_r_gasto_periodo(p_funnel text, p_de date, p_ate date)
 returns json
 language sql stable security definer set search_path to 'public' set "TimeZone" to 'America/Sao_Paulo'
as $function$
  with g as (
    select s.*, coalesce(s.tax_rate, 0.1215) as tx, coalesce(s.spend_orig, s.spend) as orig
      from public.ad_spend_daily s
     where s.date > least(current_date - 30, p_de - 1)
       and public.fr_funil_da_campanha(s.campaign_name, s.account_id) = p_funnel
  )
  select json_build_object(
    'atualizado', (select max(updated_at) from public.ad_spend_daily),
    'daily', coalesce((select json_agg(x order by x.dia desc) from (
        select date as dia, round(sum(spend), 2) as gasto, round(sum(spend * (1 + tx)), 2) as gasto_imp,
               sum(impressions) as impressoes, sum(clicks) as cliques, sum(link_clicks) as cliques_link
          from g group by date) x), '[]'::json),
    'campanhas', coalesce((select json_agg(x order by x.gasto desc) from (
        select campaign_id as id, max(campaign_name) as nome, max(account_id) as conta,
               round(sum(spend), 2) as gasto, round(sum(spend * (1 + tx)), 2) as gasto_imp,
               sum(impressions) as impressoes, sum(link_clicks) as cliques_link
          from g where date between p_de and p_ate group by campaign_id) x), '[]'::json),
    'anuncios', coalesce((select json_agg(x order by x.gasto desc) from (
        select ad_id as id, max(ad_name) as nome,
               round(sum(spend), 2) as gasto, round(sum(spend * (1 + tx)), 2) as gasto_imp,
               sum(impressions) as impressoes, sum(link_clicks) as cliques_link
          from g where date between p_de and p_ate group by ad_id) x), '[]'::json),
    'contas', coalesce((select json_agg(x order by x.gasto_imp desc) from (
        select account_id as id, coalesce(max(account_name), account_id) as nome, coalesce(max(currency), 'BRL') as moeda,
               round(sum(orig), 2) as gasto_orig, round(sum(spend), 2) as gasto, max(tx) as imposto,
               round(sum(spend * (1 + tx)), 2) as gasto_imp
          from g where date between p_de and p_ate group by account_id) x), '[]'::json)
  )
$function$;

grant execute on function public.fr_rollup_by_ad_periodo(text, date, date) to anon;
grant execute on function public.fr_r_campaigns_periodo(text, date, date) to anon;
grant execute on function public.fr_r_gasto_periodo(text, date, date) to anon;
drop function if exists public._tmp_def(text);
notify pgrst, 'reload schema';
