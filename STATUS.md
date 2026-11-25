# Status

Updated at the end of each working session. Read this first when resuming.

## Current state

- Design critique (D-010) applied and re-rendered

- Branch `redesign/devkit`, merged to main via PR #8 (`ae6fac7`) and deployed to GitHub Pages
- Full presentation rearchitecture implemented: home, tasks, services catalogue, service workspace, offerings, knowledge, article reader, search and palette, help, 404
- Content baseline preserved: 243 articles, 75 offerings, 22 services, 57 page sources, 57 redirects. All articles remain imported drafts (0 validated)
- Added: 8 guided tasks, a support model, service digests, journeys JSON, and Journey entities in the NEXUS graph

## Verification (last run)

| Check | Result |
| --- | --- |
| `npm test` | 26/26 pass |
| `npm run content:check` | Pass (243 articles, 8 guided tasks, 22 services, 57 page sources) |
| `npm run build` | Pass |
| `py scripts/check-links.py` | Pass: 8478 local links across 414 pages |
| Playwright capture | `slice-4` (10 routes) and `slice-5` (7 routes) at 1440 and 390: no overflow, no console or CSP errors |
| Independent review | No blocking defects; findings fixed (D-011). Axe, Lighthouse and screen reader testing not yet run |
| Interaction script | Palette (Ctrl+K, arrows, Enter, Esc), instant results, quick view and focus return, branch choice, audience filters, catalogue filters, `?service=`, skip link |

## How to resume

```sh
npm run dev                         # http://localhost:3000
npm test; npm run content:check; npm run build; py scripts/check-links.py
node scripts/capture.mjs --out .devkit/artifacts/<name> --routes "/,/tasks/forgot-password/"
```

Playwright is resolved from `.cache/tools` (gitignored). Install with `npm i --prefix .cache/tools playwright` and `npx --prefix .cache/tools playwright install chromium`.

## Known limitations

- No knowledge is validated. Service owners must review before any article can show as validated
- Guided tasks cover Passport York, Duo and Wi-Fi. Other services use their service workspace without authored tasks
- Halo, NEXUS, live status and AI answers are not integrated. The JSON projections are the seams
- Source title defects are preserved rather than rewritten, for example "Add or remove a LIST Owner s" and the duplicate LISTSERV FAQ. They need editorial review with the service owner
- Reference captures include cookie banners on some sites

## Next

- Author guided tasks for the next highest-volume services (email, Microsoft 365, printing)
- Editorial pass on duplicate student and employee article titles
- Service-owner review workflow to move articles to validated with evidence
