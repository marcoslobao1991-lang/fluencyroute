import type { Metadata } from 'next'
import ThankYou from './ThankYou'

// Página de obrigado do funil Spanish. Dispara Purchase (pixel 690 + CAPI ES).
export const metadata: Metadata = {
  title: 'Welcome — Essential Spanish Fluency',
  robots: 'noindex, nofollow',
}

export default function SpanishThankYouPage() {
  return <ThankYou />
}
