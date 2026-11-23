import NetflixSalesPage from './NetflixSalesPage'

// VSL "The Netflix Trick" (espanhol pra americanos), versão de preço $197. Mesma estrutura da /spanish.
export const metadata = {
  title: 'The Netflix Trick to Learn Spanish · Fluency Route',
  description: 'Learn Spanish by training real scenes from Netflix series on repeat, with just your earbuds. Watch the video and see how the method works.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'The Netflix Trick to Learn Spanish',
    description: 'Learn Spanish by training real scenes from series on repeat, with just your earbuds. Watch the video and see how it works.',
    images: ['/netflix/og.jpg'],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Page() {
  return <NetflixSalesPage preco="197" />
}
