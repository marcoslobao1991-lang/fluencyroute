// ═══════════════════════════════════════════════════════════════════
//  /bridge-metrics?k=rota97 — funil da /bridge beat a beat.
//  Lê funnel_events (server-side, service key) e mostra: quantos entram,
//  onde travam, % etapa a etapa, respostas do quiz, bandas de score.
//  ?days=7 muda a janela. Sessões únicas (session_id), não pageloads.
// ═══════════════════════════════════════════════════════════════════
import React from 'react'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SUPA_URL = 'https://petrtewismhpzidcmmwb.supabase.co'
const KEY_PARAM = 'rota97'

const STEPS: [string, string][] = [
  ['pageview', 'Visitou a página'],
  ['gate_seen', 'Humano real (3s+ visível)'],
  ['gate_click', 'Aceitou a aposta'],
  ['listen_done', 'Ouviu a cena (1ª vez)'],
  ['honest_answer', 'Respondeu "entendeu?"'],
  ['loop_done', 'Completou as 4 repetições'],
  ['shadow_start', 'Tentou falar (pediu mic)'],
  ['rec_done', 'Gravou a própria voz'],
  ['score', 'Recebeu o diagnóstico'],
  ['cta_click', 'Clicou pra VSL (CTA)'],
]

interface Row {
  event: string
  detail: string | null
  session_id: string | null
  id: string
  ts: string
  utm_source: string | null
  utm_campaign: string | null
  utm_content: string | null
  fbclid: string | null
}

async function fetchRows(days: number): Promise<Row[]> {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return []
  const since = new Date(Date.now() - days * 86400000).toISOString()
  // variant=B = só a bridge nova (a antiga acumulou meses de eventos e estourava timeout)
  const url = `${SUPA_URL}/rest/v1/funnel_events?funnel=eq.ingles&page=eq.bridge&variant=eq.B&ts=gte.${since}&select=id,event,detail,session_id,ts,utm_source,utm_campaign,utm_content,fbclid&order=ts.desc`
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  // 1ª página traz o total; o resto baixa em PARALELO (cap 30k linhas)
  const first = await fetch(url, { headers: { ...headers, Range: '0-999', Prefer: 'count=exact' }, cache: 'no-store' })
  if (!first.ok) return []
  const out: Row[] = await first.json()
  const total = Math.min(parseInt((first.headers.get('content-range') || '').split('/')[1] || '0', 10) || 0, 30000)
  if (total > 1000) {
    const pages: Promise<Row[]>[] = []
    for (let from = 1000; from < total; from += 1000) {
      pages.push(
        fetch(url, { headers: { ...headers, Range: `${from}-${from + 999}` }, cache: 'no-store' })
          .then(r => (r.ok ? r.json() : []))
          .catch(() => [])
      )
    }
    for (const batch of await Promise.all(pages)) out.push(...batch)
  }
  return out
}

function uniq(rows: Row[], event: string, detailPrefix?: string): number {
  const s = new Set<string>()
  for (const r of rows) {
    if (r.event !== event) continue
    if (detailPrefix && !(r.detail || '').startsWith(detailPrefix)) continue
    s.add(r.session_id || r.id)
  }
  return s.size
}

export default async function BridgeMetrics({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  if (sp.k !== KEY_PARAM) {
    return (
      <p style={{ fontFamily: 'monospace', padding: 40, fontSize: 14, lineHeight: 1.6 }}>
        401 — faltou a chave.<br />Abre com: /bridge-metrics<strong>?k=...</strong>
      </p>
    )
  }
  const days = Math.max(1, Math.min(90, parseInt(String(sp.days || '7'), 10) || 7))
  const showAll = sp.all === '1'
  let rows = (await fetchRows(days)).filter(r => r.event !== 'speech_token')
  // padrão: SÓ tráfego de campanha (sessão com utm/fbclid em qualquer evento).
  // Testes internos (Marcos/dev) não têm UTM → ficam fora. ?all=1 inclui tudo.
  if (!showAll) {
    const campaign = new Set<string>()
    for (const r of rows) if (r.utm_source || r.fbclid) campaign.add(r.session_id || r.id)
    rows = rows.filter(r => campaign.has(r.session_id || r.id))
  }

  const counts = STEPS.map(([ev]) => uniq(rows, ev))
  const top = counts[0] || 0
  const honest = { all: uniq(rows, 'honest_answer', 'all'), some: uniq(rows, 'honest_answer', 'some'), none: uniq(rows, 'honest_answer', 'none') }
  const bands = { high: uniq(rows, 'score', 'high'), mid: uniq(rows, 'score', 'mid'), low: uniq(rows, 'score', 'low') }
  const extras = {
    skip: uniq(rows, 'skip_click'),
    micDenied: uniq(rows, 'mic_denied'),
    blocked: uniq(rows, 'assess_blocked'),
    returning: uniq(rows, 'redo_click'),
    assessFail: uniq(rows, 'assess_fail'),
  }
  const toVsl = new Set<string>()
  for (const r of rows) if (r.event === 'cta_click' || r.event === 'skip_click') toVsl.add(r.session_id || r.id)

  const ink = '#191427', dim = '#8b8499', violet = '#7c5cff', soft = '#f6f5fb', green = '#16b364', red = '#f04438', amber = '#f59e0b'
  const card: React.CSSProperties = { background: '#fff', border: '1px solid rgba(25,20,39,.08)', borderRadius: 16, padding: '22px 24px', marginBottom: 16 }

  return (
    <div style={{ background: soft, minHeight: '100vh', fontFamily: "var(--font-dm-sans), sans-serif", color: ink, padding: '32px 16px' }}>
      <main style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Funil /bridge</h1>
        <p style={{ fontSize: 13, color: dim, fontWeight: 600, marginBottom: 24 }}>
          últimos {days} dias · sessões únicas · {rows.length} eventos ·{' '}
          <strong style={{ color: showAll ? '#f04438' : '#16b364' }}>{showAll ? 'TUDO (inclui testes internos)' : 'só tráfego de campanha'}</strong> ·{' '}
          {[7, 14, 30].map(d => (
            <a key={d} href={`?k=${KEY_PARAM}&days=${d}${showAll ? '&all=1' : ''}`} style={{ color: violet, marginRight: 8 }}>{d}d</a>
          ))}
          <a href={`?k=${KEY_PARAM}&days=${days}${showAll ? '' : '&all=1'}`} style={{ color: violet }}>{showAll ? 'ver só campanha' : 'ver tudo'}</a>
        </p>

        {/* funil etapa a etapa */}
        <div style={card}>
          {STEPS.map(([ev, label], i) => {
            const n = counts[i]
            const pTop = top ? Math.round((n / top) * 100) : 0
            const prev = i > 0 ? counts[i - 1] : n
            const pPrev = prev ? Math.round((n / prev) * 100) : 0
            const drop = i > 0 && pPrev < 50
            return (
              <div key={ev} style={{ marginBottom: i < STEPS.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>
                  <span>{label}</span>
                  <span style={{ color: drop ? red : ink }}>
                    {n} <span style={{ color: dim, fontWeight: 600 }}>· {pTop}% do topo{i > 0 ? ` · ${pPrev}% da etapa anterior` : ''}</span>
                  </span>
                </div>
                <div style={{ height: 12, background: soft, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pTop}%`, background: drop ? red : violet, borderRadius: 999 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* destino final */}
        <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>Foram pra VSL (CTA + pular)</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: violet }}>
            {toVsl.size} <span style={{ fontSize: 14, color: dim, fontWeight: 700 }}>· {top ? Math.round((toVsl.size / top) * 100) : 0}% do topo</span>
          </span>
        </div>

        {/* por ANÚNCIO — qual criativo puxa clique e qual puxa jornada */}
        {(() => {
          const byAd: Record<string, Record<string, Set<string>>> = {}
          const adOf: Record<string, string> = {}
          for (const r of rows) {
            const sid = r.session_id || r.id
            if (!adOf[sid] && (r.utm_content || r.utm_campaign)) {
              adOf[sid] = (r.utm_content || r.utm_campaign || '?').slice(0, 38)
            }
          }
          for (const r of rows) {
            const sid = r.session_id || r.id
            const ad = adOf[sid] || '(sem utm_content)'
            byAd[ad] = byAd[ad] || {}
            const evKey = r.event === 'skip_click' ? 'cta_click' : r.event
            byAd[ad][evKey] = byAd[ad][evKey] || new Set()
            byAd[ad][evKey].add(sid)
          }
          const ads = Object.entries(byAd)
            .map(([ad, ev]) => ({
              ad,
              n: ev.pageview?.size || 0,
              seen: ev.gate_seen?.size || 0,
              gate: ev.gate_click?.size || 0,
              loop: ev.loop_done?.size || 0,
              vsl: ev.cta_click?.size || 0,
            }))
            .sort((a, b) => b.n - a.n)
            .slice(0, 14)
          if (!ads.length) return null
          const cell: React.CSSProperties = { padding: '7px 8px', fontSize: 13, fontWeight: 700, textAlign: 'right' }
          return (
            <div style={{ ...card, overflowX: 'auto' }}>
              <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>
                Por anúncio (utm_content)
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    <th style={{ ...cell, textAlign: 'left' }}>anúncio</th>
                    <th style={cell}>visitas</th>
                    <th style={cell}>viu 3s</th>
                    <th style={cell}>aposta</th>
                    <th style={cell}>loop</th>
                    <th style={cell}>→VSL</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(a => (
                    <tr key={a.ad} style={{ borderTop: '1px solid rgba(25,20,39,.06)' }}>
                      <td style={{ ...cell, textAlign: 'left', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.ad}</td>
                      <td style={cell}>{a.n}</td>
                      <td style={{ ...cell, color: a.seen ? ink : dim }}>{a.seen}</td>
                      <td style={{ ...cell, color: a.gate ? violet : red }}>{a.gate}{a.seen ? ` (${Math.round((a.gate / a.seen) * 100)}%)` : ''}</td>
                      <td style={cell}>{a.loop}</td>
                      <td style={{ ...cell, color: a.vsl ? green : dim }}>{a.vsl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}

        {/* quiz honesto */}
        <div style={card}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>“Entendeu o que ela disse?”</p>
          {([['Entendi tudo', honest.all, green], ['Palavras soltas', honest.some, amber], ['Embolou tudo', honest.none, red]] as [string, number, string][]).map(([l, n, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              <span>{l}</span><span style={{ color: c }}>{n}</span>
            </div>
          ))}
        </div>

        {/* score + saídas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>Bandas de score</p>
            {([['Alto (80+)', bands.high, green], ['Médio (55-79)', bands.mid, amber], ['Baixo (<55)', bands.low, red]] as [string, number, string][]).map(([l, n, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                <span>{l}</span><span style={{ color: c }}>{n}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: dim, marginBottom: 12 }}>Sinais</p>
            {([['Pularam a demo', extras.skip], ['Mic negado', extras.micDenied], ['Avaliação falhou', extras.assessFail], ['Trava de custo', extras.blocked], ['Refizeram', extras.returning]] as [string, number][]).map(([l, n]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                <span>{l}</span><span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
