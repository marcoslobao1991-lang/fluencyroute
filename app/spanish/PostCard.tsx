'use client'

// ═══════════════════════════════════════════════════════════════
// POST DE INSTAGRAM da VSL Spanish (12/11/2026) — mesma pegada da /vsl BR (07/11):
// cabeçalho @fluencyroute, vídeo bloqueado (VslPlayer skin="post"), Curtir + Comentar
// FUNCIONANDO, legenda. Sem número inventado: nada de curtidas/views/comentários
// de outro vídeo. Interações gravam em vsl_interacoes (só insert anon) com
// variant 'es_<vtag>'. Comentário da pessoa aparece só pra ela até ser aprovado.
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react'

const IG_F = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'
const SUPA_INT = 'https://petrtewismhpzidcmmwb.supabase.co/rest/v1/vsl_interacoes'
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldHJ0ZXdpc21ocHppZGNtbXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDg3NDYsImV4cCI6MjA4OTM4NDc0Nn0.CTGC11dPKawf3tFWrEu9jXgxn2oPmPMXQS9bFcN4o10'

const BTN: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f2f2f2', border: 0, borderRadius: 999,
  padding: '8px 14px', font: `600 14px ${IG_F}`, color: '#000', cursor: 'pointer',
}
const CAMPO: React.CSSProperties = {
  font: `16px ${IG_F}`, padding: '10px 12px', border: '1px solid #dbdbdb', borderRadius: 10,
  outline: 'none', width: '100%', boxSizing: 'border-box', color: '#000', background: '#fff',
}

function lsGet<T>(k: string): T | null {
  try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null }
}
function lsSet(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}

function salvaInteracao(variant: string, tipo: string, o: Record<string, unknown> = {}) {
  try {
    const p = new URLSearchParams(location.search)
    if (p.get('fr_no_track') === '1' || localStorage.getItem('fr_no_track') === '1') return
    let sid = localStorage.getItem('fr_sid')
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('fr_sid', sid) }
    fetch(SUPA_INT, {
      method: 'POST', keepalive: true,
      headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        ...o, tipo, session_id: sid, variant,
        utm_content: p.get('utm_content'), user_agent: (navigator.userAgent || '').slice(0, 400),
      }),
    }).catch(() => {})
  } catch {}
}

function Joinha({ on }: { on: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10v11H3V10h4zm0 0 4.2-7.3c.3-.5 1-.7 1.5-.4 1 .5 1.5 1.6 1.2 2.7L13 9.5h6.2c1.3 0 2.3 1.2 2 2.5l-1.6 7.2c-.2.9-1 1.5-2 1.5H7"
        fill={on ? '#000' : 'none'} stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export const COMENTARIOS_ID = 'es-comentarios'

export default function PostCard({ player, caption, variant, track }: {
  player: React.ReactNode
  caption: string
  variant: string
  track: (event: string, detail?: string) => void
}) {
  const [liked, setLiked] = useState(false)
  useEffect(() => { setLiked(!!lsGet<boolean>('es_post_like')) }, [])

  const curtir = () => {
    const on = !liked
    setLiked(on); lsSet('es_post_like', on)
    salvaInteracao(variant, on ? 'like_post' : 'unlike_post', { alvo: 'post' })
    try { track(on ? 'post_like' : 'post_unlike') } catch {}
  }

  const comentar = () => {
    document.getElementById(COMENTARIOS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      try { (document.getElementById(COMENTARIOS_ID + '-txt') as HTMLTextAreaElement | null)?.focus({ preventScroll: true }) } catch {}
    }, 350)
  }

  return (
    <div style={{ maxWidth: 470, margin: '0 auto', overflow: 'hidden', background: '#fff', fontFamily: IG_F, fontWeight: 400, color: '#000' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ig-fluencyroute.jpg" alt="" width={32} height={32}
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flex: 'none', display: 'block', boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }} />
        <b style={{ fontSize: 14, fontWeight: 600 }}>fluencyroute</b>
      </div>
      <div style={{ position: 'relative', paddingTop: '177.78%', background: '#06060a' }}>
        {player}
      </div>
      <div style={{ padding: '8px 12px 0' }}>
        <div style={{ display: 'flex', gap: 8, padding: '4px 0 10px' }}>
          <button type="button" style={BTN} onClick={curtir} aria-pressed={liked}>
            <Joinha on={liked} />{liked ? 'Liked' : 'Like'}
          </button>
          <button type="button" style={BTN} onClick={comentar}>Comment</button>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.4, margin: 0 }}>
          <b style={{ fontWeight: 600 }}>fluencyroute</b> {caption}
        </p>
      </div>
    </div>
  )
}

// ═══ COMENTÁRIOS ═══
// Caixa de comentar (grava em vsl_interacoes; o da pessoa só ela vê até aprovar)
// + "What people say about Fluency Route": comentários REAIS do vídeo do YouTube
// da Fluency Route (LeSeXm9XeZk), traduzidos fiel pro inglês em /es-comentarios.json
// [autor, texto, curtidas]. Quem falou de inglês continua falando de inglês.
const CORES = ['#e85d75', '#4f8cc9', '#9b6bd6', '#f08a3c', '#2bb3a3', '#d6a21e', '#6c7a89', '#c2569b']
type Com = [string, string, number]

function Linha({ c, meu, variant }: { c: Com; meu?: boolean; variant: string }) {
  const [abrir, setAbrir] = useState(false)
  const k = c[0] + '|' + c[1].slice(0, 40)
  const [cur, setCur] = useState(false)
  useEffect(() => { if (!meu) setCur(!!(lsGet<Record<string, number>>('es_com_likes') || {})[k]) }, [k, meu])
  let h = 0
  for (let i = 0; i < c[0].length; i++) h = (h * 31 + c[0].charCodeAt(i)) | 0
  const longo = c[1].length > 170
  const texto = longo && !abrir ? c[1].slice(0, 150).replace(/\s+\S*$/, '') + '... ' : c[1]
  const total = c[2] + (cur ? 1 : 0)
  const curtir = () => {
    const m = lsGet<Record<string, number>>('es_com_likes') || {}
    const on = !cur
    if (on) m[k] = 1; else delete m[k]
    lsSet('es_com_likes', m); setCur(on)
    salvaInteracao(variant, on ? 'like_comentario' : 'unlike_comentario', { alvo: ('@' + c[0]).slice(0, 120) })
  }
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
      <span style={{
        width: 30, height: 30, borderRadius: '50%', background: meu ? '#262626' : CORES[Math.abs(h) % CORES.length],
        color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      }}>
        {c[0].charAt(0).toUpperCase()}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, lineHeight: 1.4, margin: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
          <b style={{ fontWeight: 600, marginRight: 5 }}>@{c[0]}</b>{texto}
          {longo && !abrir && <span style={{ color: '#737373', cursor: 'pointer' }} onClick={() => setAbrir(true)}>more</span>}
        </p>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#737373', marginTop: 4, fontWeight: 600 }}>
          {meu ? <span>now · only you can see this until it&apos;s approved</span> : (<>
            {total > 0 && <span>{total} {total === 1 ? 'like' : 'likes'}</span>}
            <button type="button" onClick={curtir}
              style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer', color: cur ? '#ed4956' : '#737373' }}>
              {cur ? 'Liked' : 'Like'}
            </button>
          </>)}
        </div>
      </div>
    </div>
  )
}

export function Comentarios({ variant, track, fim }: {
  variant: string
  track: (event: string, detail?: string) => void
  fim?: boolean // true = já desceu pro fim da página (oferta aberta)
}) {
  const [lista, setLista] = useState<Com[]>([])
  const [n, setN] = useState(5)
  const [meus, setMeus] = useState<Com[]>([])
  const [nomeSalvo, setNomeSalvo] = useState<string | null>(null)
  const [txt, setTxt] = useState('')
  const [nome, setNome] = useState('')
  const [aberto, setAberto] = useState(false)
  const txtRef = useRef<HTMLTextAreaElement>(null)
  const titRef = useRef<HTMLParagraphElement>(null)
  const trackRef = useRef(track)
  trackRef.current = track
  const vistoRef = useRef(false)

  useEffect(() => {
    setMeus((lsGet<[string, string][]>('es_com_meus') || []).map(([a, b]) => [a, b, 0] as Com))
    setNomeSalvo(lsGet<string>('es_com_nome'))
    fetch('/es-comentarios.json').then(r => r.json()).then((L: Com[]) => { if (Array.isArray(L)) setLista(L) }).catch(() => {})
  }, [])

  // leitura: viu a seção (1x) e até qual comentário rolou (marcos)
  useEffect(() => {
    const t = titRef.current
    if (!t || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting) && !vistoRef.current) { vistoRef.current = true; try { trackRef.current('com_visto') } catch {} ; io.disconnect() }
    }, { threshold: 0.6 })
    io.observe(t)
    return () => io.disconnect()
  }, [lista.length])

  const pronto = txt.trim().length > 1 && (!!nomeSalvo || nome.replace(/[@\s]/g, '').length > 0)

  const publicar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pronto) return
    const nm = nomeSalvo || nome.trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@+/, '')
      .replace(/\s+/g, '').toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30)
    if (!nm) return
    if (!nomeSalvo) { setNomeSalvo(nm); lsSet('es_com_nome', nm) }
    const t = txt.trim().slice(0, 1500)
    const novo: Com[] = [[nm, t, 0], ...meus]
    setMeus(novo); lsSet('es_com_meus', novo.map(([a, b]) => [a, b]))
    salvaInteracao(variant, 'comentario', { nome: nm, texto: t })
    try { track('comentario') } catch {}
    setTxt(''); txtRef.current?.blur()
  }

  const verMais = () => {
    try { track('com_ver_mais', String(n)) } catch {}
    setN(x => x + 10)
  }

  return (
    <div style={{ padding: '0 12px', background: fim ? 'transparent' : '#fff' }}>
      <div id={COMENTARIOS_ID} style={{
        maxWidth: 470, margin: fim ? '8px auto 48px' : '0 auto', padding: '14px 14px 6px', background: '#fff',
        borderRadius: fim ? 14 : 0, fontFamily: IG_F, fontWeight: 400, color: '#000', borderTop: fim ? 'none' : '1px solid #efefef',
      }}>
        <form onSubmit={publicar} style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 16px' }}>
          <textarea id={COMENTARIOS_ID + '-txt'} ref={txtRef} value={txt} onChange={e => setTxt(e.target.value)} onFocus={() => setAberto(true)}
            placeholder="Add a comment..." maxLength={1500} rows={1}
            style={{ ...CAMPO, resize: 'none', minHeight: 44 }} />
          {aberto && !nomeSalvo && (
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Your Instagram @" maxLength={60}
              autoComplete="username" autoCapitalize="none" spellCheck={false} style={CAMPO} />
          )}
          {aberto && (
            <button type="submit" style={{ ...BTN, alignSelf: 'flex-end', background: '#0095f6', color: '#fff', opacity: pronto ? 1 : 0.45 }}>
              Post
            </button>
          )}
        </form>
        {meus.map((c, i) => <Linha key={'m' + i} c={c} meu variant={variant} />)}
        {lista.length > 0 && (<>
          <p ref={titRef} style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 14px', paddingTop: 14, borderTop: '1px solid #efefef' }}>
            What people say about Fluency Route
          </p>
          {lista.slice(0, n).map((c, i) => <Linha key={i} c={c} variant={variant} />)}
          {n < lista.length && (
            <button type="button" onClick={verMais}
              style={{ background: 'none', border: 0, padding: '0 0 10px', color: '#737373', font: `500 13px ${IG_F}`, cursor: 'pointer' }}>
              See more comments ({lista.length - n})
            </button>
          )}
        </>)}
      </div>
    </div>
  )
}

