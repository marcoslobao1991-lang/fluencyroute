'use client'

import { useState, useEffect, useRef } from 'react'
import { genEventId, getFbCookies } from '../../lib/pixel'

// ── Tracking overrides for Rota da Fluência (different product/value) ──
function trackInitiateCheckout(eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Rota da Fluência Essencial',
      currency: 'BRL',
      value: 296.00,
    }, { eventID: eventId })
  }
}

function trackAddPaymentInfo(method: 'card' | 'pix', eventId?: string) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      content_name: 'Rota da Fluência Essencial',
      currency: 'BRL',
      value: 296.00,
      payment_method: method,
    }, { eventID: eventId })
  }
}

function trackPurchase(
  userData: { email?: string; phone?: string; cpf?: string; name?: string },
  orderId?: string,
  eventId?: string
) {
  if (typeof window === 'undefined' || !window.fbq) return
  const em = userData.email?.toLowerCase().trim()
  const ph = userData.phone?.replace(/\D/g, '')
  const fn = userData.name?.split(' ')[0]?.toLowerCase()
  const ln = userData.name?.split(' ').slice(1).join(' ')?.toLowerCase()
  window.fbq('init', '938768337634102', {
    em, ph: ph ? `55${ph}` : undefined, fn, ln,
    country: 'br', external_id: userData.cpf?.replace(/\D/g, ''),
  })
  window.fbq('track', 'Purchase', {
    content_name: 'Rota da Fluência Essencial',
    currency: 'BRL',
    value: 296.00,
    order_id: orderId,
  }, { eventID: eventId })
}

// ═══════════════════════════════════════════════════════════════
// CHECKOUT v9 — Validação inline, resumo, acentos, bandeiras
// ═══════════════════════════════════════════════════════════════

const INSTALLMENTS = [
  { n: 12, value: '29,90' },
  { n: 11, value: '32,18' },
  { n: 10, value: '34,85' },
  { n: 9,  value: '38,07' },
  { n: 8,  value: '42,00' },
  { n: 7,  value: '47,07' },
  { n: 6,  value: '53,78' },
  { n: 5,  value: '63,07' },
  { n: 4,  value: '76,96' },
  { n: 3,  value: '99,87' },
  { n: 2,  value: '150,47' },
  { n: 1,  value: '296,00' },
]

const PIX_PRICE = 'R$296,00'
const FONT = "'Inter', -apple-system, sans-serif"
const MONO = "'JetBrains Mono', monospace"

const F = {
  bg: '#f7f8fa', card: '#ffffff', border: '#e5e7eb', focus: '#4ECDC4', focusRing: 'rgba(78,205,196,0.15)',
  text: '#111827', text2: '#4b5563', text3: '#9ca3af',
  green: '#059669', greenBg: '#ecfdf5', greenBorder: '#a7f3d0',
  error: '#dc2626', errorBg: '#fef2f2',
}

const fmtCard = (v: string) => v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
const fmtCPF = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}
const fmtExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}` }
const fmtPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Validação CPF
const isValidCPF = (cpf: string) => {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(d[9]) !== check) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  return parseInt(d[10]) === check
}

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

function Input({ label, value, onChange, placeholder, type, mode, half, error, optional }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; mode?: string; half?: boolean
  error?: string; optional?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const hasError = !!error && !focused
  return (
    <div style={{ flex: half ? 1 : undefined, minWidth: 0 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: F.text2, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.3px' }}>
        {label}
        {optional && <span style={{ fontSize: 10, color: F.text3, fontWeight: 400 }}>(opcional)</span>}
      </label>
      <input
        type={type} inputMode={mode as any} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '14px 14px', fontSize: 16, fontFamily: FONT,
          border: `1.5px solid ${hasError ? F.error : focused ? F.focus : F.border}`, borderRadius: 10,
          outline: 'none', background: '#fff', color: F.text,
          transition: 'border-color .2s, box-shadow .2s',
          boxShadow: focused ? `0 0 0 3px ${F.focusRing}` : hasError ? `0 0 0 3px rgba(220,38,38,0.08)` : 'none', boxSizing: 'border-box',
        }}
      />
      {hasError && <p style={{ fontSize: 11, color: F.error, marginTop: 4, fontWeight: 500 }}>{error}</p>}
    </div>
  )
}

// SVG icons
const CardIcon = ({ active }: { active: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ECDC4' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="3" ry="3" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <line x1="5" y1="15" x2="9" y2="15" />
  </svg>
)

const PixIcon = ({ active }: { active: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M13.77 14.77l3.06 3.06a2.5 2.5 0 003.54 0l1.06-1.06a2.5 2.5 0 000-3.54l-3.06-3.06M10.23 9.23L7.17 6.17a2.5 2.5 0 00-3.54 0L2.57 7.23a2.5 2.5 0 000 3.54l3.06 3.06M14.83 9.17l-5.66 5.66" stroke={active ? '#4ECDC4' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Detecção de bandeira
const detectBrand = (num: string): { name: string; color: string } | null => {
  const d = num.replace(/\s/g, '')
  if (!d) return null
  if (/^4/.test(d)) return { name: 'Visa', color: '#1A1F71' }
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return { name: 'Mastercard', color: '#EB001B' }
  if (/^3[47]/.test(d)) return { name: 'Amex', color: '#006FCF' }
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(d)) return { name: 'Elo', color: '#000' }
  if (/^(606282|3841)/.test(d)) return { name: 'Hipercard', color: '#822124' }
  return null
}

export default function CheckoutPage() {
  const [method, setMethod] = useState<'card' | 'pix'>('card')
  const [installment, setInstallment] = useState(12)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<{ qr: string; code: string } | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [utms, setUtms] = useState<Record<string, string>>({})
  const [selectOpen, setSelectOpen] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [holderName, setHolderName] = useState('')
  const [ddi, setDdi] = useState('+55')
  const [ddiOpen, setDdiOpen] = useState(false)

  // Endereço
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepManual, setCepManual] = useState(false)
  const [cepError, setCepError] = useState('')

  // PIX timer
  const [pixExpiry, setPixExpiry] = useState<number | null>(null)
  const [pixTimeLeft, setPixTimeLeft] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (pixExpiry) {
      timerRef.current = setInterval(() => {
        const diff = pixExpiry - Date.now()
        if (diff <= 0) {
          setPixTimeLeft('Expirado')
          if (timerRef.current) clearInterval(timerRef.current)
          return
        }
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setPixTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [pixExpiry])

  const selected = INSTALLMENTS.find(i => i.n === installment)!

  const fmtCEP = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
  }

  const buscarCEP = async (raw: string) => {
    const d = raw.replace(/\D/g, '')
    if (d.length !== 8) return
    setCepLoading(true)
    setCepError('')
    setCepManual(false)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError('CEP não encontrado')
        setCepManual(true)
        setRua(''); setBairro(''); setCidade(''); setEstado('')
      } else {
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
        if (data.logradouro) {
          setRua(data.logradouro)
          setBairro(data.bairro || '')
        } else {
          // CEP genérico (zona rural, cidade pequena) — sem logradouro
          setCepManual(true)
          setRua('')
          setBairro(data.bairro || '')
        }
      }
    } catch {
      setCepError('Erro ao buscar CEP')
      setCepManual(true)
    }
    finally { setCepLoading(false) }
  }

  // Inline validation
  const fieldErrors = {
    name: touched.name && !name.trim() ? 'Informe seu nome completo' : '',
    email: touched.email && email && !isValidEmail(email) ? 'E-mail inválido' : touched.email && !email ? 'Informe seu e-mail' : '',
    cpf: touched.cpf && cpf && cpf.replace(/\D/g, '').length === 11 && !isValidCPF(cpf) ? 'CPF inválido' : touched.cpf && !cpf ? 'Informe seu CPF' : '',
    cardNumber: touched.cardNumber && method === 'card' && cardNumber.replace(/\s/g, '').length < 13 && cardNumber ? 'Número do cartão incompleto' : '',
    expiry: touched.expiry && method === 'card' && expiry && expiry.length < 5 ? 'Data inválida' : '',
    cvv: touched.cvv && method === 'card' && cvv && cvv.length < 3 ? 'CVV inválido' : '',
  }

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }))

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const u: Record<string, string> = {}
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'sck'].forEach(k => {
      const v = p.get(k); if (v) u[k] = v
    })
    setUtms(u)
    const eid = genEventId()
    trackInitiateCheckout(eid)
    // Server-side InitiateCheckout
    const { fbc, fbp } = getFbCookies()
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'InitiateCheckout', eventId: eid, fbc, fbp }) }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    // Touch all fields
    setTouched({ name: true, email: true, cpf: true, cardNumber: true, expiry: true, cvv: true })

    if (!name || !email || !cpf) { setError('Preencha todos os campos obrigatórios'); return }
    if (!isValidEmail(email)) { setError('E-mail inválido'); return }
    if (cpf.replace(/\D/g, '').length === 11 && !isValidCPF(cpf)) { setError('CPF inválido'); return }
    if (method === 'card' && (!cardNumber || !expiry || !cvv)) { setError('Preencha os dados do cartão'); return }
    setError(''); setLoading(true)
    // Save as abandoned cart lead (converted=false until payment succeeds)
    fetch('/api/abandoned-cart', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, phone: phone.replace(/\D/g, ''), method }) }).catch(() => {})
    const addPaymentEid = genEventId()
    const purchaseEid = genEventId()
    const { fbc, fbp } = getFbCookies()
    trackAddPaymentInfo(method as 'card' | 'pix', addPaymentEid)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method, name, email, installments: method === 'card' ? installment : 1,
          cpf: cpf.replace(/\D/g, ''), phone: phone.replace(/\D/g, ''),
          card: method === 'card' ? {
            number: cardNumber.replace(/\s/g, ''), exp_month: expiry.split('/')[0],
            exp_year: '20' + (expiry.split('/')[1] || ''), cvv, holder_name: holderName || name,
          } : undefined,
          address: rua ? {
            line_1: `${numero ? numero + ', ' : ''}${rua}`,
            line_2: bairro,
            city: cidade,
            state: estado,
            country: 'BR',
            zip_code: cep.replace(/\D/g, ''),
          } : undefined,
          utms,
          // Meta tracking data for server-side dedup
          meta: { addPaymentEid, purchaseEid, fbc, fbp },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao processar pagamento'); return }
      if (method === 'pix' && data.pix) {
        setPixData({ qr: data.pix.qr_code_url, code: data.pix.qr_code })
        setPixExpiry(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
      else {
        if (data.credentials) setCredentials(data.credentials)
        trackPurchase({ email, phone, cpf, name }, data.orderId, purchaseEid)
        setSuccess(true)
      }
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  const copyPix = () => {
    if (pixData) { navigator.clipboard.writeText(pixData.code); setPixCopied(true); setTimeout(() => setPixCopied(false), 2500) }
  }

  // ═══ SUCCESS ═══
  if (success) return (
    <div style={{ minHeight: '100vh', background: '#030305', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');`}</style>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '52px 32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', maxWidth: 420, width: '100%' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #4ECDC4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(78,205,196,0.15)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>Pagamento confirmado!</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 10, lineHeight: 1.7 }}>
          {credentials ? 'Sua conta foi criada. Enviamos seus dados por e-mail também.' : 'Sua assinatura está ativa. Enviamos a confirmação por e-mail.'}
        </p>

        {credentials && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', marginTop: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: 14 }}>Seus dados de acesso</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>E-mail:</span> <strong style={{ color: '#fff' }}>{credentials.email}</strong>
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Senha:</span>{' '}
              <code style={{ background: 'rgba(78,205,196,0.1)', color: '#4ECDC4', padding: '3px 10px', borderRadius: 6, fontSize: 16, fontFamily: MONO, letterSpacing: '1.5px', fontWeight: 700 }}>{credentials.password}</code>
            </p>
          </div>
        )}

        <a href="https://app.fluencyroute.com.br" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 28, padding: '14px 32px', borderRadius: 10, background: '#4ECDC4', color: '#000', fontSize: 15, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 20px rgba(78,205,196,0.3)' }}>ACESSAR PLATAFORMA</a>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>Guarde sua senha em um lugar seguro</p>
      </div>
    </div>
  )

  // ═══ PIX QR ═══
  if (pixData) return (
    <div style={{ minHeight: '100vh', background: F.bg, fontFamily: FONT, padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <div style={{ maxWidth: 420, margin: '24px auto' }}>
        <div style={{ background: F.card, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${F.border}`, boxShadow: '0 2px 16px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: F.greenBg, border: `1px solid ${F.greenBorder}`, fontSize: 12, fontWeight: 600, color: F.green, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.green, animation: 'pulse 2s infinite' }} />Aguardando pagamento
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: F.text }}>Escaneie o QR Code</h2>
          <p style={{ fontSize: 13, color: F.text2, marginTop: 4, marginBottom: 20 }}>Abra o app do seu banco e escaneie o código</p>
          {pixData.qr && <div style={{ background: '#fff', borderRadius: 12, padding: 20, display: 'inline-block', border: `1px solid ${F.border}`, marginBottom: 16 }}><img src={pixData.qr} alt="PIX" style={{ width: 200, height: 200, display: 'block' }} /></div>}
          <p style={{ fontSize: 24, fontWeight: 800, color: F.text, marginBottom: 8, fontFamily: MONO }}>{PIX_PRICE}</p>

          {/* Timer */}
          {pixTimeLeft && (
            <p style={{ fontSize: 12, color: pixTimeLeft === 'Expirado' ? F.error : F.text3, marginBottom: 16, fontFamily: MONO }}>
              {pixTimeLeft === 'Expirado' ? 'QR Code expirado' : `Expira em ${pixTimeLeft}`}
            </p>
          )}

          <div style={{ background: F.bg, borderRadius: 8, padding: '10px 14px', fontSize: 10, wordBreak: 'break-all', color: F.text3, marginBottom: 16, lineHeight: 1.5, maxHeight: 56, overflow: 'auto', border: `1px solid ${F.border}` }}>{pixData.code}</div>
          <button onClick={copyPix} style={{ width: '100%', padding: '14px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${pixCopied ? F.focus : F.border}`, background: pixCopied ? `${F.focus}08` : F.card, color: pixCopied ? F.focus : F.text, fontSize: 14, fontWeight: 700, transition: 'all .2s' }}>{pixCopied ? 'Copiado!' : 'COPIAR CÓDIGO PIX'}</button>
          <p style={{ fontSize: 11, color: F.text3, marginTop: 16 }}>Pagamento processado pela Pagar.me · Grupo Stone</p>
        </div>
      </div>
    </div>
  )

  // ═══ CHECKOUT ═══
  return (
    <div style={{ minHeight: '100vh', fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input,select,textarea{font-size:16px!important;touch-action:manipulation}
        html,body{overflow-x:hidden;-webkit-overflow-scrolling:touch}
        input::placeholder{color:#b0b6c3!important}
      `}</style>

      {/* ══════════════════════════════════════════════════════════
           HEADER — Compact dark with mockup
           ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#0A0A0A', position: 'relative', overflow: 'hidden',
      }}>
        {/* Series banner */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 10, maxHeight: 145, overflow: 'hidden', alignItems: 'flex-start',
          position: 'relative',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 70%, transparent 100%)',
        }}>
          {['/thumb-friends.jpg', '/thumb-himym.jpg', '/thumb-tahm.jpg'].map((src, i) => (
            <img key={i} src={src} alt="" style={{
              width: 100, height: 140, objectFit: 'cover', borderRadius: 8,
              filter: 'brightness(0.75) saturate(0.85)',
            }} />
          ))}
        </div>
        {/* Gradient fade over image bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #0A0A0A)', zIndex: 1, pointerEvents: 'none' }} />
        {/* Glow teal */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 400, height: 250, background: 'radial-gradient(circle, rgba(78,205,196,0.08), transparent 55%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 2, padding: '8px 16px 16px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="" style={{ width: 28, height: 28, borderRadius: 7 }} />
              <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                fluency<span style={{ color: '#4ECDC4' }}>route</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(78,205,196,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
           FORM
           ══════════════════════════════════════════════════════════ */}
      <div style={{ background: F.bg }}>
        <div style={{
          background: F.bg, borderRadius: '24px 24px 0 0', padding: '0 16px 48px',
          marginTop: -20, position: 'relative', zIndex: 2,
        }}>
          <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 28 }}>

          {/* ── Resumo do pedido ── */}
          <div style={{
            background: F.card, borderRadius: 14, padding: '18px 20px', marginBottom: 14,
            border: `1px solid ${F.border}`, boxShadow: '0 1px 8px rgba(0,0,0,.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo.png" alt="" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: F.text }}>Rota da Fluência Essencial</p>
                <p style={{ fontSize: 12, color: F.text3, marginTop: 4 }}>Acesso completo</p>
              </div>
            </div>
          </div>

          {/* ── Dados de acesso ── */}
          <div style={{ background: F.card, borderRadius: 14, padding: '24px 20px', marginBottom: 14, border: `1px solid ${F.border}`, boxShadow: '0 1px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(78,205,196,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: F.text }}>Dados de acesso</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nome completo" value={name} onChange={v => { setName(v); touch('name') }} placeholder="Seu nome completo" error={fieldErrors.name} />
              <Input label="E-mail" value={email} onChange={v => { setEmail(v); touch('email') }} placeholder="seu@email.com" type="email" error={fieldErrors.email} />
              <Input label="CPF" value={cpf} onChange={v => { setCpf(fmtCPF(v)); touch('cpf') }} placeholder="000.000.000-00" mode="numeric" error={fieldErrors.cpf} />
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: F.text2, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.3px' }}>
                  Celular <span style={{ fontSize: 10, color: F.text3, fontWeight: 400 }}>(opcional)</span>
                </label>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button onClick={() => setDdiOpen(!ddiOpen)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', height: '100%', minHeight: 47,
                      border: `1.5px solid ${ddiOpen ? F.focus : F.border}`, borderRadius: 10, background: '#fff',
                      fontSize: 13, color: F.text, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'border-color .2s',
                    }}>
                      <span style={{ fontSize: 16 }}>{
                        ddi === '+55' ? '\u{1F1E7}\u{1F1F7}' : ddi === '+1' ? '\u{1F1FA}\u{1F1F8}' : ddi === '+351' ? '\u{1F1F5}\u{1F1F9}' : ddi === '+34' ? '\u{1F1EA}\u{1F1F8}' :
                        ddi === '+44' ? '\u{1F1EC}\u{1F1E7}' : ddi === '+33' ? '\u{1F1EB}\u{1F1F7}' : ddi === '+49' ? '\u{1F1E9}\u{1F1EA}' : ddi === '+39' ? '\u{1F1EE}\u{1F1F9}' :
                        ddi === '+81' ? '\u{1F1EF}\u{1F1F5}' : ddi === '+61' ? '\u{1F1E6}\u{1F1FA}' : ddi === '+54' ? '\u{1F1E6}\u{1F1F7}' : ddi === '+56' ? '\u{1F1E8}\u{1F1F1}' :
                        ddi === '+57' ? '\u{1F1E8}\u{1F1F4}' : ddi === '+52' ? '\u{1F1F2}\u{1F1FD}' : ddi === '+595' ? '\u{1F1F5}\u{1F1FE}' : ddi === '+598' ? '\u{1F1FA}\u{1F1FE}' : '\u{1F310}'
                      }</span>
                      <span>{ddi}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={F.text3} strokeWidth="2.5" style={{ marginLeft: 2 }}><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    {ddiOpen && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, zIndex: 30, marginTop: 4,
                        background: '#fff', borderRadius: 12, border: `1px solid ${F.border}`,
                        boxShadow: '0 8px 32px rgba(0,0,0,.12)', maxHeight: 220, overflowY: 'auto', width: 200,
                      }}>
                        {[
                          { flag: '\u{1F1E7}\u{1F1F7}', code: '+55', name: 'Brasil' },
                          { flag: '\u{1F1FA}\u{1F1F8}', code: '+1', name: 'Estados Unidos' },
                          { flag: '\u{1F1F5}\u{1F1F9}', code: '+351', name: 'Portugal' },
                          { flag: '\u{1F1EA}\u{1F1F8}', code: '+34', name: 'Espanha' },
                          { flag: '\u{1F1EC}\u{1F1E7}', code: '+44', name: 'Reino Unido' },
                          { flag: '\u{1F1EB}\u{1F1F7}', code: '+33', name: 'França' },
                          { flag: '\u{1F1E9}\u{1F1EA}', code: '+49', name: 'Alemanha' },
                          { flag: '\u{1F1EE}\u{1F1F9}', code: '+39', name: 'Itália' },
                          { flag: '\u{1F1EF}\u{1F1F5}', code: '+81', name: 'Japão' },
                          { flag: '\u{1F1E6}\u{1F1FA}', code: '+61', name: 'Austrália' },
                          { flag: '\u{1F1E6}\u{1F1F7}', code: '+54', name: 'Argentina' },
                          { flag: '\u{1F1E8}\u{1F1F1}', code: '+56', name: 'Chile' },
                          { flag: '\u{1F1E8}\u{1F1F4}', code: '+57', name: 'Colômbia' },
                          { flag: '\u{1F1F2}\u{1F1FD}', code: '+52', name: 'México' },
                          { flag: '\u{1F1F5}\u{1F1FE}', code: '+595', name: 'Paraguai' },
                          { flag: '\u{1F1FA}\u{1F1FE}', code: '+598', name: 'Uruguai' },
                        ].map(c => (
                          <button key={c.code} onClick={() => { setDdi(c.code); setDdiOpen(false) }} style={{
                            width: '100%', padding: '10px 12px', cursor: 'pointer',
                            border: 'none', borderBottom: `1px solid ${F.border}`,
                            background: c.code === ddi ? 'rgba(78,205,196,0.06)' : '#fff',
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 13, color: F.text, textAlign: 'left',
                          }}>
                            <span style={{ fontSize: 16 }}>{c.flag}</span>
                            <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
                            <span style={{ fontSize: 12, color: F.text3 }}>{c.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    inputMode="tel" placeholder="(00) 00000-0000"
                    value={phone} onChange={e => setPhone(fmtPhone(e.target.value))}
                    style={{
                      flex: 1, padding: '14px 14px', fontSize: 16, fontFamily: FONT,
                      border: `1.5px solid ${F.border}`, borderRadius: 10, outline: 'none',
                      background: '#fff', color: F.text, boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* ── Endereço (CEP + ViaCEP) ── */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: F.text2, marginBottom: 6, display: 'block', letterSpacing: '0.3px' }}>CEP</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    inputMode="numeric" placeholder="00000-000"
                    value={cep} onChange={e => { const v = fmtCEP(e.target.value); setCep(v); if (v.replace(/\D/g, '').length === 8) buscarCEP(v) }}
                    style={{
                      flex: 1, padding: '14px 14px', fontSize: 16, fontFamily: FONT,
                      border: `1.5px solid ${cepError ? F.error : F.border}`, borderRadius: 10,
                      outline: 'none', background: '#fff', color: F.text, boxSizing: 'border-box',
                    }}
                  />
                  {cepLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                      <div style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#4ECDC4', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                    </div>
                  )}
                </div>
                {cepError && <p style={{ fontSize: 11, color: F.error, marginTop: 4, fontWeight: 500 }}>{cepError}</p>}
              </div>

              {/* Endereço preenchido pelo ViaCEP */}
              {(rua || cidade || cepManual) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp .25s ease' }}>
                  {/* Rua + Número */}
                  {cepManual ? (
                    <>
                      <Input label="Rua" value={rua} onChange={setRua} placeholder="Nome da rua" />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Input label="Número" value={numero} onChange={setNumero} placeholder="Nº" mode="numeric" half />
                        <Input label="Bairro" value={bairro} onChange={setBairro} placeholder="Bairro" half />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Input label="Cidade" value={cidade} onChange={setCidade} placeholder="Cidade" half />
                        <Input label="Estado" value={estado} onChange={setEstado} placeholder="UF" half />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Endereço encontrado — mostra bonito, só pede número */}
                      <div style={{
                        background: 'rgba(78,205,196,0.04)', border: '1px solid rgba(78,205,196,0.12)',
                        borderRadius: 10, padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#4ECDC4', letterSpacing: '0.5px' }}>Endereço encontrado</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: F.text, lineHeight: 1.5 }}>{rua}</p>
                        <p style={{ fontSize: 13, color: F.text2 }}>{bairro}{bairro && ' · '}{cidade} - {estado}</p>
                      </div>
                      <Input label="Número" value={numero} onChange={setNumero} placeholder="Nº da residência" mode="numeric" />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Pagamento ── */}
          <div style={{ background: F.card, borderRadius: 14, padding: '24px 20px', marginBottom: 14, border: `1px solid ${F.border}`, boxShadow: '0 1px 8px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(78,205,196,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="3" ry="3" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: F.text }}>Forma de pagamento</p>
            </div>

            {/* ── Payment method selector ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {(['card', 'pix'] as const).map(m => {
                const active = method === m
                return (
                  <div key={m} style={{
                    borderRadius: 14, overflow: 'hidden',
                    border: `1.5px solid ${active ? 'rgba(78,205,196,0.4)' : F.border}`,
                    background: active ? 'rgba(78,205,196,0.015)' : '#fff',
                    boxShadow: active ? '0 1px 8px rgba(78,205,196,0.06)' : 'none',
                    transition: 'all .2s ease',
                  }}>
                    <button onClick={() => setMethod(m)} style={{
                      width: '100%', padding: '16px 16px', cursor: 'pointer', textAlign: 'left',
                      border: 'none', background: 'transparent',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      {/* Radio */}
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: `1.5px solid ${active ? '#4ECDC4' : '#d1d5db'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s',
                      }}>
                        {active && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#4ECDC4', transition: 'all .2s' }} />}
                      </div>

                      {/* Icon */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                        background: active ? 'rgba(78,205,196,0.06)' : '#f8f9fa',
                        border: `1px solid ${active ? 'rgba(78,205,196,0.12)' : 'rgba(0,0,0,0.04)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s',
                      }}>
                        {m === 'card' ? <CardIcon active={active} /> : <PixIcon active={active} />}
                      </div>

                      {/* Text + info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: active ? F.text : F.text2 }}>
                            {m === 'card' ? 'Cartão de crédito' : 'PIX'}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* ── Price + Installment selector ── */}
                    {active && m === 'card' && (
                      <div style={{ padding: '0 16px 14px', animation: 'fadeUp .25s ease' }}>
                        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(78,205,196,0.12), transparent)`, marginBottom: 12 }} />
                        <select
                          value={installment}
                          onChange={e => setInstallment(Number(e.target.value))}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 8,
                            border: `1px solid rgba(78,205,196,0.2)`, background: 'rgba(78,205,196,0.02)',
                            fontSize: 13, fontWeight: 500, color: F.text, fontFamily: "'Inter', sans-serif",
                            cursor: 'pointer', appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%234ECDC4' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                          }}
                        >
                          {INSTALLMENTS.map(i => (
                            <option key={i.n} value={i.n}>{i.n}x de R${i.value}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {method === 'card' && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ position: 'relative' }}>
                    <Input label="Número do cartão" value={cardNumber} onChange={v => { setCardNumber(fmtCard(v)); touch('cardNumber') }} placeholder="0000 0000 0000 0000" mode="numeric" error={fieldErrors.cardNumber} />
                    {detectBrand(cardNumber) && (
                      <div style={{
                        position: 'absolute', right: 12, top: 30,
                        padding: '4px 10px', borderRadius: 6,
                        background: detectBrand(cardNumber)!.color,
                        animation: 'fadeUp .2s ease',
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{detectBrand(cardNumber)!.name}</span>
                      </div>
                    )}
                  </div>
                  <Input label="Nome do titular" value={holderName} onChange={v => setHolderName(v.toUpperCase())} placeholder="Digite o nome impresso no cartão" />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Input label="Validade" value={expiry} onChange={v => { setExpiry(fmtExp(v)); touch('expiry') }} placeholder="MM/AA" mode="numeric" half error={fieldErrors.expiry} />
                    <Input label="CVV" value={cvv} onChange={v => { setCvv(v.replace(/\D/g, '').slice(0, 4)); touch('cvv') }} placeholder="000" mode="numeric" half error={fieldErrors.cvv} />
                  </div>
                </div>
              </div>
            )}

            {method === 'pix' && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <div style={{
                  borderRadius: 12, padding: '20px', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(5,150,105,0.06), rgba(5,150,105,0.02))',
                  border: `1px solid ${F.greenBorder}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.04))',
                      border: `1px solid ${F.greenBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <PixIcon active={false} />
                    </div>
                    <div>
                      <p style={{ fontSize: 24, fontWeight: 800, color: F.green, fontFamily: MONO, letterSpacing: '-1px' }}>{PIX_PRICE}</p>
                      <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600, marginTop: 2 }}>Plano anual à vista · 12 meses de acesso</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
                    <p>Acesso completo à Rota da Fluência Essencial por <strong>1 ano inteiro</strong> — todas as séries, discursos, material de repetição e suporte por WhatsApp.</p>
                    <p style={{ marginTop: 6 }}>Aprovação imediata. Abra o app do seu banco, escaneie o QR Code e seu acesso é liberado na hora.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ background: F.errorBg, borderRadius: 10, padding: '12px 16px', marginBottom: 14, border: `1px solid rgba(220,38,38,0.15)`, fontSize: 13, color: F.error, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={F.error} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              {error}
            </div>
          )}

          {/* ── Submit ── */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '18px', borderRadius: 12, border: 'none',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #4ECDC4, #3bb5ad)',
            color: loading ? '#888' : '#000', fontSize: 16, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
            transition: 'all .2s', boxShadow: loading ? 'none' : '0 4px 24px rgba(78,205,196,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: '0.5px',
          }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2px solid #aaa', borderTopColor: '#666', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />Processando...</>
            ) : method === 'card' ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>FINALIZAR COMPRA</>
            ) : (
              <>GERAR QR CODE</>
            )}
          </button>

          {/* ══════ TRUST + GARANTIA — bloco único ══════ */}
          <div style={{
            marginTop: 16, borderRadius: 14,
            background: F.card, border: `1px solid ${F.border}`,
            boxShadow: '0 1px 8px rgba(0,0,0,.04)',
            padding: '20px',
          }}>
            {/* Processado por */}
            <p style={{ fontSize: 11, color: F.text3, fontWeight: 500, marginBottom: 10, textAlign: 'center' }}>Pagamento processado pela <strong style={{ color: F.text2 }}>Pagar.me</strong> — Grupo Stone</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', borderRadius: 6, background: '#f5f5f7', border: `1px solid ${F.border}` }}>
                <img src="/pagarme-dark.svg" alt="Pagar.me" style={{ height: 14, display: 'block', opacity: 0.4 }} />
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 6, background: '#f5f5f7', border: `1px solid ${F.border}` }}>
                <img src="/stone.png" alt="Stone" style={{ height: 12, display: 'block', opacity: 0.35 }} />
              </div>
              {['SSL', 'PCI DSS'].map((t, i) => (
                <span key={i} style={{ fontSize: 9, color: F.text3, fontWeight: 600, padding: '6px 10px', borderRadius: 6, background: '#f5f5f7', border: `1px solid ${F.border}`, letterSpacing: '0.3px', fontFamily: MONO }}>{t}</span>
              ))}
            </div>

            {/* Divisor */}
            <div style={{ height: 1, background: F.border, margin: '16px 0' }} />

            {/* Garantia */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={F.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
              </svg>
              <p style={{ fontSize: 13, color: F.text2 }}>
                <strong style={{ color: F.text }}>7 dias de garantia</strong> com estorno integral pelo mesmo meio de pagamento.
              </p>
            </div>
          </div>

          {/* Footer — powered by */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: F.text3, fontWeight: 500 }}>powered by</span>
              <img src="/pagarme-dark.svg" alt="Pagar.me" style={{ height: 13, opacity: 0.3 }} />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
