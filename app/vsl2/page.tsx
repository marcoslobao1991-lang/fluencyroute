import RotaFluenciaPage from '../vsl/RotaFluenciaPage'

// ═══════════════════════════════════════════════════════════════
// VSL2 — thank-you pós-captura do lead magnet (Loop de Repetição).
// É a MESMA VSL da /vsl (RotaFluenciaPage), com:
//   • headline "🔓 Seu treino já tá a caminho do seu e-mail"
//   • preço R$49/mês (a /vsl fica R$29)
//   • checkout jTO3lIy (a /vsl usa DlmRal3)
//   • alwaysOpen: tráfego morno pós-captura não espera o timer de reveal
// Tudo via prop vsl2 — a /vsl e /aberta continuam idênticas.
// ═══════════════════════════════════════════════════════════════
export default function Vsl2Page() {
  // sem alwaysOpen: a /vsl2 usa o MESMO delay de reveal da /vsl (oferta escondida até o timer)
  return <RotaFluenciaPage vsl2 />
}
