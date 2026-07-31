# Graph Report - fluencyroute  (2026-07-31)

## Corpus Check
- 151 files · ~333,811 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 287 edges · 31 communities (25 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d325954`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_build-vsl-static.js|build-vsl-static.js]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_get|get]]
- [[_COMMUNITY_Btn|Btn]]
- [[_COMMUNITY_Fluency Secrets — blueprint da reescrita definitiva|Fluency Secrets — blueprint da reescrita definitiva]]
- [[_COMMUNITY_Estrutura proposta|Estrutura proposta]]
- [[_COMMUNITY_content.tsx|content.tsx]]
- [[_COMMUNITY_Briefing-mestre — Fluency Secrets|Briefing-mestre — Fluency Secrets]]
- [[_COMMUNITY_Reader.tsx|Reader.tsx]]
- [[_COMMUNITY_9. Estrutura do manuscrito|9. Estrutura do manuscrito]]
- [[_COMMUNITY_qa-fluency-secrets.mjs|qa-fluency-secrets.mjs]]
- [[_COMMUNITY_SpanishSalesPage.tsx|SpanishSalesPage.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ThankYouFinal.tsx|ThankYouFinal.tsx]]
- [[_COMMUNITY_route.js|route.js]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_PurchaseTrigger.tsx|PurchaseTrigger.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_Kit WhatsApp — entrega de acesso (Rota da Fluência)|Kit WhatsApp — entrega de acesso (Rota da Fluência)]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]

## God Nodes (most connected - your core abstractions)
1. `Briefing-mestre — Fluency Secrets` - 14 edges
2. `POST()` - 12 edges
3. `9. Estrutura do manuscrito` - 9 edges
4. `Kit WhatsApp — entrega de acesso (Rota da Fluência)` - 8 edges
5. `Fluency Secrets — blueprint da reescrita definitiva` - 8 edges
6. `Estrutura proposta` - 8 edges
7. `RotaFluenciaPage()` - 7 edges
8. `Btn()` - 7 edges
9. `trackDual()` - 6 edges
10. `POST()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `sendServerEvent()`  [EXTRACTED]
  app/api/track-es/route.js → app/lib/meta-capi-es.js

## Import Cycles
- None detected.

## Communities (31 total, 6 thin omitted)

### Community 0 - "build-vsl-static.js"
Cohesion: 0.50
Nodes (4): fs, get(), https, main()

### Community 2 - "get"
Cohesion: 0.15
Nodes (19): Btn(), buildCheckoutUrl(), FAQ, frTrack, getExternalId(), getGoogleClickIds(), getOrCreateSessionId(), getUtmsFromUrl() (+11 more)

### Community 3 - "Btn"
Cohesion: 0.13
Nodes (13): chapterIds, expectedChapterIds, forbiddenPitchSignals, foundPitchSignals, longestParagraph, lowerSource, missingContrasts, missingMechanisms (+5 more)

### Community 4 - "Fluency Secrets — blueprint da reescrita definitiva"
Cohesion: 0.11
Nodes (18): Arquitetura de crenças, As três fontes e o que cada uma entrega, Copy original — `Downloads/COPY INGLES`, Epílogo — O inglês que fica, Estrutura proposta, Fluency Secrets — blueprint da reescrita definitiva, Fontes de sustentação, Manuscrito atual (+10 more)

### Community 5 - "Estrutura proposta"
Cohesion: 0.31
Nodes (8): ALLOWED_ORIGINS, corsHeaders(), OPTIONS(), POST(), readCookie(), crypto, sendServerEvent(), sha256()

### Community 7 - "Briefing-mestre — Fluency Secrets"
Cohesion: 0.09
Nodes (22): 10. Frame de capítulo, 11. Sistema visual, 12. Experiência do leitor, 13. Critério de sucesso, 1. Produto, 2. Função no funil, 3. Big Domino, 4. Inimigo e novo diagnóstico (+14 more)

### Community 8 - "Reader.tsx"
Cohesion: 0.25
Nodes (3): metadata, initialState, ReaderState

### Community 9 - "9. Estrutura do manuscrito"
Cohesion: 0.24
Nodes (14): createSubscription(), createUser(), fbcFromFbclid(), findUserIdByEmail(), generatePassword(), lookupStitchedByFbclid(), lookupStitchedBySck(), lookupStitchedBySessionId() (+6 more)

### Community 10 - "qa-fluency-secrets.mjs"
Cohesion: 0.28
Nodes (8): chrome, command(), delay(), evaluate(), getTarget(), mobile, pending, socket

### Community 11 - "SpanishSalesPage.tsx"
Cohesion: 0.14
Nodes (13): metadata, Btn(), buildCheckoutUrl(), FAQ, getExternalId(), getUtmsFromUrl(), PHASES, SERIES (+5 more)

### Community 12 - "page.tsx"
Cohesion: 0.24
Nodes (6): metadata, FAQ, getExternalId(), STACK, ThankYou(), trackEs()

### Community 13 - "page.tsx"
Cohesion: 0.18
Nodes (7): buildVslUrl(), FONT, getExternalId(), L, SpanishBridgePage(), trackEsB(), UTM_KEYS

### Community 15 - "route.js"
Cohesion: 0.43
Nodes (6): deliveryHtml(), lookupStitch(), pick(), POST(), PURCHASE_EVENTS, sendDelivery()

### Community 17 - "route.ts"
Cohesion: 0.67
Nodes (3): escapeXml(), GET(), VOICES

### Community 20 - "PurchaseTrigger.tsx"
Cohesion: 0.60
Nodes (4): pollOrderInfo(), PurchaseTrigger(), sha256Hex(), Window

### Community 23 - "route.ts"
Cohesion: 0.60
Nodes (4): ASSUNTOS, emailHtml(), GET(), novaSenha()

### Community 27 - "Kit WhatsApp — entrega de acesso (Rota da Fluência)"
Cohesion: 0.22
Nodes (8): ✅ CÓDIGO JÁ LIGADO (31/07) — só faltam as envs, D0 — na hora da compra (junto com o e-mail), D+1 — não logou ainda, D+3 — segundo toque (prova + facilidade), D+7 — último da régua (tom humano, porta aberta), Kit WhatsApp — entrega de acesso (Rota da Fluência), 🚑 Resgate de pedido de reembolso (quem NUNCA logou), Setup do número novo (~40 min, uma vez)

### Community 28 - "page.tsx"
Cohesion: 0.33
Nodes (4): faqs, features, metadata, modules

### Community 29 - "layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, viewport

## Knowledge Gaps
- **99 isolated node(s):** `metadata`, `D0 — na hora da compra (junto com o e-mail)`, `D+1 — não logou ainda`, `D+3 — segundo toque (prova + facilidade)`, `D+7 — último da régua (tom humano, porta aberta)` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `metadata`, `D0 — na hora da compra (junto com o e-mail)`, `D+1 — não logou ainda` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Btn` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Fluency Secrets — blueprint da reescrita definitiva` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Briefing-mestre — Fluency Secrets` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `SpanishSalesPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._