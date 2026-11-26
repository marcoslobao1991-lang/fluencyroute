import type { Metadata } from 'next'
import RealTime from './RealTime'

// Upsell 2 do funil do espanhol (Netflix Trick): aparece pra quem aceitou o Fast-Track.
export const metadata: Metadata = {
  title: 'Real Time Talk · Essential Spanish Fluency',
  robots: 'noindex, nofollow',
}

export default function SpanishRealTimePage() {
  return <RealTime />
}
