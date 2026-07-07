import React from 'react'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const KEY_PARAM = 'rota97'

interface EventRow {
  id: string
  event: string
  detail: string | null
  session_id: string | null
  ts: string
  page: string | null
  path: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  fbclid: string | null
}

interface LeadRow {
  id: string
  name: string | null
  email: string | null
  created_at: string
  answers: Record<string, unknown> | null
  utms: Record<string, string> | null
}

async function fetchPaged<T>(url: string, key: string, cap = 30000): Promise<T[]> {
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  const first = await fetch(url, { headers: { ...headers, Range: '0-999', Prefer: 'count=exact' }, cache: 'no-store' })
  if (!first.ok) return []
  const out: T[] = await first.json()
  const total = Math.min(parseInt((first.headers.get('content-range') || '').split('/')[1] || '0', 10) || 0, cap)
  if (total > 1000) {
    const pages: Promise<T[]>[] = []
    for (let from = 1000; from < total; from += 1000) {
      pages.push(fetch(url, { headers: { ...headers, Range: `${from}-${from + 999}` }, cache: 'no-store' })
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []))
    }
    for (const batch of await Promise.all(pages)) out.push(...batch)
  }
  return out
}

async function fetchLeadEvents(days: number): Promise<EventRow[]> {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const url = `${SUPA_URL}/rest/v1/funnel_events?funnel=eq.leadmagnet&ts=gte.${since}&select=id,event,detail,session_id,ts,page,path,utm_source,utm_medium,utm_campaign,utm_content,fbclid&order=ts.desc`
  return fetchPaged<EventRow>(url, key)
}

async function fetchVslEvents(days: number): Promise<EventRow[]> {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const url = `${SUPA_URL}/rest/v1/funnel_events?funnel=eq.ingles&page=eq.vsl&ts=gte.${since}&select=id,event,detail,session_id,ts,page,path,utm_source,utm_medium,utm_campaign,utm_content,fbclid&order=ts.desc`
  return fetchPaged<EventRow>(url, key)
}

async function fetchLeads(days: number): Promise<LeadRow[]> {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const url = `${SUPA_URL}/rest/v1/quiz_leads?source=eq.leadmagnet_497&created_at=gte.${since}&select=id,name,email,created_at,answers,utms&order=created_at.desc`
  return fetchPaged<LeadRow>(url, key)
}

function sid(r: EventRow) {
  return r.session_id || r.id
}

function uniq(rows: EventRow[], event: string, page?: string) {
  const s = new Set<string>()
  for (const r of rows) {
    if (r.event !== event) continue
    if (page && r.page !== page) continue
    s.add(sid(r))
  }
  return s.size
}

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0
}

function campaignSessions(rows: EventRow[]) {
  const out = new Set<string>()
  for (const r of rows) if (r.utm_source || r.fbclid) out.add(sid(r))
  return out
}

function filterCampaign(rows: EventRow[], enabled: boolean) {
  if (!enabled) return rows
  const campaign = campaignSessions(rows)
  return rows.filter(r => campaign.has(sid(r)))
}

function adLabel(r: EventRow | LeadRow) {
  if ('utms' in r) return r.utms?.utm_content || r.utms?.utm_campaign || '(sem utm)'
  return r.utm_content || r.utm_campaign || '(sem utm)'
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function LeadMetrics({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  if (sp.k !== KEY_PARAM) {
    return (
      <p style={{ fontFamily: 'monospace', padding: 40, fontSize: 14, lineHeight: 1.6 }}>
        401 - faltou a chave.<br />Abre com: /lead-metrics<strong>?k=...</strong>
      </p>
    )
  }

  const days = Math.max(1, Math.min(90, parseInt(String(sp.days || '7'), 10) || 7))
  const showAll = sp.all === '1'
  const view = String(sp.view || 'metrics')
  const [rawLeadEvents, rawVslEvents, leads] = await Promise.all([
    fetchLeadEvents(days),
    fetchVslEvents(days),
    fetchLeads(days),
  ])
  const visibleLeads = showAll ? leads : leads.filter(l => l.utms?.utm_source || l.utms?.fbclid)

  const leadEvents = filterCampaign(rawLeadEvents, !showAll)
  const vslEvents = filterCampaign(rawVslEvents, !showAll)
  const bridgeEvents = leadEvents.filter(r => r.page === 'bridge')
  const treinoEvents = leadEvents.filter(r => r.page === 'treino')
  const leadSessions = new Set(bridgeEvents.filter(r => r.event === 'lead').map(sid))

  const captureViews = uniq(bridgeEvents, 'pageview')
  const gateOpens = uniq(bridgeEvents, 'gate_open')
  const leadEventCount = uniq(bridgeEvents, 'lead')
  const savedLeads = visibleLeads.length
  const vslRedirects = uniq(bridgeEvents, 'vsl_redirect')
  const vslFromLead = new Set(vslEvents.filter(r => r.event === 'pageview' && (r.path || '').includes('from=lead')).map(sid)).size
  const checkoutFromLead = new Set(vslEvents.filter(r => r.event === 'checkout_click' && (r.path || '').includes('from=lead')).map(sid)).size
  const treinoViews = uniq(treinoEvents, 'pageview')
  const treinoResults = uniq(treinoEvents, 'resultado')
  const treinoVslClicks = uniq(treinoEvents, 'vsl_click')

  const steps = [
    ['Captura vista', captureViews, captureViews],
    ['Modal aberto', gateOpens, captureViews],
    ['Email capturado', Math.max(leadEventCount, savedLeads), gateOpens],
    ['Redirect para VSL', vslRedirects, Math.max(leadEventCount, savedLeads)],
    ['VSL aberta com from=lead', vslFromLead, vslRedirects],
    ['Clique checkout na VSL', checkoutFromLead, vslFromLead],
  ] as const

  const byAd: Record<string, { views: Set<string>, gates: Set<string>, leads: Set<string>, vsl: Set<string>, saved: number }> = {}
  for (const r of bridgeEvents) {
    const key = adLabel(r).slice(0, 60)
    byAd[key] ||= { views: new Set(), gates: new Set(), leads: new Set(), vsl: new Set(), saved: 0 }
    if (r.event === 'pageview') byAd[key].views.add(sid(r))
    if (r.event === 'gate_open') byAd[key].gates.add(sid(r))
    if (r.event === 'lead') byAd[key].leads.add(sid(r))
    if (r.event === 'vsl_redirect') byAd[key].vsl.add(sid(r))
  }
  for (const l of leads) {
    if (!showAll && !(l.utms?.utm_source || l.utms?.fbclid)) continue
    const key = adLabel(l).slice(0, 60)
    byAd[key] ||= { views: new Set(), gates: new Set(), leads: new Set(), vsl: new Set(), saved: 0 }
    byAd[key].saved += 1
  }
  const ads = Object.entries(byAd).map(([ad, v]) => ({
    ad,
    views: v.views.size,
    gates: v.gates.size,
    leads: Math.max(v.leads.size, v.saved),
    vsl: v.vsl.size,
  })).sort((a, b) => b.views - a.views).slice(0, 18)

  const ink = '#15201E', dim = 'rgba(21,32,30,.58)', teal = '#0B6E68', bg = '#FAFAF6', cardBg = '#fff', red = '#C4574A', amber = '#8A6A12'
  const card: React.CSSProperties = { background: cardBg, border: '1px solid rgba(21,32,30,.12)', borderRadius: 16, padding: '22px 24px', marginBottom: 16, boxShadow: '0 18px 46px -28px rgba(21,32,30,.22)' }
  const cell: React.CSSProperties = { padding: '8px 9px', fontSize: 13, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }
  const topLink: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${teal}`, borderRadius: 999, padding: '9px 13px', color: teal, textDecoration: 'none', fontSize: 13, fontWeight: 900 }

  if (view === 'leads') {
    return (
      <div style={{ background: bg, minHeight: '100vh', color: ink, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", padding: '32px 16px' }}>
        <main style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4 }}>Emails capturados</h1>
              <p style={{ fontSize: 13, color: dim, fontWeight: 700 }}>
                ultimos {days} dias - {visibleLeads.length} leads -{' '}
                <strong style={{ color: showAll ? red : teal }}>{showAll ? 'tudo, inclui testes' : 'so campanha'}</strong>
              </p>
            </div>
            <a href={`?k=${KEY_PARAM}&days=${days}${showAll ? '&all=1' : ''}`} style={topLink}>voltar para metricas</a>
          </div>

          <p style={{ fontSize: 13, color: dim, fontWeight: 700, marginBottom: 18 }}>
            {[7, 14, 30].map(d => <a key={d} href={`?k=${KEY_PARAM}&view=leads&days=${d}${showAll ? '&all=1' : ''}`} style={{ color: teal, marginRight: 8 }}>{d}d</a>)}
            <a href={`?k=${KEY_PARAM}&view=leads&days=${days}${showAll ? '' : '&all=1'}`} style={{ color: teal }}>{showAll ? 'ver so campanha' : 'ver tudo'}</a>
          </p>

          <div style={{ ...card, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                  <th style={{ ...cell, textAlign: 'left' }}>data</th>
                  <th style={{ ...cell, textAlign: 'left' }}>email</th>
                  <th style={{ ...cell, textAlign: 'left' }}>nome</th>
                  <th style={{ ...cell, textAlign: 'left' }}>origem</th>
                  <th style={{ ...cell, textAlign: 'left' }}>campanha</th>
                  <th style={{ ...cell, textAlign: 'left' }}>anuncio</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid rgba(21,32,30,.08)' }}>
                    <td style={{ ...cell, textAlign: 'left' }}>{fmtDate(l.created_at)}</td>
                    <td style={{ ...cell, textAlign: 'left', color: teal }}>{l.email || '-'}</td>
                    <td style={{ ...cell, textAlign: 'left' }}>{l.name || '-'}</td>
                    <td style={{ ...cell, textAlign: 'left' }}>{l.utms?.utm_source || (l.utms?.fbclid ? 'facebook' : '-')}</td>
                    <td style={{ ...cell, textAlign: 'left', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.utms?.utm_campaign || '-'}</td>
                    <td style={{ ...cell, textAlign: 'left', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.utms?.utm_content || '-'}</td>
                  </tr>
                ))}
                {!visibleLeads.length && (
                  <tr>
                    <td colSpan={6} style={{ ...cell, textAlign: 'left', color: dim, padding: '22px 9px' }}>Nenhum lead nesse filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: ink, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", padding: '32px 16px' }}>
      <main style={{ maxWidth: 880, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 4 }}>Lead Magnet Metrics</h1>
        <p style={{ fontSize: 13, color: dim, fontWeight: 700, marginBottom: 22 }}>
          ultimos {days} dias · sessoes unicas · {leadEvents.length} eventos internos · {leads.length} leads salvos ·{' '}
          <strong style={{ color: showAll ? red : teal }}>{showAll ? 'tudo, inclui testes' : 'so campanha'}</strong> ·{' '}
          {[7, 14, 30].map(d => <a key={d} href={`?k=${KEY_PARAM}&days=${d}${showAll ? '&all=1' : ''}`} style={{ color: teal, marginRight: 8 }}>{d}d</a>)}
          <a href={`?k=${KEY_PARAM}&days=${days}${showAll ? '' : '&all=1'}`} style={{ color: teal }}>{showAll ? 'ver so campanha' : 'ver tudo'}</a>
          {' '}Â· <a href={`?k=${KEY_PARAM}&view=leads&days=${days}${showAll ? '&all=1' : ''}`} style={{ color: teal, fontWeight: 900 }}>ver emails capturados</a>
        </p>

        <div style={card}>
          <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 14 }}>Captura → VSL</p>
          {steps.map(([label, n, denom], i) => {
            const topPct = pct(n, captureViews)
            const prevPct = i === 0 ? 100 : pct(n, denom)
            const warn = i > 0 && prevPct < 55
            return (
              <div key={label} style={{ marginBottom: i < steps.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, fontWeight: 800, marginBottom: 5 }}>
                  <span>{label}</span>
                  <span style={{ color: warn ? red : ink }}>{n} <span style={{ color: dim, fontWeight: 700 }}>· {topPct}% topo{i ? ` · ${prevPct}% anterior` : ''}</span></span>
                </div>
                <div style={{ height: 12, background: '#EDF4F2', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${topPct}%`, height: '100%', background: warn ? red : teal, borderRadius: 999 }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 900, color: dim, textTransform: 'uppercase', letterSpacing: 1.5 }}>Opt-in rate</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: teal, letterSpacing: '-0.05em' }}>{pct(Math.max(leadEventCount, savedLeads), captureViews)}%</p>
            <p style={{ fontSize: 12, color: dim, fontWeight: 700 }}>{Math.max(leadEventCount, savedLeads)} / {captureViews}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 900, color: dim, textTransform: 'uppercase', letterSpacing: 1.5 }}>VSL show-up</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: teal, letterSpacing: '-0.05em' }}>{pct(vslFromLead, vslRedirects)}%</p>
            <p style={{ fontSize: 12, color: dim, fontWeight: 700 }}>{vslFromLead} / {vslRedirects} · {checkoutFromLead} checkout</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 900, color: dim, textTransform: 'uppercase', letterSpacing: 1.5 }}>Treino aberto</p>
            <p style={{ fontSize: 38, fontWeight: 900, color: treinoViews ? teal : amber, letterSpacing: '-0.05em' }}>{treinoViews}</p>
            <p style={{ fontSize: 12, color: dim, fontWeight: 700 }}>{treinoResults} resultados · {treinoVslClicks} cliques VSL</p>
          </div>
        </div>

        <div style={{ ...card, overflowX: 'auto' }}>
          <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>Por anuncio / utm_content</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                <th style={{ ...cell, textAlign: 'left' }}>anuncio</th>
                <th style={cell}>views</th>
                <th style={cell}>gate</th>
                <th style={cell}>lead</th>
                <th style={cell}>vsl</th>
                <th style={cell}>opt-in</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(a => (
                <tr key={a.ad} style={{ borderTop: '1px solid rgba(21,32,30,.08)' }}>
                  <td style={{ ...cell, textAlign: 'left', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.ad}</td>
                  <td style={cell}>{a.views}</td>
                  <td style={cell}>{a.gates}</td>
                  <td style={{ ...cell, color: a.leads ? teal : dim }}>{a.leads}</td>
                  <td style={cell}>{a.vsl}</td>
                  <td style={{ ...cell, color: pct(a.leads, a.views) >= 20 ? teal : red }}>{pct(a.leads, a.views)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={card}>
          <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>Eventos do treino</p>
          {[
            ['Abertura do treino', treinoViews],
            ['Comecou/home', uniq(treinoEvents, 'home')],
            ['Regras', uniq(treinoEvents, 'rules')],
            ['Loop 1 feito', uniq(treinoEvents, 'loop1_done')],
            ['Loop 2 feito', uniq(treinoEvents, 'loop2_done')],
            ['Loop 3 feito', uniq(treinoEvents, 'loop3_done')],
            ['Resultado/laudo', treinoResults],
            ['Clique VSL pos-treino', treinoVslClicks],
          ].map(([label, n]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, padding: '7px 0', borderTop: '1px solid rgba(21,32,30,.06)' }}>
              <span>{label}</span><span>{n}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
