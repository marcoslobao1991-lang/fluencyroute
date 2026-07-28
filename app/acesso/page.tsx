'use client';

// /acesso — ponte de entrada pra plataforma nova.
// Linkada no curso antigo (área de membros Kiwify) e nos e-mails de acesso.
// A pessoa digita o e-mail da compra → recebe magic link por e-mail (1 clique, sem senha).

import { useState } from 'react';

export default function AcessoPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado' | 'nao_achou' | 'erro'>('inicio');

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado('enviando');
    try {
      const r = await fetch('/api/acesso-magico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (j.ok) setEstado('enviado');
      else if (j.motivo === 'compra_nao_encontrada') setEstado('nao_achou');
      else setEstado('erro');
    } catch {
      setEstado('erro');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "-apple-system,'Segoe UI',sans-serif", color: '#15201E' }}>
      <div style={{ maxWidth: 440, width: '100%' }}>
        <p style={{ fontWeight: 900, letterSpacing: 3, fontSize: 12 }}>
          FLUENCY <span style={{ color: '#12B5AC' }}>ROUTE</span>
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1.2, margin: '16px 0 10px' }}>
          Entrar na plataforma nova
        </h1>

        {estado === 'enviado' ? (
          <div style={{ background: '#E8F7F5', border: '1px solid #12B5AC', borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Link enviado! 📬</p>
            <p style={{ fontSize: 15, color: '#3D4A49', lineHeight: 1.6, marginTop: 8 }}>
              Olha a caixa de entrada de <b>{email}</b> (e a pasta de spam/promoções). O link entra
              direto, sem senha, e vale por 1 hora.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 16, color: '#3D4A49', lineHeight: 1.65 }}>
              Digite o e-mail que você usou na compra. A gente te manda um{' '}
              <b>link de entrada direta</b> — um clique e você está dentro, sem precisar de senha.
            </p>
            <form onSubmit={enviar} style={{ marginTop: 18 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu-email-da-compra@exemplo.com"
                style={{ width: '100%', boxSizing: 'border-box', fontSize: 16, padding: '15px 16px', borderRadius: 12, border: '1.5px solid #C9D6D4', background: '#fff' }}
              />
              <button
                type="submit"
                disabled={estado === 'enviando'}
                style={{ width: '100%', marginTop: 12, background: '#0B6E68', color: '#fff', fontWeight: 900, fontSize: 16, padding: '16px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', opacity: estado === 'enviando' ? 0.7 : 1 }}
              >
                {estado === 'enviando' ? 'Enviando...' : 'ME MANDA O LINK DE ENTRADA ▶'}
              </button>
            </form>
            {estado === 'nao_achou' && (
              <p style={{ marginTop: 14, fontSize: 14, color: '#B4483E', lineHeight: 1.6 }}>
                Não encontramos compra nesse e-mail. Confere se é o mesmo e-mail usado no checkout —
                ou escreve pra <b>contato@acesso.fluencyroute.com.br</b> que a gente resolve.
              </p>
            )}
            {estado === 'erro' && (
              <p style={{ marginTop: 14, fontSize: 14, color: '#B4483E' }}>
                Deu algo errado aqui. Tenta de novo em 1 minuto, ou escreve pra
                contato@acesso.fluencyroute.com.br.
              </p>
            )}
          </>
        )}
        <p style={{ fontSize: 12, color: '#9aa', marginTop: 26 }}>
          Fluency Route · acesso exclusivo pra alunos
        </p>
      </div>
    </main>
  );
}
