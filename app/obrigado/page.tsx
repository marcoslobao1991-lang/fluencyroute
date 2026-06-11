import type { Metadata } from 'next'
import Script from 'next/script'
import PurchaseTrigger from './PurchaseTrigger'

export const metadata: Metadata = {
  title: 'Acompanhamento Premium · Rota da Fluência',
  robots: 'noindex, nofollow',
}

const styles = `
  .upsell-root,.upsell-root *,.upsell-root *::before,.upsell-root *::after{box-sizing:border-box}
  .upsell-root{font-family:'Inter',-apple-system,sans-serif;font-weight:300;letter-spacing:-0.01em;-webkit-font-smoothing:antialiased;background:#030305;color:#edece8;min-height:100vh}
  .upsell-root a{color:inherit}
  .upsell-root .esconder{display:none}

  .upsell-root .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 22px;gap:18px}
  .upsell-root .player-wrap{width:100%;max-width:400px;margin:0 auto;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);background:#06060a}
  .upsell-root .player-hint{margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;color:rgba(255,255,255,0.15);text-align:center}

  .upsell-root .reveal{max-width:680px;margin:0 auto;padding:0 22px 80px}
  .upsell-root .badge{display:inline-block;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;padding:7px 12px;border:1px solid rgba(255,255,255,0.18);border-radius:999px;color:rgba(255,255,255,0.55);margin-bottom:24px}
  .upsell-root h1.title{font-size:clamp(28px,5.2vw,40px);line-height:1.08;font-weight:400;letter-spacing:-0.03em;margin:0 0 18px;color:#fff}
  .upsell-root h1.title em{font-style:normal;font-weight:600;color:#e9d8a6}
  .upsell-root p.sub{font-size:clamp(15px,2.1vw,17px);line-height:1.55;font-weight:300;color:rgba(237,236,232,0.7);margin:0 auto 56px;max-width:560px;text-align:center}

  .upsell-root .section{margin-bottom:64px}
  .upsell-root .section-label{font-size:10px;letter-spacing:5px;text-transform:uppercase;font-weight:600;color:rgba(255,255,255,0.32);margin-bottom:18px;display:flex;align-items:center;gap:14px}
  .upsell-root .section-label::before,.upsell-root .section-label::after{content:"";flex:1;height:1px;background:rgba(255,255,255,0.08)}
  .upsell-root h2.section-title{font-size:clamp(22px,3.2vw,28px);font-weight:400;letter-spacing:-0.02em;line-height:1.15;margin:0 0 14px;color:#fff;text-align:center}
  .upsell-root p.section-lead{font-size:14px;line-height:1.6;color:rgba(237,236,232,0.6);text-align:center;margin:0 auto 36px;max-width:480px}

  .upsell-root .compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:540px){.upsell-root .compare{grid-template-columns:1fr}}
  .upsell-root .compare-card{padding:24px 22px;border:1px solid rgba(255,255,255,0.07);border-radius:14px;background:rgba(255,255,255,0.015)}
  .upsell-root .compare-card.bad{opacity:0.55}
  .upsell-root .compare-card .ck{font-size:9px;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:10px}
  .upsell-root .compare-card.good .ck{color:#e9d8a6}
  .upsell-root .compare-card h3{margin:0 0 8px;font-size:17px;font-weight:500;letter-spacing:-0.01em;color:#fff}
  .upsell-root .compare-card p{margin:0;font-size:13px;line-height:1.55;color:rgba(237,236,232,0.65)}

  .upsell-root .stack{display:flex;flex-direction:column;gap:10px}
  .upsell-root .stack-item{padding:20px 22px;border:1px solid rgba(255,255,255,0.07);border-radius:12px;background:rgba(255,255,255,0.015);display:flex;gap:18px;align-items:flex-start}
  .upsell-root .stack-item .num{flex:0 0 36px;height:36px;border-radius:10px;background:rgba(233,216,166,0.08);border:1px solid rgba(233,216,166,0.18);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#e9d8a6}
  .upsell-root .stack-item .body h3{margin:0 0 4px;font-size:15px;font-weight:500;color:#fff;letter-spacing:-0.01em}
  .upsell-root .stack-item .body p{margin:0;font-size:13px;line-height:1.55;color:rgba(237,236,232,0.6)}

  .upsell-root .phases{display:grid;grid-template-columns:1fr 28px 1fr;gap:0;align-items:stretch}
  @media(max-width:540px){.upsell-root .phases{grid-template-columns:1fr;gap:14px}.upsell-root .phase-arrow{transform:rotate(90deg);margin:0 auto}}
  .upsell-root .phase{padding:22px 20px;border:1px solid rgba(255,255,255,0.07);border-radius:14px;background:rgba(255,255,255,0.015)}
  .upsell-root .phase .pl{font-size:9px;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:rgba(233,216,166,0.7);margin-bottom:8px}
  .upsell-root .phase h3{margin:0 0 6px;font-size:16px;font-weight:500;letter-spacing:-0.01em;color:#fff}
  .upsell-root .phase p{margin:0;font-size:13px;line-height:1.55;color:rgba(237,236,232,0.6)}
  .upsell-root .phase-arrow{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.25);font-size:18px}
  .upsell-root .phases-note{margin-top:20px;text-align:center;font-size:13px;line-height:1.6;color:rgba(237,236,232,0.55);max-width:520px;margin-left:auto;margin-right:auto}
  .upsell-root .phases-note em{font-style:normal;color:#e9d8a6}

  .upsell-root .offer{padding:34px 28px;border:1px solid rgba(233,216,166,0.22);border-radius:18px;background:linear-gradient(180deg,rgba(233,216,166,0.04) 0%,rgba(233,216,166,0.01) 100%);text-align:center}
  .upsell-root .anchor{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:24px}
  .upsell-root .anchor-row{font-size:13px;color:rgba(237,236,232,0.45);letter-spacing:0.01em}
  .upsell-root .anchor-row s{text-decoration-thickness:1px;text-decoration-color:rgba(255,255,255,0.3)}
  .upsell-root .price-flow{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:8px}
  .upsell-root .price-flow .pf-row{font-size:13px;color:rgba(237,236,232,0.6);line-height:1.5}
  .upsell-root .price-flow .pf-arrow{color:rgba(233,216,166,0.5);font-size:14px}
  .upsell-root .price-final{margin:18px 0 6px}
  .upsell-root .price-final .label{font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:600;color:rgba(233,216,166,0.8);margin-bottom:8px}
  .upsell-root .price-final .value{font-size:clamp(40px,8vw,56px);font-weight:600;letter-spacing:-0.03em;color:#fff;line-height:1}
  .upsell-root .price-final .value sup{font-size:0.5em;font-weight:500;color:rgba(255,255,255,0.5);margin-right:2px;top:-0.55em;position:relative}
  .upsell-root .price-note{font-size:12px;color:rgba(237,236,232,0.5);margin:4px 0 26px}

  .upsell-root .kiwify-mount{margin:30px auto 0}
  .upsell-root .kiwify-mount button{font-family:'Inter',sans-serif !important;font-weight:600 !important;font-size:16px !important;letter-spacing:0.01em !important;padding:18px 32px !important;border-radius:12px !important;width:100%;max-width:480px;background-color:#2ECC70 !important;border:1px solid #2ECC70 !important;cursor:pointer;transition:transform .2s,filter .2s}
  .upsell-root .kiwify-mount button:hover{transform:translateY(-1px);filter:brightness(1.05)}
  .upsell-root .kiwify-mount #kiwify-upsell-cancel-trigger-pZFRkJJ{font-family:'Inter',sans-serif !important;font-size:13px !important;color:rgba(255,255,255,0.35) !important;text-decoration:underline;margin-top:18px !important}

  .upsell-root .upsell-footer{margin-top:80px;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:500;color:rgba(255,255,255,0.18)}
`

const upsellHtml = `
<section class="hero">
  <div class="player-wrap">
    <vturb-smartplayer id="vid-68239596d7a895bbe506340f" style="display:block;margin:0 auto;width:100%;max-width:400px;"></vturb-smartplayer>
  </div>
  <p class="player-hint">Assista com som ativado</p>
</section>

<main class="reveal esconder">

  <div style="text-align:center">
    <span class="badge">Oferta exclusiva pós-treinamento</span>
  </div>

  <h1 class="title" style="text-align:center">
    Transforme o seu treinamento em uma <em>experiência com acompanhamento premium</em>.
  </h1>
  <p class="sub">
    Você acabou de entrar na Rota. Esta é a única oportunidade de adicionar suporte direto da nossa equipe, feedback dos seus treinos e supervisão individual — pelo mesmo investimento que você já fez.
  </p>

  <section class="section">
    <div class="section-label">o porquê do acompanhamento</div>
    <h2 class="section-title">Treinar sozinho ≠ treinar com supervisão.</h2>
    <p class="section-lead">A diferença entre quem destrava o inglês e quem fica parado quase nunca é o método. É ter alguém olhando seu treino de perto.</p>
    <div class="compare">
      <div class="compare-card bad">
        <div class="ck">Sem acompanhamento</div>
        <h3>Você treina, mas duvida.</h3>
        <p>O cérebro procrastina, inventa desculpa, pula treino. Sem alguém de fora, você não enxerga os pequenos detalhes que travam sua evolução.</p>
      </div>
      <div class="compare-card good">
        <div class="ck">Com Premium</div>
        <h3>Você treina com certeza.</h3>
        <p>Equipe de especialistas escuta seus áudios, ajusta sua execução e personaliza seu plano. Cada semana é uma evolução clara, não uma aposta.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-label">o que está incluso</div>
    <h2 class="section-title">O sistema completo de suporte da Rota.</h2>
    <p class="section-lead">Acesso vitalício a tudo, dentro do mesmo treinamento que você acabou de adquirir.</p>
    <div class="stack">
      <div class="stack-item"><div class="num">01</div><div class="body"><h3>Grupo VIP exclusivo no WhatsApp</h3><p>Acesso direto à equipe de especialistas, desafios semanais e uma comunidade pequena e fechada de alunos realmente comprometidos.</p></div></div>
      <div class="stack-item"><div class="num">02</div><div class="body"><h3>Feedback personalizado via WhatsApp</h3><p>Envia áudio dos seus treinos, recebe correção específica e orientação sob medida. Um coach de inglês no seu bolso, pronto quando precisar.</p></div></div>
      <div class="stack-item"><div class="num">03</div><div class="body"><h3>Supervisão e personalização dos treinos</h3><p>A equipe identifica exatamente onde você está travando e ajusta seu plano de treino para atacar a sua dificuldade específica.</p></div></div>
      <div class="stack-item"><div class="num">04</div><div class="body"><h3>Análises mensais de progresso</h3><p>A cada 30 dias, relatório completo da sua evolução: o que avançou, o que ajustar e qual é o próximo passo para acelerar ainda mais.</p></div></div>
      <div class="stack-item"><div class="num">05</div><div class="body"><h3>Acesso vitalício à Rota completa</h3><p>Todas as atualizações e novos materiais que a gente desenvolver entram automaticamente, sem pagar nada a mais. Para sempre.</p></div></div>
    </div>
  </section>

  <section class="section">
    <div class="section-label">o que muda na sua evolução</div>
    <h2 class="section-title">Da fase de treino para o caminho sem volta.</h2>
    <p class="section-lead">A Rota tem duas fases. O Premium existe para garantir que você chegue na segunda — onde a fluência se torna inevitável.</p>
    <div class="phases">
      <div class="phase">
        <div class="pl">Fase 1</div>
        <h3>Treinos concentrados</h3>
        <p>Você ainda não entende quase nada. Repete o mesmo minuto até o ouvido separar palavra, pausa e ligação entre sons.</p>
      </div>
      <div class="phase-arrow">→</div>
      <div class="phase">
        <div class="pl">Fase 2</div>
        <h3>Caminho sem volta</h3>
        <p>Você deixa de treinar inglês — passa a usar inglês. Filme sem legenda, livro original, conversa real. A fluência só pode subir a partir daqui.</p>
      </div>
    </div>
    <p class="phases-note">O Acompanhamento Premium <em>encurta o tempo até a fase 2</em>. Com supervisão da equipe, você não fica preso na fase 1 por meses sem perceber.</p>
  </section>

  <section class="section">
    <div class="section-label">o investimento</div>
    <h2 class="section-title">Por que somente agora — e somente aqui.</h2>
    <p class="section-lead">O valor cheio do Acompanhamento Premium é R$99/mês (~R$1.188/ano). Comparando com aula presencial, que cobra no mínimo R$250/mês e não chega nem perto de forçar fluência do jeito que a gente faz.</p>
    <div class="offer">
      <div class="anchor">
        <div class="anchor-row">Escola presencial · mínimo <s>R$250/mês</s></div>
        <div class="anchor-row">Premium valor cheio · <s>R$99/mês (R$1.188/ano)</s></div>
      </div>
      <div class="price-flow">
        <div class="pf-row">100% do que você investiu na Rota</div>
        <div class="pf-arrow">↓ vira desconto aqui ↓</div>
      </div>
      <div class="price-final">
        <div class="label">Hoje, à vista, somente nesta página</div>
        <div class="value"><sup>R$</sup>479</div>
      </div>
      <p class="price-note">ou parcelado no checkout · acesso anual completo</p>

      <div class="kiwify-mount">
        <div style="text-align:center" id="kiwify-upsell-pZFRkJJ" data-upsell-url="" data-downsell-url="">
          <button id="kiwify-upsell-trigger-pZFRkJJ" style="background-color:#2ECC70;padding:12px 16px;cursor:pointer;color:#FFFFFF;font-weight:600;border-radius:4px;border:1px solid #2ECC70;font-size:20px;">Sim, eu aceito essa oferta especial!</button>
          <div id="kiwify-upsell-cancel-trigger-pZFRkJJ" style="margin-top:1rem;cursor:pointer;font-size:16px;text-decoration:underline;font-family:sans-serif;">Não, eu gostaria de recusar essa oferta</div>
        </div>
      </div>
    </div>
  </section>

  <footer class="upsell-footer">━ Rota da Fluência ━ Acompanhamento Premium</footer>
</main>
`

export default function ObrigadoPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <link rel="preconnect" href="https://scripts.converteai.net" crossOrigin="" />
      <link rel="preconnect" href="https://snippets.kiwify.com" crossOrigin="" />
      <link rel="preconnect" href="https://app.kiwify.com.br" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <PurchaseTrigger />

      <div className="upsell-root" dangerouslySetInnerHTML={{ __html: upsellHtml }} />

      {/* Vturb loader */}
      <Script id="vturb-loader" strategy="afterInteractive">{`
        (function(){
          var s=document.createElement("script");
          s.src="https://scripts.converteai.net/a2b1bd19-973f-4fda-ada9-47d42bffa2ad/players/68239596d7a895bbe506340f/v4/player.js";
          s.async=true;
          document.head.appendChild(s);
        })();
      `}</Script>

      {/* Kiwify 1-click upsell snippet */}
      <Script src="https://snippets.kiwify.com/upsell/upsell.min.js" strategy="afterInteractive" />

      {/* Delay reveal — sincroniza com 'vai aparecer um botão aqui embaixo' (6:07 / 367s) */}
      <Script id="vturb-delay" strategy="afterInteractive">{`
        (function(){
          var DELAY = 367;
          var bound = false;
          function bind(){
            var p = document.querySelector("vturb-smartplayer");
            if(!p || typeof p.addEventListener !== "function"){ setTimeout(bind, 120); return; }
            if(bound) return;
            bound = true;
            p.addEventListener("player:ready", function(){
              try { p.displayHiddenElements(DELAY, [".esconder"], { persist: true }); } catch(e){}
            });
          }
          bind();
        })();
      `}</Script>
    </>
  )
}
