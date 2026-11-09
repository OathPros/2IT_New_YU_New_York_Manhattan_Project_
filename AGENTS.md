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
