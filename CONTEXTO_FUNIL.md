# CONTEXTO_FUNIL.md — Funil Loop de Repetição (Fluency Route)

> Documento estratégico pra qualquer agente (Codex, Claude, humano) continuar o trabalho sem se perder.
> Estado fiel ao código em 06-07/07/2026. Leia o `AGENTS.md` primeiro (regras duras); aqui está o PORQUÊ de cada coisa.

## 1. Objetivo comercial

Vender o curso **Rota da Fluência** (inglês por música + treino de ouvido) através de um funil completo, em vez do tráfego direto → VSL que rodava antes (ROI ok, sem escala). A tese: o mesmo clique pago é aproveitado 4x — thank-you page, email, remarketing e (futuro) webinário — derrubando o CPA efetivo.

- **Checkout atual do funil:** `pay.kiwify.com.br/jTO3lIy` (exibido como R$49/mês na /vsl2 — confirmar valor no painel Kiwify com o dono antes de mexer).
- **Plano maior:** subir pra oferta R$497 (a narração da VSL já fala 497 em áudio; só a página segurava preço menor). Estratégia registrada: subir checkout sem regravar VSL. **Qualquer mudança de preço = decisão do dono.**
- A /vsl original (R$29, checkout DlmRal3) segue vendendo em paralelo pra outra campanha — é INTOCÁVEL.

## 2. Público-alvo

Adulto brasileiro que **lê inglês razoavelmente mas trava no ouvido/fala** ("Entendo, mas travo"). Persona âncora: "Camila" — mulher ~30-45, vergonha do inglês, já tentou cursinho/app, se considera "ruim de inglês desde a escola". Por isso:
- A copy usa **absolvição**: o problema é "seu ouvido nunca foi ligado", nunca "seu inglês é ruim".
- Desafio/teste repele essa persona — a promessa é formulada como PROMESSA, não como desafio.
- Onboarding pergunta o nível (zero/travado/solto) e personaliza a régua, "pra regular, não pra julgar".

## 3. Promessa e big idea

- **Big idea (validada, NÃO inventar outra):** ESTUDO vs TREINO. "Idioma é habilidade, não matéria. Habilidade não se estuda — se treina."
- **Mecanismo herói:** o **Loop de Repetição** — repetir o mesmo trecho de fala nativa até o ouvido "colar" o bloco de som (wanna/gotta/gonna).
- **Regra sagrada:** a promessa pública (ads, captura) vende SÓ o Loop. Cena de Friends, shadowing, Manu, diagnóstico = surpresa da entrega (transbordo). Já foi errado e corrigido 3x — não repetir.
- Stat proprietária utilizável: **~500 blocos de som = +80% de tudo que se fala numa série** (contagem própria de 703 episódios de Friends/HIMYM/TAHM).

## 4. Fluxo atual da experiência (o que está NO AR)

```
AD → fluencyroute.com.br/lead  (captura advertorial, modelada na /bridge)
      └─ pop-up two-step: email (dispara lead) → WhatsApp OPCIONAL c/ "pular"
   → redirect /treino  +  EMAIL D0 "🔓 Seu treino tá liberado" (Resend)
   → /treino  (lead magnet = demo-app do produto)
      Módulo 01 "O Piloto", 9 treinos, NAVEGAÇÃO 100% LIVRE (hub + botão ☰ TREINOS):
      1 Como funciona (3 REGRAS = paradigm shift; Manu narra)
      2 Medição de ouvido (slider baseline; cena com som)
      3-5 os 3 Loops (vídeo real cortado por Whisper; contador de voltas; legenda ON/OFF; PT; arsenal wanna/gotta/gonna)
      6 Entre na cena (shadowing: grava WAV, A/B "MINHA VOZ × A MONICA", NOTA DE PRONÚNCIA IA palavra por palavra — Azure)
      7 A Música ("How English Really Sounds" — os 3 blocos cantados, letra EN/PT)
      8 A Prova (cena inteira sem legenda + slider de novo)
      9 RESULTADO: delta antes/depois + arsenal + matemática do ouvido + boletim + LAUDO de diagnóstico
        (3 perfis: t1 Ouvido em Modo Leitura / t2 Ouvido Tradutor / t3 Refino — espectro visual + prescrição)
      + Módulo 02 "A Paquera do Ross" = PRÉVIA LIBERADA (cena 62s c/ legendas + CTA "o treino completo é na Rota")
   → CTA → /vsl2?from=treino&d=tier&n=nome&delta=X
      (/vsl2 = RotaFluenciaPage com prop vsl2: headline "seu treino tá a caminho do email", R$49, checkout jTO3lIy)
   → RECUPERAÇÃO por email (cron diário 9h BRT): D1, D2, D3, D5, D7 → todos pra /vsl2 com utm_campaign=dN
```

Estado persistido: retomada de onde parou (banner "seu treino ficou te esperando"), modo livre pós-conclusão.

## 5. Fluxo ideal recomendado (próximos passos, em ordem)

1. **Baseline da campanha atual** (Meta + Kiwify) antes de mexer em preço.
2. **WhatsApp**: número + Z-API pra D0 (o campo já é coletado e salvo; nada é enviado hoje).
3. **Legenda karaokê** nos Loops (linha acende com o tempo do vídeo — assinatura visual do app).
4. **Laudo compartilhável** (imagem do resultado → aquisição orgânica).
5. **Módulo 02 completo** como segundo treino (asset e teaser já existem) — só depois de dados do funil.
6. **Webinário R$997** pra não-compradores (deck de 46 slides já pronto em outro projeto).
7. Eventos do treino carregam o lead id (hoje são anônimos — ver §8).

## 6. Copy atual relevante (não reescrever sem motivo)

- Captura: hook "Isso é sem graça, mas me deixou fluente em inglês" · estrutura advertorial em capítulos · herói = iPhone mockup com o app se demonstrando (want to→wanna, placar 15%→80%).
- Absolvição por nível (tela pós-medição) — 3 variações (zero/travado/solto), todas terminam empurrando pra prova.
- Diagnóstico 3 tiers com prescrição numerada ("o que destrava primeiro no seu caso").
- Manu fala frases curtas com áudio real (12 mp3 em assets/manu) — sempre convidando pro próximo passo, nunca corrigindo a pessoa.
- Emails D1-D7 (em `app/api/funil-emails/route.ts`): D1 retoma o clique de ontem · D2 estudo vs treino · D3 mata 3 objeções · D5 matemática dos 500 blocos · D7 fechamento honesto sem escassez falsa.

## 7. Eventos de tracking existentes

| Onde | O quê |
|---|---|
| `/lead` (captura) | Meta Pixel 938768337634102 (PageView + Lead) · POST /api/funil-lead: passo 1 {id, email, nome?, src} → passo 2 {id, zap} (upsert, chaves vazias omitidas) |
| `/treino` | sendBeacon pra /api/funil-lead com {ev: home/rules/absolve/loopN_done/shadow/shadow_scored/song/resultado/m2_preview} — **sem lead id** (limitação conhecida) |
| Emails rec | UTMs: utm_source=email, utm_medium=rec, utm_campaign=d1..d7 |
| speech-token | Cada emissão vira linha em `funnel_events` (event=speech_token, detail=ip) — é a trava de 20/dia/IP |
| Dedup emails | `quiz_leads.answers.rec_dN = true` marca enviado; `src` iniciando com `qa_` = lead de teste, ignorado |

## 8. Problemas, riscos e pontos frágeis

1. **Preço em transição**: /vsl2 mostra R$49 e o áudio da VSL fala R$497. Intencional (estratégia registrada), mas confuso pra quem chega agora — NÃO "corrigir" sem falar com o dono.
2. **Eventos do treino são anônimos** (sem lead id) — não dá pra segmentar email por progresso ainda. O redirect da captura manda `?e=&id=` na URL do treino; ligar isso ao track() é melhoria de ~5 linhas.
3. **WhatsApp coletado mas nunca usado** (sem número/Z-API).
4. **Duplicação de código-fonte**: existem cópias do funil em `C:\Users\Asus\funil_497\` (rascunho histórico + HANDOFF.md + assets brutos, ex. cena10_full.mp4 e o JSON do Whisper) e no repo `ingles-cantado` (espelho legado em vercel.app). **A fonte da verdade é ESTE repo** (`fluencyroute/public/funil/`). Se editar aqui, os espelhos ficam velhos — ideal é editar aqui e ignorar os espelhos.
5. **QA em device físico** nunca foi feito (mic/autoplay em iOS Safari é o risco maior da nota de pronúncia).
6. **Trava do speech-token** = 20 análises/dia/IP. Escritórios/CGNAT podem esbarrar. A UI degrada com elegância (manda pro A/B), mas o número pode precisar de ajuste com tráfego real.
7. Sem A/B testing de nada ainda — decisões de copy são qualitativas até o tráfego rodar.

## 9. Decisões já implementadas (não re-litigar)

- Navegação 100% livre desde o início (pedido explícito do dono; era linear).
- Módulo 02 = prévia liberada DENTRO do app; morreu a promessa "desbloqueia amanhã por email".
- Só email D0 é transacional; D1-D7 são 100% recuperação de venda → /vsl2.
- Nota de pronúncia automática pós-gravação (sem clique extra), curva gentil (exp 1.35), palavra por palavra.
- Diagnóstico em formato laudo (espectro 3 perfis + prescrição) — não voltar pro card de 3 linhas.
- Áudio para SEMPRE ao trocar de tela (stopAllMedia) — não regredir.
- URLs limpas /lead e /treino via rewrite (o redirect interno da captura usa caminho ABSOLUTO "/treino").
- Playwright banido do QA deste projeto (custo); usar node + curl.

## 10. Como continuar sem se perder

1. Leia `AGENTS.md` (regras duras) e este arquivo inteiro.
2. Rode `npm run dev` e percorra /lead → /treino → /vsl2 no navegador a 390px.
3. Antes de editar `treino.html`/`comecar.html`: são self-contained e grandes — localize a seção pelo comentário de bloco (`/* ═══ ... ═══ */`).
4. Toda mudança: pequena, com `npm run build` antes do push, e verificação em produção via curl depois (`--ssl-no-revoke` no Windows).
5. Depois de deploy que toque VSL: `curl https://fluencyroute.com.br/vsl | grep -o "R\$29\|DlmRal3"` tem que continuar retornando os dois.
6. Histórico completo de decisões: `C:\Users\Asus\funil_497\HANDOFF.md` (fora do repo, contexto de como se chegou aqui).
