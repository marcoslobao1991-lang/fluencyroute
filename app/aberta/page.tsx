import type { Metadata } from 'next'
import RotaFluenciaPage from '../vsl/RotaFluenciaPage'

// /aberta — VSL idêntica à /vsl, porém SEM o delay: todo o conteúdo de venda
// (preço, CTAs, garantia, FAQ, sticky) aparece desde o frame 0. Mesmo componente
// da /vsl, só com alwaysOpen — nunca divergem. Uso: tráfego de remarketing.
// noindex pra não indexar conteúdo duplicado da /vsl.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function VslAbertaPage() {
  return <RotaFluenciaPage alwaysOpen />
}
