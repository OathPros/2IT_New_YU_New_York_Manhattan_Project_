# York UIT replacement

## All service routes checkpoint

This development checkpoint contains all 20 canonical service pages and selected source-backed tasks. The full legacy migration and editorial validation are still in progress

Articles have accessible quick views and permanent URLs. The same record supplies both views. Student and employee guidance share a service page with audience filters

```sh
npm run dev
```

Open http://localhost:3000

```sh
npm run verify
```

Node 22 or newer and Python 3 are required. No npm installation or live crawl is needed to build this checkpoint

Use BASE_PATH=/uit for a build intended for the existing York path

## Content

- content/sources retains captured source evidence
- content/records retains article, service, resource, source ledger, and media records
- content/generated indexes the records
- content/editorial-overrides.json stores deliberate rewrites without changing permanent IDs or slugs

Imported articles are drafts, not validated Halo articles. One Outlook signature article demonstrates a specific issue statement, environment, and meaningful resolution link while preserving its source provenance

Search retrieves matching content. AI generation and Halo integrations are not configured

## Remaining work

All 20 service categories have native routes. The original Email and Passport York source capture remains intact; the other 18 service pages now include editorial service overviews and task articles based on publicly visible source pages. These are not a completed full-content migration. Remaining reference pages, deep FAQs, downloadable assets, historical URLs, integrations and protected material still require source-to-destination reconciliation and quality review

Posts and historical advisories are excluded. The live York website has not been changed
