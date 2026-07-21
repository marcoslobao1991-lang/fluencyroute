import SpanishSalesPage from './SpanishSalesPage'

// ═══════════════════════════════════════════════════════════════
// /spanish — CLONE da VSL (RotaFluenciaPage) em INGLÊS, oferta = ensinar
// espanhol pra quem fala inglês (mercado internacional / USD).
//
// TESTE no domínio atual. É uma rota INDEPENDENTE: não toca a /vsl viva,
// não dispara pixel/checkout de inglês. Reusa só design/primitives/CSS
// compartilhados (visual idêntico). Migra pro domínio próprio depois.
// ═══════════════════════════════════════════════════════════════
export const metadata = {
  title: 'Fluency Route — Learn Real Spanish',
}

export default function SpanishPage() {
  return <SpanishSalesPage />
}
