import type { Metadata } from 'next'
import RotaFluenciaPage from '../vsl/RotaFluenciaPage'

// /vsl2-aberta — VSL2 idêntica à /vsl2 (R$49, checkout jTO3lIy), porém SEM o
// delay: oferta, preço e CTAs visíveis desde o frame 0. Uso: Google Search
// (intenção alta — quem busca já quer ver a oferta, não espera 21 min).
// noindex pra não indexar conteúdo duplicado; AdsBot não é afetado.
//
// selfHosted (07/08/2026): página-piloto do player próprio que substitui o
// VTurb (assinatura sendo cancelada). Vídeo servido do mirror HLS na VPS.
// Validou aqui → ligar a prop nas outras VSLs.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function Vsl2AbertaPage() {
  return <RotaFluenciaPage vsl2 alwaysOpen selfHosted />
}
