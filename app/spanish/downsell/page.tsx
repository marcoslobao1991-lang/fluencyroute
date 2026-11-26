import type { Metadata } from 'next'
import Downsell from './Downsell'

// Downsell do funil do espanhol (Netflix Trick): aparece pra quem recusa o Fast-Track.
export const metadata: Metadata = {
  title: 'One more option · Essential Spanish Fluency',
  robots: 'noindex, nofollow',
}

export default function SpanishDownsellPage() {
  return <Downsell />
}
