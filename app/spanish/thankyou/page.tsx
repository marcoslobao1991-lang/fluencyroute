import type { Metadata } from 'next'
import ThankYouFinal from './ThankYouFinal'

// Página FINAL do funil Spanish (após o upsell, tenha aceito ou recusado).
export const metadata: Metadata = {
  title: 'You’re all set — Essential Spanish Fluency',
  robots: 'noindex, nofollow',
}

export default function SpanishThankYouFinalPage() {
  return <ThankYouFinal />
}
