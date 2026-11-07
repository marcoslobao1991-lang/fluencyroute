-- 07/11/2026: teste A/B da VSL do inglês com as métricas completas por versão, no período escolhido no painel.
-- p_todo = false → só sessões que vieram da campanha do teste (utm_campaign contém p_campanha); true → todo o tráfego da /vsl.
-- Por versão: sessões (visualizações únicas), plays, minutos assistidos (engajamento), curva minuto a minuto 0..26,
-- oferta, IC, vendas e receita (orders.vturb_sck exato = <variant>_<s1>).
create or replace function public.fr_r_teste_vsl_periodo(p_de date, p_ate date, p_campanha text default '120250071992840290', p_todo boolean default false)
 returns json
 language sql stable security definer set search_path to 'public' set "TimeZone" to 'America/Sao_Paulo'
as $function$
with ses as (
  select distinct session_id from public.funnel_events
   where page = 'vsl' and variant like 'vsl_fk%'
     and ts >= p_de::timestamptz and ts < (p_ate + 1)::timestamptz
     and (p_todo or utm_campaign like '%' || p_campanha || '%')
), s as (
  select e.variant, e.session_id,
         bool_or(e.event = 'video_play') as play,
         bool_or(e.event = 'checkout_click') as ic,
         bool_or(e.event = 'autoplay_ok') as auto_ok,
         coalesce(max(case when e.event = 'video_minute' and e.detail ~ '^[0-9]+$' then e.detail::int end), -1) as mx,
         max(case when e.user_agent ~* 'iphone|ipad' then 'ios' when e.user_agent ~* 'android' then 'android' else 'outro' end) as disp
    from public.funnel_events e join ses using (session_id)
   where e.page = 'vsl' and e.variant like 'vsl_fk%' and e.ts >= p_de::timestamptz and e.ts < (p_ate + 1)::timestamptz
   group by 1, 2
), o as (
  select regexp_replace(vturb_sck, '_[^_]*$', '') as variant, count(*) as vendas, sum(amount_cents) / 100.0 as receita
    from public.orders
   where status = 'paid' and vturb_sck like 'vsl_fk%' and created_at >= p_de::timestamptz and created_at < (p_ate + 1)::timestamptz
   group by 1
), v as (
  select s.variant, count(*) as sessoes,
         count(*) filter (where play) as plays,
         count(*) filter (where auto_ok) as autoplay_ok,
         coalesce(sum(greatest(mx, 0) + 0.5) filter (where play), 0) as minutos,
         count(*) filter (where mx >= case when s.variant like 'vsl_fk2%' then 21 else 20 end) as oferta,
         count(*) filter (where ic) as ic,
         count(*) filter (where disp = 'ios') as ios, count(*) filter (where disp = 'android') as android,
         count(*) filter (where disp = 'ios' and play) as ios_play, count(*) filter (where disp = 'android' and play) as android_play
    from s group by 1
), c as (
  select s.variant, g as m, count(*) filter (where s.mx >= g) as n
    from s cross join generate_series(0, 26) g where s.play group by 1, 2
)
select json_build_object(
  'de', p_de, 'ate', p_ate, 'campanha', p_campanha, 'todo', p_todo,
  'variantes', coalesce((select json_agg(json_build_object(
       'variant', v.variant, 'sessoes', v.sessoes, 'plays', v.plays, 'autoplay_ok', v.autoplay_ok, 'minutos', v.minutos,
       'oferta', v.oferta, 'ic', v.ic, 'ios', v.ios, 'android', v.android, 'ios_play', v.ios_play, 'android_play', v.android_play,
       'vendas', coalesce(o.vendas, 0), 'receita', coalesce(o.receita, 0),
       'curva', (select json_agg(c.n order by c.m) from c where c.variant = v.variant)) order by v.variant)
     from v left join o using (variant)), '[]'::json),
  'gasto', (select json_build_object('spend', coalesce(sum(spend), 0), 'spend_imp', coalesce(sum(spend * (1 + coalesce(tax_rate, 0.1215))), 0),
              'link_clicks', coalesce(sum(link_clicks), 0), 'impressions', coalesce(sum(impressions), 0))
              from public.ad_spend_daily where campaign_id = p_campanha and date between p_de and p_ate)
)
$function$;
grant execute on function public.fr_r_teste_vsl_periodo(date, date, text, boolean) to anon;
notify pgrst, 'reload schema';
