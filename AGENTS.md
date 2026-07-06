<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# fluencyroute — site e funis da Fluency Route

App Next.js (16.2.2) servido na Vercel como **fluencyroute.com.br** (branch `master` = produção, deploy automático no push). Contém o site, as VSLs de venda do curso de inglês "Rota da Fluência" e o **funil Loop de Repetição** (captura → lead magnet → VSL2 → checkout), que é a frente ativa. Contexto estratégico completo em `CONTEXTO_FUNIL.md`.

## Rodar

```sh
npm install
npm run dev          # localhost:3000 — funil em /lead, /treino, /vsl2
npm run build        # OBRIGATÓRIO antes de qualquer push — é o único gate de erro
npm run lint         # eslint
```

Não há testes automatizados. QA = `npm run build` + syntax-check dos HTML estáticos via node (extrair `<script>` e validar com `new Function()`) + `curl` nas URLs de produção após deploy. **Não usar Playwright** (decisão do dono — gasta demais). Nunca testar HTML estático via `file://`.

## Mapa do repo (o que importa)

| Caminho | O que é |
|---|---|
| `public/funil/comecar.html` | Página de captura (servida como **/lead** via rewrite). Self-contained: CSS+JS inline, pop-up two-step (email → WhatsApp opcional com "pular") |
| `public/funil/treino.html` | **O lead magnet** (servido como **/treino**). App de treino self-contained: home hub navegável, 3 Loops, shadowing com nota de pronúncia IA, música, prova, laudo de diagnóstico, prévia do Módulo 02 |
| `public/funil/assets/` | Vídeos cortados (bloco1-3, cena_completa, modulo2_paquera, hero_loop), poster, teaser, `manu/*.mp3` (voz TTS da professora) |
| `app/vsl/RotaFluenciaPage.tsx` | ⚠️ Componente da VSL VIVA (/vsl, R$29, checkout DlmRal3) **e** da /vsl2 via prop `vsl2` (R$49, checkout jTO3lIy, headline pós-captura) |
| `app/vsl2/page.tsx` | Só renderiza `<RotaFluenciaPage vsl2 />` (subarquivos antigos em app/vsl2/ são dead code) |
| `app/api/funil-lead/route.ts` | POST: grava lead em `quiz_leads` (Supabase, source `leadmagnet_497`) + email D0 via Resend |
| `app/api/funil-emails/route.ts` | GET (cron diário 12UTC via `vercel.json`): recuperação D1/D2/D3/D5/D7 → /vsl2. Auth `CRON_SECRET` (header Bearer ou ?key=) |
| `app/api/speech-token/route.ts` | Token Azure Speech 10min com **trava de custo 20/dia/IP** — usado pela nota de pronúncia do /treino e pela /bridge |
| `app/bridge/usePronunciation.ts` | Receita de referência do assessment Azure (o treino.html tem um porte vanilla fiel dela) |
| `next.config.ts` | Rewrites: `/lead`→comecar, `/treino`→treino, `/bridge`→bridge.html, `/manu`→manu.html. Redirects legados |
| `vercel.json` | Cron do funil-emails |

## Regras de implementação

1. **NUNCA quebrar a /vsl original**: vende a R$29 com checkout DlmRal3 em produção. Mudança de VSL2 entra por prop/branch no `RotaFluenciaPage`, nunca alterando o default. Após qualquer deploy que toque VSL: conferir que /vsl ainda mostra R$29 + DlmRal3.
2. **HTML do funil é self-contained** — sem frameworks, sem CDN, CSS+JS inline. Editar pontualmente; as páginas passaram por muitas iterações aprovadas — não reconstruir.
3. **Áudio/mídia**: toda navegação de tela passa por `go()`/`showScr()`/`goHome()`, que chamam `stopAllMedia()`. Nunca criar `new Audio()` sem guardar referência (bug histórico de música vazando).
4. **Estado do treino** em localStorage: `lm_st` (progresso/retomada) e `lm_done` (concluiu). Não renomear.
5. Fluxo de trabalho: **entender → planejar → alterar pouco → `npm run build` → push → verificar produção com curl.** Mudanças pequenas, uma de cada vez.

## Regras de design (6 versões rejeitadas até chegar aqui — não regredir)

- Fundo BRANCO `#FAFAF6`, teal `#12B5AC`/`#0B6E68`, DM Sans, kickers em fonte mono. NUNCA dark/cinema.
- Copy CIRÚRGICA: cortar toda frase que não empurra pro clique.
- **A promessa da captura NUNCA menciona** "cena"/"Friends"/"shadowing"/"diagnóstico"/"Manu" — a entrega é surpresa (transbordo). Vender só o "Loop de Repetição".
- Mobile-first: projetar e conferir a 390px.
- Voz da Manu: sempre OpenAI tts-1 voz "nova" (não trocar).
- Marca pública é "Fluency Route / Rota da Fluência" — "Inglês Cantado" nunca aparece em copy externa.

## Tracking / eventos

- Captura: Meta Pixel `938768337634102` + POST `/api/funil-lead` (id UUID do lead; email no passo 1, whatsapp no passo 2 — upsert, omitir chaves vazias pra não zerar).
- Treino: eventos de etapa via `sendBeacon` pro mesmo `/api/funil-lead` (campo `ev`).
- Emails de recuperação: UTM `utm_medium=rec&utm_campaign=dN` — é assim que se mede qual email converte.
- Leads de teste levam `src` começando com `qa_` e são ignorados pela sequência de emails.

## O que NUNCA alterar sem muito cuidado

- `/vsl` e tudo que ela compartilha (regra 1).
- Remetente Resend: **só `@acesso.fluencyroute.com.br` é verificado** — qualquer outro remetente falha silenciosamente (sem erro visível).
- Trava de custo do speech-token (20/dia/IP) — remover = conta Azure explode.
- Envs da Vercel: `CRON_SECRET`, `RESEND_API_KEY`, `SUPABASE_SERVICE_KEY`, `AZURE_SPEECH_*`.
- Preços/checkouts (DlmRal3=R$29 na /vsl; jTO3lIy na /vsl2) — mudança de preço é decisão do dono, não do agente.
