'use client';

// /acesso — porta de entrada do APP DE TREINO (bônus do curso: Manu, Listening + Shadowing).
// Linkada na área do curso (Kiwify) e nos e-mails. A pessoa digita o e-mail da compra e entra na hora.

import { useEffect, useState } from 'react';

export default function AcessoPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado' | 'nao_achou' | 'erro'>('inicio');

  async function entrar(mail: string) {
    setEstado('enviando');
    try {
      const r = await fetch('/api/acesso-magico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail }),
      });
      const j = await r.json();
      if (j.ok && j.link) {
        setEstado('enviado');
        window.location.href = j.link;
      } else if (j.motivo === 'compra_nao_encontrada') setEstado('nao_achou');
      else setEstado('erro');
    } catch {
      setEstado('erro');
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    await entrar(email);
  }

  // link do e-mail de backup: /acesso?email=...&auto=1 entra sozinho
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const m = (q.get('email') || '').trim().toLowerCase();
      if (m) setEmail(m);
      if (m && q.get('auto') === '1') entrar(m);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "-apple-system,'Segoe UI',sans-serif", color: '#15201E' }}>
      <div style={{ maxWidth: 440, width: '100%' }}>
        <p style={{ fontWeight: 900, letterSpacing: 3, fontSize: 12 }}>
          FLUENCY <span style={{ color: '#12B5AC' }}>ROUTE</span>
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1.2, margin: '16px 0 10px' }}>
          Entrar no app de treino
        </h1>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: '#7C5CFF', margin: '0 0 14px' }}>
          BÔNUS DO CURSO · MANU · LISTENING E SHADOWING
        </p>

        {estado === 'enviado' ? (
          <div style={{ background: '#E8F7F5', border: '1px solid #12B5AC', borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Entrando no app...</p>
            <p style={{ fontSize: 15, color: '#3D4A49', lineHeight: 1.6, marginTop: 8 }}>
              A Manu está abrindo pra você. Se a tela não trocar sozinha em alguns segundos, olha o seu
              e-mail (<b>confere também o spam e a aba promoções</b>): mandamos um botão de entrada lá.
            </p>
            <p style={{ fontSize: 14, color: '#3D4A49', lineHeight: 1.6, marginTop: 10 }}>
              Pra voltar qualquer dia: <b>fluencyroute.com.br/acesso</b>, digita o e-mail e entra. Sem senha, sempre.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 16, color: '#3D4A49', lineHeight: 1.65 }}>
              Aqui você treina o <b>ouvido</b> e a <b>fala</b> com cenas reais de série, com a Manu conduzindo.
              É o bônus do curso, de nível intermediário: o lugar certo pra quem já bateu a primeira meta.
            </p>
            <p style={{ fontSize: 16, color: '#3D4A49', lineHeight: 1.65 }}>
              Digite o e-mail que você usou na compra e <b>você entra na hora</b>. Sem senha, sem abrir e-mail.
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
                {estado === 'enviando' ? 'Entrando...' : 'ENTRAR NO APP'}
              </button>
            </form>
            {estado === 'nao_achou' && (
              <p style={{ marginTop: 14, fontSize: 14, color: '#B4483E', lineHeight: 1.6 }}>
                Não encontramos compra nesse e-mail. Confere se é o mesmo e-mail que você usou no checkout.
                Se for e mesmo assim não entrar, escreve pra <b>contato@acesso.fluencyroute.com.br</b> que a gente resolve.
              </p>
            )}
            {estado === 'erro' && (
              <p style={{ marginTop: 14, fontSize: 14, color: '#B4483E' }}>
                Deu algo errado aqui. Tenta de novo em 1 minuto. Se continuar, escreve pra
                contato@acesso.fluencyroute.com.br.
              </p>
            )}
          </>
        )}
        <p style={{ fontSize: 12, color: '#9aa', marginTop: 26 }}>
          Fluency Route · acesso exclusivo pra alunos · as aulas do curso ficam na área de membros da Kiwify
        </p>
      </div>
    </main>
  );
}
