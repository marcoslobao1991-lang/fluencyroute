import { NextResponse } from 'next/server'

// Token curto do Azure Speech pro diagnóstico de pronúncia do app de espanhol
// (shadowing). Sem trava de custo por IP (é produto pago, não tráfego frio como
// o /api/speech-token da bridge). Reusa AZURE_SPEECH_KEY/REGION.
export const runtime = 'nodejs'

export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION || 'eastus'
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 500 })
  try {
    const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key },
    })
    if (!res.ok) return NextResponse.json({ error: 'token' }, { status: 500 })
    const token = await res.text()
    return NextResponse.json({ token, region }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'azure' }, { status: 500 })
  }
}
