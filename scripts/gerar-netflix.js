// Gera app/netflix/NetflixSalesPage.tsx a partir da página da /spanish (app/spanish/SpanishSalesPage.tsx), sem tocar nela.
// Trocas: VSL nova (HLS vsl-netflix-trick-<preço>), oferta abre no "click the button below" (724 s), legenda do post,
// e 3 versões de preço em rotas próprias (/netflix = 197, /netflix97, /netflix297).
// Rodar de novo depois de mexer na /spanish: node scripts/gerar-netflix.js
const fs = require('fs')
let s = fs.readFileSync('app/spanish/SpanishSalesPage.tsx', 'utf8')
const troca = (a, b) => { if (!s.includes(a)) throw new Error('não achei: ' + a.slice(0, 60)); s = s.replace(a, b) }

troca("from './PostCard'", "from '../spanish/PostCard'")
troca("const PAY = '$197'           // preço único (pagamento único)", `// ── NETFLIX TRICK (23/11/2026): mesma página da /spanish, com a VSL nova e 3 versões de preço.
// A VSL fala o preço em voz, então CADA preço tem o seu vídeo (pasta HLS própria) e o seu checkout.
// ATENÇÃO: só o checkout de 197 dólares existe na Hotmart (é o da /spanish). 97 e 297 estão com checkout VAZIO de
// propósito: o botão não abre nada até a oferta ser criada na Hotmart e o link entrar aqui.
type Oferta = { pay: string; valor: number; checkout: string; media: string; reveal: number; tag: string }
const OFERTAS: Record<string, Oferta> = {
  '197': { pay: '$197', valor: 197, checkout: 'https://pay.hotmart.com/M94188676L?off=qp698at2', media: 'vsl-netflix-trick-197', reveal: 724, tag: 'vsl_nt197' },
  '97': { pay: '$97', valor: 97, checkout: '', media: 'vsl-netflix-trick-97', reveal: 724, tag: 'vsl_nt97' },
  '297': { pay: '$297', valor: 297, checkout: '', media: 'vsl-netflix-trick-297', reveal: 724, tag: 'vsl_nt297' },
}
let PAY = '$197'`)
troca('const PURCHASE_VALUE = 197   // valor total (tracking)', 'let PURCHASE_VALUE = 197')
troca("const CHECKOUT = 'https://pay.hotmart.com/M94188676L?off=qp698at2'  // checkout Hotmart (espanhol)", "let CHECKOUT = OFERTAS['197'].checkout")
troca("const MEDIA = 'vsl-spanish-fk1'", "let MEDIA = OFERTAS['197'].media")
troca('const REVEAL_AT = 1005', "let REVEAL_AT = OFERTAS['197'].reveal")
troca("const REVEAL_KEY = 'es_reveal_fk1'", "let REVEAL_KEY = 'es_reveal_nt197'")
troca("const POS_KEY = 'vsl_pos_es_fk1'", "let POS_KEY = 'vsl_pos_es_nt197'")
// a VSL nova já sai a 1,1x do Remotion: o player toca a 1x
troca("if (typeof window === 'undefined') return 1.1", "if (typeof window === 'undefined') return 1")
troca("return Math.min(2, Math.max(0.5, q || 1.1)) } catch { return 1.1 }", "return Math.min(2, Math.max(0.5, q || 1)) } catch { return 1 }")
troca("const VTAG = 'vsl_fk1' + (RATE !== 1 ? '_x' + Math.round(RATE * 100) : '') + (SKIN_POST ? '_ig' : '')", "let VTAG = 'vsl_nt197' + (RATE !== 1 ? '_x' + Math.round(RATE * 100) : '') + (SKIN_POST ? '_ig' : '')")
troca("const frTrack = createTracker({ funnel: 'spanish', page: 'vsl', variant: VTAG })", `let frTrack = createTracker({ funnel: 'spanish', page: 'vsl', variant: VTAG })
let ofertaAtual = '197'
function usarOferta(p: string) {
  if (p === ofertaAtual || !OFERTAS[p]) return
  const o = OFERTAS[p]; ofertaAtual = p
  PAY = o.pay; PURCHASE_VALUE = o.valor; CHECKOUT = o.checkout; MEDIA = o.media; REVEAL_AT = o.reveal
  REVEAL_KEY = 'es_reveal_nt' + p; POS_KEY = 'vsl_pos_es_nt' + p
  VTAG = o.tag + (RATE !== 1 ? '_x' + Math.round(RATE * 100) : '') + (SKIN_POST ? '_ig' : '')
  frTrack = createTracker({ funnel: 'spanish', page: 'vsl', variant: VTAG })
}`)
troca('export default function SpanishSalesPage() {', "export default function NetflixSalesPage({ preco = '197' }: { preco?: string }) {\n  usarOferta(preco)")
troca('caption="The repetition method to understand Spanish shows and movies without subtitles"', 'caption="The Netflix trick to learn Spanish while you do other things in your day"')
troca("if (stitchSid) e.currentTarget.href = buildCheckoutUrl(CHECKOUT, { ...getUtmsFromUrl(), sck: stitchSid })", "if (!CHECKOUT) { e.preventDefault(); return }\n      if (stitchSid) e.currentTarget.href = buildCheckoutUrl(CHECKOUT, { ...getUtmsFromUrl(), sck: stitchSid })")
// miolo da oferta: sai o da /spanish (teal, turma, carrossel), entra a página da VSL nova (app/netflix/Oferta.tsx, escrita à mão)
{ const a = s.indexOf('      {/* ═══ CTA 1 — PRICING ═══ */}'), b = s.indexOf('      {/* ═══ FOOTER ═══ */}')
  if (a < 0 || b < 0) throw new Error('não achei o miolo da oferta')
  s = s.slice(0, a) + '      <NetflixOferta pay={PAY} cta={(t) => <Btn text={t} />} />\n\n' + s.slice(b) }
troca("import PostCard, { Comentarios } from '../spanish/PostCard'", "import PostCard, { Comentarios } from '../spanish/PostCard'\nimport NetflixOferta from './Oferta'")
troca('<Btn compact text={`GET STARTED · ${PAY} one-time`} />', '<Btn compact text={`Get access now · ${PAY}`} />')
troca("<span style={{ color: C.t3 }}>fluency</span><span style={{ color: C.teal }}>route</span>", "<span style={{ color: C.t3 }}>fluency</span><span style={{ color: '#9D7BFF' }}>route</span>")
// sem vturb: o plano B do player é o MP4 direto da mesma pasta
s = s.split('vturbPlayerId={VTURB_PLAYER_ID}').join('mp4Fallback="fallback.mp4"')
s = s.split("frTrack('player_fallback_vturb')").join("frTrack('player_fallback_mp4')")
// play em forma de PRESELL (igual à /friends): cobre a página até o toque
troca("import NetflixOferta from './Oferta'", "import NetflixOferta from './Oferta'\nimport NetflixPresell from './Presell'")
troca("{/* ═══ HERO — VIDEO ═══ */}", "<NetflixPresell track={(ev, d) => { try { frTrack(ev, d) } catch {} }} posKey={POS_KEY} revealKey={REVEAL_KEY} />\n      {/* ═══ HERO — VIDEO ═══ */}")
s = '// GERADO por scripts/gerar-netflix.js a partir de app/spanish/SpanishSalesPage.tsx. Editar lá (ou no gerador) e rodar de novo.\n' + s.replace("'use client'\n", '')
s = "'use client'\n" + s
fs.mkdirSync('app/netflix', { recursive: true })
fs.writeFileSync('app/netflix/NetflixSalesPage.tsx', s)
for (const [dir, p] of [['netflix', '197'], ['netflix97', '97'], ['netflix297', '297']]) {
  fs.mkdirSync('app/' + dir, { recursive: true })
  fs.writeFileSync(`app/${dir}/page.tsx`, `import NetflixSalesPage from '${dir === 'netflix' ? './' : '../netflix/'}NetflixSalesPage'

// VSL "The Netflix Trick" (espanhol pra americanos), versão de preço $${p}. Mesma estrutura da /spanish.
export const metadata = {
  title: 'The Netflix Trick to Learn Spanish · Fluency Route',
  robots: 'noindex, nofollow',
}

export default function Page() {
  return <NetflixSalesPage preco="${p}" />
}
`)
}
console.log('ok: app/netflix, app/netflix97, app/netflix297')
