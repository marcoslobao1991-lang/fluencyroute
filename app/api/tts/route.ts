import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════
// /api/tts — voz nativa premium do app de espanhol (Azure Neural TTS).
// Substitui a voz do navegador (dependente do device / risco de sotaque).
// Proxy server-side: recebe o texto, sintetiza com es-MX-DaliaNeural e
// devolve MP3 com cache imutável (mesmo texto → mesmo áudio → CDN cacheia).
// Reusa AZURE_SPEECH_KEY/REGION (já pagos, usados no medidor de pronúncia).
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs'

const REGION = process.env.AZURE_SPEECH_REGION || 'eastus'
const KEY = process.env.AZURE_SPEECH_KEY
const VOICES: Record<string, string> = { dalia: 'es-MX-DaliaNeural', jorge: 'es-MX-JorgeNeural' }

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string))
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const text = (url.searchParams.get('t') || '').slice(0, 400).trim()
  if (!text) return new NextResponse('missing text', { status: 400 })
  if (!KEY) return new NextResponse('tts not configured', { status: 500 })

  const voice = VOICES[url.searchParams.get('v') || 'dalia'] || VOICES.dalia
  const rate = url.searchParams.get('r') === 'slow' ? '-25%' : '0%'
  const ssml = `<speak version='1.0' xml:lang='es-MX'><voice name='${voice}'><prosody rate='${rate}'>${escapeXml(text)}</prosody></voice></speak>`

  try {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'fluencyroute-app',
      },
      body: ssml,
    })
    if (!res.ok) {
      console.error('[TTS]', res.status, await res.text().catch(() => ''))
      return new NextResponse('tts upstream error', { status: 502 })
    }
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buf.byteLength),
      },
    })
  } catch (e) {
    console.error('[TTS] fetch err', e)
    return new NextResponse('tts error', { status: 502 })
  }
}
