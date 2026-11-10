# York UIT replacement

## Email and Passport York checkpoint

This development checkpoint contains the homepage, two shared services, 160 source-backed article drafts, the contact resource, and 28 captured source pages

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

This is the first verified development checkpoint, not the finished UIT replacement. Other services, resources, and prompts remain in the recovered working copy and have not been included in this branch

Posts and historical advisories are excluded

The password shortcut opens the migrated Passport York service. The Duo shortcut continues to use the current York page

See docs/MIGRATION_STATUS.md for the checkpoint and remaining work. The live York website has not been changed
