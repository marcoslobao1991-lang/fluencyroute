-- Curva de retenção da carta (scroll × leitura): devolve o último retrato de cada (sessão, página)
-- só das versões atuais das páginas (p_vers), com o tempo de cada bloco. O visualizador decide,
-- bloco a bloco, se a pessoa leu (tempo compatível com o tamanho do texto) ou só passou rolando.
create or replace function public.fr_carta_sessoes(p_slug text, p_vers text[], p_days int default 7, p_device text default 'all', p_utm text default null, p_qa boolean default false)
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
),
last as (select distinct on (sid, page) sid, page, reached, active_ms, dwell, checkout from rows order by sid, page, ts desc),
ok as (select sid from last group by sid having sum(active_ms) >= 2000 order by max(active_ms) desc limit 600)
select coalesce(jsonb_agg(jsonb_build_array(l.sid, l.page, l.reached, l.dwell, l.checkout)), '[]'::jsonb)
from last l join ok using (sid);
$$;
grant execute on function public.fr_carta_sessoes(text, text[], int, text, text, boolean) to anon;
notify pgrst, 'reload schema';
