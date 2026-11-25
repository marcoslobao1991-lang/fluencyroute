-- 25/11: país do visitante (ISO 2 letras) pra quebrar o funil LATAM por país. Página manda pelo fuso do aparelho; venda Hotmart manda o país do comprador.
alter table public.funnel_events add column if not exists pais text;
-- /es/friends gravou page='friends' até 25/11 ~13h; o painel só lê page='vsl'
update public.funnel_events set page = 'vsl' where funnel = 'ingles-latam' and page = 'friends';
