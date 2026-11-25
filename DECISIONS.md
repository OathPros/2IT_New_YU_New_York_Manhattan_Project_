# Decisions

Record significant decisions with context so any agent or device can continue. Newest first.

## D-012 No text width caps, disclaimers or doubled dividers
- **Decision**: Remove every `max-width`/`ch` cap on text and all `text-wrap` balancing so text fills its container. Remove the knowledge honesty banner, draft cautions, reader state lines, the legacy contact section and "not live status" copy. Knowledge state stays as factual metadata in the article Source and review panel, and "Validated" appears only when true. Remove spacer and doubled rules. Lead `/knowledge/` with a large search field whose result count, group counts and jump links follow the query
- **Why**: User direction: text wrapping early, disclaimers and double spacers are unacceptable in this site and all future work
- **Consequence**: Project skills, standards, prompt, AGENTS.md and DESIGN.md now state these as hard rules. This supersedes the disclaimer parts of D-010

## D-011 Reviewer findings before commit
- **Decision**: Remove the `/` single-key shortcut and keep Ctrl/Cmd+K (WCAG 2.1.4). Drop `aria-expanded` from plain search inputs. Include `service_name` in article JSON so the quick view names its service. Give the palette input a visible focus indicator. Cite the Passport York service page for the maintenance window. Mark retitled articles `title_clarified_draft`
- **Why**: The independent reviewer found no blocking defects but identified these accessibility, provenance and metadata gaps
- **Consequence**: Added a test that service and offering names are escaped and that offering rows never nest links

## D-010 Corrections from the rendered critique
- **Decision**: Apply the design-director findings on slice 3. Quick actions move into the hero, repeated task lists become compact, and on mobile the primary action comes first. Legacy contact HTML is collapsed and disclaimed. Draft state appears in results and under reader titles. Sources are named by destination, and JSON digests are exposed as `<link rel="alternate">` instead of rail text
- **Why**: The critique found that honesty signals were hidden, accessibility gaps existed (WCAG 2.4.4 link purpose) and the home page repeated itself
- **Consequence**: Verified in `.devkit/artifacts/slice-4` with no overflow or console errors; interaction checks pass

## D-009 Search index built from the model
- **Decision**: `searchRecords(model, pages)` in `src/model.mjs` builds `_data/search.json`. Article summaries that only repeat the title are omitted
- **Why**: Tests can verify real ranking without a build, and assistants can reuse the same retrieval set
- **Consequence**: Ranking changes are covered by `tests/experience.test.mjs`

## D-008 Compact footer where a page has its own escalation
- **Decision**: Task, tasks, service, offering and help pages omit the footer help band
- **Why**: The help band repeated the on-page "Still stuck" or "Need a person" block and the full help page

## D-007 Preserved service text in disclosures
- **Decision**: "About this service" source blocks render as `<details>`, with the first open
- **Why**: Student, employee and everyone variants repeat each other. Content must be preserved but should not dominate the service workspace

## D-006 Presentation tests replaced with capability tests
- **Decision**: `home-services.test.mjs` and `offering-catalog.test.mjs` tested removed functions (`home`, `offerCard`, `offeringDetail`). They are replaced by `experience.test.mjs`
- **Kept**: Every data-integrity assertion (22 services, 75 offerings, descriptions, actions, cited articles, SharePoint and Outlook URLs, audience integrity)
- **Added**: Guided task citations, intent ranking, Passport York topic coverage of 33/33, catalogue filters, knowledge honesty and shell CSP safety

## D-005 Guided tasks are authored, citing content
- **Decision**: `content/journeys.json` defines 8 tasks. Steps summarise and must cite an existing article; procedures are not restated. `validateExperience` fails the build on a missing citation
- **Why**: The task-first experience needs explicit paths, but the brief forbids invented procedures

## D-004 Self-hosted, subset Plex WOFF2
- **Decision**: Replace the single 2MB TTF with 6 Latin-subset WOFF2 files, with OFL kept alongside
- **Why**: Weight contrast is central to the direction; the weight budget is now about 200KB total

## D-003 CSP enforced in dev and build
- **Decision**: `script-src 'self'; style-src 'self'`, with no inline styles or scripts except the JSON config. `dev.mjs` serves the same header as `_headers`
- **Why**: Catches violations locally rather than in hosting

## D-002 Selected visual direction
- **Decision**: A Editorial foundation, plus B's palette and rail in light, plus C's audience choice. See `.devkit/concepts/README.md`
- **Rejected**: Full dark UI (B) for poor long-form reading and print; rounded tile grids and centred text (C)

## D-001 Keep the Node static architecture
- **Decision**: No framework or bundler. Views are template functions; the client is a single progressive-enhancement module
- **Why**: The existing stack meets every requirement, keeps zero dependencies and stays portable to York hosting
- **Alternatives**: Astro or Eleventy would add dependencies without solving an actual problem here
