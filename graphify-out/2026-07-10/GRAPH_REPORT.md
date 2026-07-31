# Graph Report - fluencyroute  (2026-07-09)

## Corpus Check
- 123 files · ~239,385 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7 nodes · 6 edges · 3 communities (0 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6149894`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_build-vsl-static.js|build-vsl-static.js]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_get|get]]

## God Nodes (most connected - your core abstractions)
1. `get()` - 2 edges
2. `main()` - 2 edges
3. `nextConfig` - 1 edges
4. `fs` - 1 edges
5. `https` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (3 total, 3 thin omitted)

## Knowledge Gaps
- **3 isolated node(s):** `nextConfig`, `fs`, `https`
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `nextConfig`, `fs`, `https` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._