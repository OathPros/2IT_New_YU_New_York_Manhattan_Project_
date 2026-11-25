# UIT replacement development

GitHub repository OathPros/2IT_New_YU_New_York_Manhattan_Project_ is the source of truth for this project

## Product requirements

- Build a complete replacement for the public UIT website
- Maintain one canonical service page with audience specific offerings instead of duplicate student and employee service pages
- Keep common actions close to the homepage and make all content discoverable without chat
- Use shared structured content for pages, knowledge search, and future grounded AI answers
- Give knowledge articles a Halo style reader with Issue, Environment, optional Cause, and Resolution content, plus provenance and honest confidence state
- Support accessible article quick views and permanent article URLs
- Preserve all source information and maintain a source to destination migration ledger
- Never claim an imported article is validated without evidence of review
- Never invent a service owner, review date, operational status, resolution, or metric

## York style

- IBM Plex Sans where available
- Short clear titles with no punctuation
- No terminal punctuation on displayed text elements; preserve punctuation within an element
- No clipping, clamping, truncating, hidden overflow, or silently shortened text
- Let text wrap naturally and containers grow
- Never cap text width with max-width or ch measures and never use text-wrap balance or pretty; text fills its container
- Never show disclaimers, caveat banners or "not validated", "not live" or "pending" notes; confidence state lives in the provenance metadata only
- Never use divider lines as spacers and never place two rules together
- Lead the knowledge index with a large search field
- Use York red, charcoal, and clean neutral surfaces with restrained decoration
- Keep controls keyboard accessible and meet WCAG 2.2 AA

## Engineering

- Use Node built in APIs for the static build and development server
- Keep content source files separate from rendering code
- Sanitize imported HTML with an allowlist and preserve useful links, images, tables, and ordered steps
- Do not commit credentials, dependency caches, generated build output, or unrelated hosting identities
- Run npm test and npm run build before pushing
- Do not deploy to yorku.ca or enable public hosting without the user's instruction

## Current scope override

Posts and historical advisories are excluded. Do not crawl, import, render, or add their media to this project

## DevKit and project memory

This project uses DevKit v1.0.0 with the service-experience profile. Apply these in addition to the requirements above. Where they conflict, the project requirements in this file win

- Standards: `.devkit/STANDARDS.md` and profile: `.devkit/PROFILE.md`
- Prompts: `.devkit/prompts/start.md`, `quick.md`, `review.md` and `york-service-redesign.md`
- Skills: `.agents/skills/` (experience-architecture, frontend-design, service-architecture, visual-critic, release-assurance)
- Specialist agents: `.github/agents/` (architect, design-director, reviewer)

Read these before significant work and keep them current:

- `STATUS.md` for the current state, last verification and how to resume
- `DECISIONS.md` for numbered decisions, newest first
- `PROJECT.md` for goals, users, journeys and constraints
- `DESIGN.md` for the design system, references and critique outcomes
- `ARCHITECTURE.md` for the content model, build and integration seams

## Verification

```sh
npm test
npm run content:check
npm run build
py scripts/check-links.py
node scripts/capture.mjs --out .devkit/artifacts/<name> --routes "/,/tasks/forgot-password/"
```

- Review rendered screenshots, not just source, after visual changes. Captures and reference screenshots stay in the gitignored `.devkit/artifacts/`
- Playwright is resolved from the gitignored `.cache/tools`. Do not add it to `package.json`
- Guided tasks in `content/journeys.json` must cite existing articles and offerings. `content:check` enforces this
- Never mark knowledge as validated without recorded service-owner review
