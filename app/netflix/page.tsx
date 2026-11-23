import NetflixSalesPage from './NetflixSalesPage'

// VSL "The Netflix Trick" (espanhol pra americanos), versão de preço $197. Mesma estrutura da /spanish.
export const metadata = {
  title: 'The Netflix Trick to Learn Spanish · Fluency Route',
  robots: 'noindex, nofollow',
}

export default function Page() {
  return <NetflixSalesPage preco="197" />
}
