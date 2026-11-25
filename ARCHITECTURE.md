# Architecture — York IT Service Experience

Status: Implemented on `redesign/devkit` (local, not deployed). Verified 2026 with `npm test`, `npm run content:check`, `npm run build` and `py scripts/check-links.py`.

## Principles

- **One source, many surfaces.** Structured records in `content/` are the only source of truth. The website, the search index, the service digests and the NEXUS graph are all projections of the same model. Future Halo, NEXUS and AI-assistant surfaces consume the JSON projections rather than re-authoring content.
- **Composition is separate from presentation.** `src/model.mjs` resolves relationships once; views only render.
- **No runtime dependencies.** The build, the dev server and the tests use Node built-ins. Playwright lives outside the project in `.cache/tools` and is used only for visual evidence.
- **Honest by construction.** Validation state, review dates, schedules and support facts come from records. A view cannot claim a record is validated unless `state === 'validated'` and `reviewed_at` is set (`validateArticle`, `knowledgeState`).

## Layers

```
content/records/*        imported + editorial records (articles, services, offerings, pages, ledger)
content/nexus/*          ontology: entity types, relationship predicates
content/journeys.json    authored guided tasks (cite article IDs, never restate procedures)
content/experience.json  top tasks, quick actions, support channels (sourced from the contact page)
        │
src/load-content.mjs     loads and applies editorial overrides
src/model.mjs            validateExperience · composeModel · serviceDigest · searchRecords
        │
src/views.mjs            server-only page compositions (home, tasks, services, offerings, knowledge, search, help)
src/render.mjs           browser-safe primitives: shell, finder, reader, knowledge rows
src/ui.mjs               browser-safe labels, knowledge state, links
src/search.mjs           ranking (term, phrase, intent), grouping, article validation
src/client.mjs           progressive enhancement: palette, instant results, quick view, filters, branch choice
src/styles.css           the single design system stylesheet
        │
scripts/build.mjs        static output to dist/ with CSP headers, redirects and JSON projections
scripts/dev.mjs          local server with the same CSP
```

## Domain model

| Entity | Identity | Source | Notes |
| --- | --- | --- | --- |
| Service | `services/<id>` | records | 22 services. Canonical page, one per service, audience is a filter not a page |
| Offering | `offerings/<id>` | records | 75. Belongs to one service. Has actions, eligibility text, cited articles |
| Article | `UIT-KA-*`, `knowledge/<slug>` | records | 243. Halo shape: issue, environment, cause, resolution. All imported drafts |
| Guided task | `tasks/<id>` | `journeys.json` | 8. Branches by audience or symptom; every step cites an article. Has search intents |
| Relationship | ontology predicates | `content/nexus` | Service to service (protected by, used to sign in to). Rendered as connected services |
| Page | `pages` | records | 57 sources, resources and prompts, migration-preserved |

`composeModel` produces per-service `offerings`, `visibleArticles`, `topics` (articles grouped by offering, each article once), `relations` and `journeys`; per-offering inherited topics; and global `topTasks`, `quickActions` and `support`.

## Routes

| Route | View | Purpose |
| --- | --- | --- |
| `/` | homeView | Intent search, quick actions, top tasks, Passport York spotlight, all services with audience filter |
| `/tasks/`, `/tasks/<id>/` | tasksView, taskView | Guided troubleshooting and procedures with audience branching and escalation |
| `/services/` | servicesView | Offering catalogue with text, service and audience filters (`?service=` deep link) |
| `/services/<id>/` | serviceView | Service workspace: tasks, offerings, grouped guidance, preserved source content, properties rail |
| `/offerings/<id>/` | offeringView | Action first, eligibility, use cases, guided tasks, scoped knowledge |
| `/knowledge/`, `/knowledge/<slug>/` | knowledgeView, articleView | Index and Halo-style reader with provenance |
| `/search/` | searchView + client | Best match plus grouped results, works without JavaScript via the form |
| `/help/` | helpView | Support channels with hours and the preserved contact page |
| Legacy UIT paths | redirect stubs | 57 redirects from the migration ledger, plus `redirects.json`, `_redirects` |

All prior canonical routes are preserved. `/tasks/` is new.

## Machine-readable projections

| File | Schema | Consumer |
| --- | --- | --- |
| `_data/search.json` | records with `type`, `intents`, `audiences`, `blocked` | Palette, search page, future grounded retrieval |
| `_data/services/<id>.json` | `york-service-digest` v1 | NEXUS, Halo service catalogue, assistants |
| `_data/articles/<id>.json` | article record | Quick view, Halo knowledge import |
| `_data/journeys.json` | `york-journeys` v1 | Assistants that need step-by-step guidance with citations |
| `_data/nexus.json` | `NEXUS-CORE` graph | Includes Journey entities, `HAS_JOURNEY` and `CITES` edges |
| `_data/knowledge-audit.json` | KCS audit | Editorial review queue |

## Client behaviour

`src/client.mjs` enhances server-rendered HTML; every capability has a no-JavaScript path (links to `/search/`, all branches rendered, all rows rendered).

- Command palette: Ctrl/Cmd+K (no single-key shortcut, WCAG 2.1.4), a modal `<dialog>`, arrow-key navigation, Escape to close, focus restored
- Instant results in every `[data-finder]`, lazily loading `search.json`
- Quick view: `[data-preview]` loads `_data/articles/<id>.json` into `#kb-dialog`, with a permanent link
- Audience filters persist for the session (`sessionStorage` key `uit-audience`)
- Task branch choice reveals one panel; without JavaScript all panels show

## Security

- CSP `default-src 'self'; script-src 'self'; style-src 'self'` and so on, served by `dev.mjs` and written to `_headers`. No inline scripts or styles except the JSON config block
- Imported HTML is sanitized at import with an allowlist; `validateArticle` rejects scripts, handlers and `javascript:` URLs
- No credentials, tokens or private DevKit resources in the repository

## Verification

| Command | Covers |
| --- | --- |
| `npm test` | 25 tests: data integrity, reader contract, ranking, guided task citations, view capabilities, shell safety |
| `npm run content:check` | Articles, ontology, journeys, services, page sources |
| `npm run build` | Full static output and counts |
| `py scripts/check-links.py` | Internal links across built pages |
| `node scripts/capture.mjs` | Desktop and mobile screenshots with overflow and console error report |

## Integration seams (not implemented)

Halo ITSM, NEXUS, live service status and AI answers are not connected. The JSON projections are the intended seams. Nothing in the UI claims a live integration.
