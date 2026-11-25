# York IT Service Experience

Profile: service-experience · DevKit v1.0.0 · Branch `redesign/devkit`

## Problem and intended outcomes

The current UIT replacement is a faithful content migration, but it is presented as a directory. It shows 75 offering cards, flat article lists and category pages. People arrive with a problem, such as "I cannot sign in", "I lost my phone" or "my account is expiring". They are expected to translate that into York's service taxonomy first.

Target outcome: a task-first digital service experience that unifies the following, all composed from one structured service model:

- service discovery
- offerings and actions
- eligibility
- contextual knowledge
- guided troubleshooting
- search
- support and escalation

Measurable improvements over the verified baseline:

- A person with a top task reaches the correct source-backed instruction in at most 2 decisions from the homepage. Passport York recovery, username, Duo lost device and Wi‑Fi are verified by browser task scenarios.
- Every Passport York article (33 after NEXUS ownership) is reachable from the Passport York experience. The baseline offering page exposed 2.
- "lost phone", "cannot sign in" and "connect to wifi" return the right journey first.
- The baseline is retained with no loss: 243 articles, 75 offerings, 22 services, 57 page sources, 57 redirects, ledger coverage and provenance.

## Users and priority journeys

| Audience | Priority journeys |
| --- | --- |
| Students | Cannot sign in, forgot Passport York password, find username, set up account, Duo lost device, connect to Wi‑Fi, account expiring after leaving |
| Faculty and staff | Same identity journeys with employee-specific methods (pypwreset, department administrator, in person), employee ID, sponsored guest accounts, lifecycle |
| Visitors | AirYorkGUEST and how to obtain help |
| Service owners and IT staff | Find an authoritative offering, see knowledge confidence and provenance, reuse the structured model (NEXUS, Halo ITSM) |

## Scope and non-goals

**Preserve**
- Canonical IDs, slugs, routes and redirects
- Source records, editorial overrides, the NEXUS ontology and ownership
- The migration ledger and validation honesty
- The Halo-style reader contract
- Quick views and permanent article URLs

**Replace**
- All presentation templates, the stylesheet and client interactions
- The homepage
- Offering, service, knowledge, search and help compositions

**Add**
- Guided task journeys (`content/journeys.json`) and the `/tasks/` routes
- A service-intelligence composition module
- Instant search with intent routing
- Per-service JSON for integration

**Non-goals**
- Live operational status
- Authentication
- Halo ITSM ticket creation
- An AI answer generation backend
- Deployment
- Posts and historical advisories, which are excluded by the scope override

## Constraints and sources

- Data authority: `content/records/**` (captured from yorku.ca/uit), `content/editorial-*.json` and `content/nexus/*`. Journeys only compose existing articles and offering actions. They do not author new procedures.
- Imported knowledge is `not_validated`. It must be labelled honestly everywhere it appears, including inside journeys.
- Stack: Node built-in static build and dev server, with no runtime dependencies. Playwright lives only in the gitignored `.cache/tools` for evidence capture.
- Accessibility: WCAG 2.2 AA, keyboard complete, reduced motion respected, and no clipping or truncation.
- Do not deploy, push or change yorku.ca without approval.

## Success measures

- `npm test`, `npm run content:check`, `npm run build` and `py scripts/check-links.py` pass.
- Desktop and mobile captures of every key template show no horizontal overflow and no console errors.
- Task scenarios pass in the browser (see `STATUS.md`).

## Open questions

- Who owns validation of imported knowledge? No reviewer or review date exists in source.
- Should live service status come from an authoritative feed? None exists today, so the UI only shows the documented fixed maintenance window.
- Should journeys eventually be authored in NEXUS rather than JSON?