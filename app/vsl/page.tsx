import RotaFluenciaPage from './RotaFluenciaPage'

// VSL oficial — com o delay de 21 min (conteúdo de venda escondido até o timer).
// O componente vive em ./RotaFluenciaPage.tsx e é compartilhado com /aberta,
// então as duas rotas são sempre idênticas — só muda o delay.
export default function VslPage() {
  return <RotaFluenciaPage />
}
