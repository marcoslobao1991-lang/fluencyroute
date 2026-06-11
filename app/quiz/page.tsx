import type { Metadata } from 'next'
import QuizClient from './QuizClient'

export const metadata: Metadata = {
  title: 'Diagnóstico de Travamento em Inglês — 60 segundos',
  description: 'Descubra em 60 segundos o tipo exato de travamento que faz seu inglês não evoluir. Diagnóstico personalizado.',
  robots: 'noindex, nofollow',
}

export default function QuizPage() {
  return <QuizClient />
}
