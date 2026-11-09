# Migration contract

This repository will contain the UIT replacement application and its content. The original design is retained under archive/initial-design as a historical checkpoint

## Scope

Discover public content from the UIT WordPress sitemaps and linked UIT pages. Preserve service pages, procedures, FAQs, software packages, AI prompts, news, and advisories. Institutional CIO and security content retain their own content types rather than being forced into a knowledge template

Pages on other York websites and third party documentation remain referenced at their authoritative URLs. Downloads and media are recorded in the asset inventory. Failed or restricted fetches remain explicit migration blockers

## Content destinations

- Shared canonical service pages for service identity, eligibility, access, and support
- Atomic knowledge articles for specific tasks, questions, and troubleshooting resolutions
- Reference pages for policies, standards, institutional information, and long form resources
- Dated archives for historic news and service advisories
- Dedicated prompt entries for reusable AI prompts

## Knowledge article contract

Title reflects the requester's task or symptom. Description contains Issue, Environment, and Cause only when the source identifies a cause. Resolution holds the answer or ordered steps. Keep different environments separate when their resolutions differ. Link related articles instead of duplicating resolutions

Keep source URLs, source modified dates when supplied, capture timestamps, audience context, import confidence, and a record of editorial changes. Capture time is not a review date. Imported material starts not validated until reviewed through use or by an authorized contributor

The reader is inspired by Halo's knowledge article presentation. This repository does not impersonate a connected Halo installation, fabricate article IDs from Halo, or claim that feedback has been written to Halo

## Completion gate

Every discovered source URL must have either a captured record and destination, a deliberate documented redirect, or an explicit unresolved blocker. Content counts alone do not prove editorial quality. Source to destination coverage, link checks, functional browser checks, accessibility review, and content owner review are required before replacing the live site
