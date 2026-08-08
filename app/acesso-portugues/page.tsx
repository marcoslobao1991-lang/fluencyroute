'use client'

// Página de entrada do Português Cantado — o link que vai na área de membros da
// Kiwify e nas respostas de suporte. O aluno digita o e-mail da compra e entra na
// hora, sem senha e sem depender do e-mail (que estava caindo no spam).

import { useState } from 'react'

export default function AcessoPortuguesPage() {
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    if (carregando) return
    setErro(null)
    setCarregando(true)
    try {
      const r = await fetch('/api/acesso-portugues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const j = await r.json()
      if (j?.ok && j.link) { window.location.href = j.link; return }
      setErro(
        j?.motivo === 'compra_nao_encontrada'
          ? 'Não encontrei uma compra com esse e-mail. Confira se é o mesmo que você usou no pagamento — às vezes é o e-mail antigo ou tem um erro de digitação.'
          : j?.motivo === 'email_invalido'
          ? 'Esse e-mail não parece válido. Confere?'
          : 'Deu um problema aqui do nosso lado. Tenta de novo em um minuto.'
      )
    } catch {
      setErro('Sem conexão. Tenta de novo.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF6', color: '#15201E', fontFamily: "-apple-system, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '48px 22px' }}>
        <p style={{ fontWeight: 900, letterSpacing: 3, fontSize: 12, margin: 0 }}>
          PORTUGUÊS <span style={{ color: '#CC1212' }}>CANTADO</span>
        </p>

        <h1 style={{ fontSize: 27, fontWeight: 900, letterSpacing: -1, lineHeight: 1.22, margin: '20px 0 10px' }}>
          Entrar no meu acesso.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3D4A49', margin: '0 0 26px' }}>
          Digite o e-mail que você usou na compra e <b>você entra na hora</b> — sem senha e sem
          precisar procurar nenhum e-mail.
        </p>

        <form onSubmit={entrar}>
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="seu-email-da-compra@exemplo.com"
            autoComplete="email"
            required
            style={{
              width: '100%', boxSizing: 'border-box', padding: '15px 16px', fontSize: 16,
              borderRadius: 12, border: '1px solid #D6DEDC', background: '#fff', color: '#15201E',
            }}
          />
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%', marginTop: 12, padding: '16px 20px', fontSize: 16, fontWeight: 900,
              borderRadius: 12, border: 0, cursor: carregando ? 'default' : 'pointer',
              background: carregando ? '#8FA3A0' : '#CC1212', color: '#fff',
            }}
          >
            {carregando ? 'Entrando…' : 'ENTRAR AGORA ▶'}
          </button>
        </form>

        {erro && (
          <p style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.6, color: '#B4232A' }}>{erro}</p>
        )}

        <p style={{ marginTop: 28, fontSize: 13.5, lineHeight: 1.65, color: '#6B7876' }}>
          Comprou e não consegue entrar? Responda o e-mail da compra que a gente resolve —
          seu acesso é vitalício e não se perde.
        </p>
      </div>
    </main>
  )
}
