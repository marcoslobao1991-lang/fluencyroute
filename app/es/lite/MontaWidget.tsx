'use client'
import { useEffect } from 'react'

// monta o widget do funil de vendas da Hotmart (botões de 1 clique) assim que o script dela carrega
export function montaWidget() {
  try { (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel') } catch {}
}

export default function MontaWidget() {
  useEffect(() => {
    let tentativas = 0
    const iv = setInterval(() => {
      const el = document.getElementById('hotmart-sales-funnel')
      if ((window as any).checkoutElements && el && !el.childElementCount) montaWidget()
      if ((el && el.childElementCount) || ++tentativas > 40) clearInterval(iv)
    }, 300)
    return () => clearInterval(iv)
  }, [])
  return null
}
