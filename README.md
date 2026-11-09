# York UIT replacement

This repository is the source of truth for the replacement of yorku.ca/uit

## Scope

Service pages, guides, FAQs, policies, resources, software entries, and AI prompts are in scope. Posts and historical advisories are excluded

## Run the application

Use Node 22 or newer

```sh
npm run dev
```

Open http://localhost:3000

```sh
npm test
npm run content:check
npm run build
python scripts/check-links.py
```

No npm installation is required. Permanent service, article, and resource pages are generated as HTML. Search, audience filters, and accessible knowledge popups progressively enhance those pages

Set BASE_PATH=/uit for a build intended for the existing York path

## Content workflow

```sh
python -m pip install -r requirements.txt
python scripts/import-content.py
python scripts/structure-content.py
```

The importer reads the main UIT page, package, and prompt sitemaps and the CIO and Information Security page sitemaps, then follows in-scope page links. Source records preserve the original main page HTML as inert evidence, sanitized HTML, text, media references, and provenance

| Location | Purpose |
| --- | --- |
| src | Shared renderer, search, browser interactions, and styles |
| scripts | Import, structure, validate, build, and serve |
| content/sources | Captured source pages and failed URL records |
| content/generated | Shared services, article drafts, resources, prompts, migration ledger, and asset references |
| content/editorial-overrides.json | Deliberate editorial changes applied after import |
| docs | Migration contract and status |
| archive/initial-design | Preserved first design checkpoint |

## Knowledge articles

One record renders both the Halo style quick view and the permanent article page. Description contains Issue, Environment, and Cause when known. Resolution contains the reusable answer or steps. Local UIT article IDs are not claimed to be Halo IDs

Imported articles are marked not_validated. Review flags exclude potentially obsolete or insecure instructions from answer retrieval. Editorial overrides preserve source provenance and permanent URLs

## Real retrieval

The answer finder searches migrated content. It does not simulate an LLM. POST /api/answers returns relevant records with generated_answer: null. An AI provider and Halo integrations are not configured

## Cutover requirements

This is a working replacement codebase under development. It is not an approved production cutover. The live York website has not been changed

Resolve unavailable or protected sources, editorial validation, JavaScript only source widgets, live chat and transactional integrations, media preservation, and accessibility review before retiring the old site

Media and downloads currently retain authoritative source URLs. Their inventory is committed. Preserve those upload paths or mirror the files during cutover

```sh
node scripts/check-content.mjs --release
```

The release gate deliberately fails until content validation and source blockers are resolved

See [the migration contract](docs/MIGRATION.md) and [the migration status](docs/MIGRATION_STATUS.md)
