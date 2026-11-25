CREATE OR REPLACE FUNCTION public.fr_carta_chat_funil(p_desde timestamp with time zone DEFAULT '2026-11-24 17:30:00+00'::timestamp with time zone)
 RETURNS TABLE(variante text, etapa text, ordem integer, pessoas bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '10s'
AS $function$
  with ev as (
    select variant, session_id, event, coalesce(detail,'') as d
    from funnel_events
    where funnel = 'evtp' and page = 'carta-chat' and variant in ('carta_chat','carta_full','carta_b') and ts >= p_desde
      and coalesce(utm_source,'') not in ('qa','x')
  ), passos as (
    select variant, session_id,
      case
        when event = 'quiz_view' then '00 abriu'
        when event = 'quiz_capa' then '01 passou da capa'
        when event = 'carta' and d ~ '^int-\d' then 'c' || d
        when event = 'carta' and d ~ '^\d' then 'c' || lpad(split_part(d,'-',1),2,'0') || '-' || substring(d from position('-' in d)+1)
        when event = 'quiz_fim' then 'z1 abriu a oferta'
        when event = 'lp_secao' then 'z2 oferta: ' || d
        when event = 'checkout_click' then 'z3 clicou em comprar'
      end as etapa
    from ev
  )
  select variant, etapa,
    (row_number() over (partition by variant order by etapa))::int,
    count(distinct session_id)
  from passos where etapa is not null
  group by variant, etapa
  union all
  select case when vturb_sck like 'carta_full_%' then 'carta_full' when vturb_sck like 'carta_b_%' then 'carta_b' else 'carta_chat' end, 'zz VENDA', 999, count(*)
  from orders
  where attribution_source ilike 'kiwify_evtp%' and status = 'paid' and created_at >= p_desde
    and (vturb_sck like 'carta_chat_%' or vturb_sck like 'carta_full_%' or vturb_sck like 'carta_b_%')
  group by 1;
$function$
