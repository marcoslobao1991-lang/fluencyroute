import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.5', '192.168.0.0/24'],
  async redirects() {
    return [
      { source: '/aula-vsl', destination: '/vsl2', permanent: true },
      { source: '/rota-fluencia', destination: '/vsl', permanent: true },
      { source: '/rota-fluencia/checkout', destination: '/subscribe', permanent: true },
      // 19/11: Marcos subiu a SCALE do Spanish apontando pra bridge e quer mandar direto pra VSL sem mexer nos anúncios.
      // Redirect temporário (307) leva a query (utm/fbclid) junto. Pra voltar a bridge: apagar esta linha (o rewrite pro .html continua lá).
      { source: '/spanish/bridge', destination: '/spanish', permanent: false },
    ]
  },
  async rewrites() {
    return {
      // beforeFiles vence a rota app/bridge — serve a versão estática leve (42KB vs 691KB)
      beforeFiles: [
        { source: '/bridge', destination: '/bridge.html' },
        { source: '/bridge2', destination: '/bridge.html' },
        // 10/11: bridge antiga (09c62a7) só pros afiliados convidados; ?vsl=fk2 leva pra VSL com lead
        { source: '/bridge-af', destination: '/bridge-af.html' },
        // sales letter em 4 páginas por clique (fonte: ~/fluency-sales-letter/sales-letter-v4.html), 12x R$29 DlmRal3
        { source: '/carta', destination: '/carta.html' },
        // quiz-bridge modelado no quiz "Método APA" da Teacher Poli (inlead), 10 etapas → /vsl com respostas na query
        { source: '/quiz-ingles', destination: '/quiz-ingles.html' },
        // versão paralela para comparação, preserva a /carta atual
        { source: '/carta-paralela', destination: '/carta-paralela.html' },
        // versão anterior (texto da VSL colado, bridge-letter.html), guardada
        { source: '/carta-vsl', destination: '/carta-vsl.html' },
        // versão anterior da carta (texto do doc "E se você já soubesse"), guardada pra comparação
        { source: '/carta-doc', destination: '/carta-doc.html' },
        // mesma cirurgia da bridge: vence a rota app/vsl — estática self-contained
        // (103KB total vs 15KB HTML + 673KB de chunks React). /vsl2 segue React.
        { source: '/vsl', destination: '/vsl.html' },
        // 17/11: site novo da VSL de Friends (gerado por scripts/gerar-vsl-friends.js), R$19/mês, checkout ESzq5JN (R$193). Não toca a /vsl
        { source: '/friends', destination: '/vsl-friends.html' },
        // 24/11: TESTE PARALELO = a /friends com o quiz demo-app por cima (scripts/gerar-friends-quiz.js). A /friends não muda.
        { source: '/friends-quiz', destination: '/vsl-friends-quiz.html' },
        // 23/11: cópia da /friends pro LINK DA BIO do Instagram (oferta aberta, sem presell, UTM de bio automática). Gerada por scripts/gerar-vsl-friends-bio.js
        { source: '/bio', destination: '/vsl-friends-bio.html' },
        // 23/11 (Marcos): o link da bio do Instagram é a /aberta; ela passa a ser a versão aberta da /friends (antes: app/aberta = VSL antiga com alwaysOpen). Pra voltar: apagar esta linha.
        // 24/11 (Marcos): /aberta (bio) = TYPEBOT do inglês com rastreio de bio (scripts/gerar-friends-quiz-bio.js). Antes: /vsl-friends-bio.html.
        { source: '/aberta', destination: '/vsl-friends-quiz-bio.html' },
        // oferta R$99/mês anual (checkout 6Fftr2I) — página nova, não toca a /vsl
        { source: '/vsl3', destination: '/vsl3.html' },
        // 14/11: página paralela pro afiliado, sem lead (fk1), checkout jTO3lIy 12x R$49 — não toca a /vsl
        { source: '/vsl49', destination: '/vsl49.html' },
        // 14/11: paralela do afiliado, sem lead (fk1), cupom -R$100 → checkout NTZlmFP R$383 (12x R$39,61); expira → jTO3lIy
        { source: '/vsl39', destination: '/vsl39.html' },
        // 14/11: página EXCLUSIVA de conferência da VSL da aula do YouTube (cortada × integral), fora do funil, sem pixel, noindex
        { source: '/vsl-yt', destination: '/vsl-yt.html' },
        // 14/11: duplicata da /vsl49 com a AULA DO YOUTUBE full (com digitação) + oferta, 52:21, pra testar tráfego (variant vsl_aula_ig)
        { source: '/vsl-aula', destination: '/vsl-aula.html' },
        // mesma cirurgia da bridge na versão Spanish/USA — estática (48KB vs ~728KB de chunks)
        { source: '/spanish/bridge', destination: '/spanish-bridge.html' },
        // funil LATAM ES como subpasta (padrão /spanish): bridge estática portada
        { source: '/es/bridge', destination: '/es-bridge.html' },
        // 25/11: /friends versão LATAM (VSL Friends da profesora Manuela, USD 49 Hotmart). Gerada por scripts/gerar-vsl-friends-latam.js. Não toca a /es/vsl
        { source: '/es/friends', destination: '/es-friends.html' },
      ],
      afterFiles: [
        { source: '/manu', destination: '/manu.html' },
        { source: '/lead', destination: '/funil/comecar.html' },
        { source: '/treino', destination: '/funil/treino.html' },
        { source: '/treino-ultra', destination: '/funil/treino-ultra.html' },
      ],
      fallback: [],
    }
  },
};

export default nextConfig;
