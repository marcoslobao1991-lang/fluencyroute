# Graph Report - fluencyroute  (2026-07-21)

## Corpus Check
- 141 files · ~318,069 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 178 nodes · 202 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5147c707`
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

## God Nodes (most connected - your core abstractions)
1. `Briefing-mestre — Fluency Secrets` - 14 edges
2. `9. Estrutura do manuscrito` - 9 edges
3. `Fluency Secrets — blueprint da reescrita definitiva` - 8 edges
4. `Estrutura proposta` - 8 edges
5. `RotaFluenciaPage()` - 7 edges
6. `trackDual()` - 6 edges
7. `Btn()` - 6 edges
8. `trackEs()` - 4 edges
9. `trackEsB()` - 4 edges
10. `corsHeaders()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `sendServerEvent()`  [EXTRACTED]
  app/api/track-es/route.js → app/lib/meta-capi-es.js

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "build-vsl-static.js"
Cohesion: 0.50
Nodes (4): fs, get(), https, main()

### Community 2 - "get"
Cohesion: 0.16
Nodes (18): Btn(), buildCheckoutUrl(), FAQ, frTrack, getExternalId(), getOrCreateSessionId(), getUtmsFromUrl(), PHASES (+10 more)

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
Cohesion: 0.14
Nodes (13): 10. Frame de capítulo, 11. Sistema visual, 12. Experiência do leitor, 13. Critério de sucesso, 1. Produto, 2. Função no funil, 3. Big Domino, 4. Inimigo e novo diagnóstico (+5 more)

### Community 8 - "Reader.tsx"
Cohesion: 0.25
Nodes (3): metadata, initialState, ReaderState

### Community 9 - "9. Estrutura do manuscrito"
Cohesion: 0.22
Nodes (9): 9. Estrutura do manuscrito, Epílogo — O inglês que fica, Notas e fontes, Parte I — O diagnóstico que muda tudo, Parte II — Como o inglês entra no automático, Parte III — A vantagem sem graça, Parte IV — A prova, Parte V — A expansão (+1 more)

### Community 10 - "qa-fluency-secrets.mjs"
Cohesion: 0.28
Nodes (8): chrome, command(), delay(), evaluate(), getTarget(), mobile, pending, socket

### Community 11 - "SpanishSalesPage.tsx"
Cohesion: 0.14
Nodes (10): metadata, Btn(), FAQ, getExternalId(), PHASES, SERIES, SERIES_LOOP, SpanishSalesPage() (+2 more)

### Community 12 - "page.tsx"
Cohesion: 0.32
Nodes (5): metadata, getExternalId(), INCLUDED, ThankYou(), trackEs()

### Community 13 - "page.tsx"
Cohesion: 0.20
Nodes (8): buildVslUrl(), CalloutMinute(), FONT, getExternalId(), L, SpanishBridgePage(), trackEsB(), UTM_KEYS

### Community 14 - "ThankYouFinal.tsx"
Cohesion: 0.38
Nodes (4): metadata, getExternalId(), ThankYouFinal(), trackEs()

### Community 15 - "route.js"
Cohesion: 0.60
Nodes (3): pick(), POST(), PURCHASE_EVENTS

## Knowledge Gaps
- **77 isolated node(s):** `PHASES`, `SERIES`, `SERIES_LOOP`, `FAQ`, `VturbPlayer` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Briefing-mestre — Fluency Secrets` connect `Briefing-mestre — Fluency Secrets` to `9. Estrutura do manuscrito`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `9. Estrutura do manuscrito` connect `9. Estrutura do manuscrito` to `Briefing-mestre — Fluency Secrets`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `PHASES`, `SERIES`, `SERIES_LOOP` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Btn` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Fluency Secrets — blueprint da reescrita definitiva` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Briefing-mestre — Fluency Secrets` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `SpanishSalesPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._