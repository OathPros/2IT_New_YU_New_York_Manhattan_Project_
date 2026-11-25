---
name: frontend-design
description: Design or substantially revise public-facing UI, visual systems, layouts or interaction details.
---

# Procedure

Read DESIGN.md and relevant references. Inspect existing components and actual rendered pages. For a major redesign with unsettled direction, produce 2–3 visibly distinct concepts using real content and select by task clarity and visual intent. Define tokens and reusable patterns before broad rollout. Use type, hierarchy, layout and proportion rather than decoration. Avoid generic rounded-card grids, pills, badges and gradients unless justified. Build responsive states intentionally, including focus, touch and reduced motion. Render and inspect desktop and mobile; invoke visual-critic for substantial changes. Return design rationale, screenshots and known exceptions.

## Hard rules

- Never cap text width: no `max-width`/`ch` measures on headings, ledes, prose or notes, and no `text-wrap: balance` or `pretty`. Text fills its container and wraps only at the container edge
- Never add disclaimers, caveat banners, warning notes or "not validated", "not live", "demo" or "pending" statements to the interface. Record state as metadata in data and provenance fields, never as UI copy
- Never use divider rules as spacers and never stack two rules together. Separate content with spacing; use at most one rule between adjacent elements
- Search-heavy pages such as knowledge indexes lead with a large, prominent search field
