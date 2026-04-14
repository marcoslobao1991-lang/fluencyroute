import type { Metadata } from 'next'
import PurchaseTrigger from './PurchaseTrigger'

export const metadata: Metadata = {
  title: 'Compra Confirmada — Fluency Route',
  robots: 'noindex, nofollow',
}

export default function ObrigadoPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <PurchaseTrigger />
      <div style={{
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
      }}>

        {/* Check icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(78, 205, 196, 0.1)',
          border: '2px solid rgba(78, 205, 196, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase' as const,
          color: '#4ECDC4',
          background: 'rgba(78, 205, 196, 0.08)',
          border: '1px solid rgba(78, 205, 196, 0.15)',
          padding: '5px 16px',
          borderRadius: 100,
          marginBottom: 24,
        }}>
          Compra Confirmada
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 12,
          color: '#fff',
        }}>
          Bem-vindo à{' '}
          <span style={{
            background: 'linear-gradient(135deg, #4ECDC4, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Fluency Route
          </span>
        </h1>

        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7,
          marginBottom: 36,
        }}>
          Seu acesso tá pronto. Siga os passos abaixo pra começar.
        </p>

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '32px 24px',
          textAlign: 'left' as const,
        }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase' as const,
            color: '#4ECDC4',
            marginBottom: 24,
            textAlign: 'center' as const,
          }}>
            Próximos passos
          </p>

          {[
            {
              num: '1',
              text: <>Acesse a plataforma: <a href="https://app.fluencyroute.com.br" style={{ color: '#4ECDC4', textDecoration: 'underline', textUnderlineOffset: 3 }}>app.fluencyroute.com.br</a></>
            },
            {
              num: '2',
              text: <>Seu login é o <strong style={{ color: '#fff' }}>email que você usou na compra</strong></>
            },
            {
              num: '3',
              text: <>Clique em <strong style={{ color: '#fff' }}>"Esqueci minha senha"</strong> pra criar sua senha de acesso</>
            },
            {
              num: '4',
              text: <>Dê play na primeira música e <strong style={{ color: '#fff' }}>deixe o método trabalhar por você</strong></>
            },
          ].map((step) => (
            <div key={step.num} style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              marginBottom: 18,
            }}>
              <div style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                background: 'rgba(78, 205, 196, 0.08)',
                border: '1px solid rgba(78, 205, 196, 0.15)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                color: '#4ECDC4',
              }}>
                {step.num}
              </div>
              <p style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* WhatsApp note */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'rgba(78, 205, 196, 0.04)',
          border: '1px solid rgba(78, 205, 196, 0.1)',
          borderRadius: 12,
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6,
        }}>
          📱 Você também vai receber essas instruções no <strong style={{ color: 'rgba(255,255,255,0.7)' }}>WhatsApp</strong> em instantes.
        </div>

        {/* CTA button */}
        <a
          href="https://app.fluencyroute.com.br"
          style={{
            display: 'inline-block',
            marginTop: 32,
            padding: '16px 40px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            background: '#4ECDC4',
            color: '#000',
            textDecoration: 'none',
            boxShadow: '0 0 30px rgba(78, 205, 196, 0.2)',
          }}
        >
          ACESSAR PLATAFORMA
        </a>

        {/* Footer */}
        <p style={{
          marginTop: 40,
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
        }}>
          Fluency Route · Qualquer dúvida, responda a mensagem no WhatsApp
        </p>
      </div>
    </main>
  )
}
