import NetflixSalesPage from './NetflixSalesPage'

// VSL "The Netflix Trick" (espanhol pra americanos), versão de preço $197. Mesma estrutura da /spanish.
export const metadata = {
  title: 'The Trick to Learn Spanish With Series · Fluency Route',
  description: 'Learn Spanish by training real scenes from series on repeat, with just your earbuds. Watch the video and see how the method works.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'The Trick to Learn Spanish With Series',
    description: 'Learn Spanish by training real scenes from series on repeat, with just your earbuds. Watch the video and see how it works.',
    images: ['/netflix/og.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Page() {
  return <NetflixSalesPage preco="197" />
}
