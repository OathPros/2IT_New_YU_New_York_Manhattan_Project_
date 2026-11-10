# NEXUS ownership and KCS editorial audit

## Service identities
- Passport York is an institutional identity and account-lifecycle service
- 1Password is a separate credential vault service with student, employee, and Families offerings
- Duo provides a distinct multifactor authentication offering that protects Passport York
- Cybersecurity is the security and incident response domain, not a synonym for Duo
- Wi-Fi and VPN consume Passport York identity but are separate network services
- The canonical services list contains 22 services, including 1Password and Duo

## Knowledge publishing rules
- A KCS resolution must explain a specific action, deliver a useful direct answer, or point directly to authoritative York/vendor-maintained documentation
- A generic landing page, a dangling heading, or “Learn more” is not a resolution
- Imported source evidence is immutable. Editorial corrections live in content/editorial-overrides.json
- NEXUS ownership overrides are recorded in content/nexus/ownership.json, retaining permanent article IDs and routes
- The build emits _data/knowledge-audit.json and _data/nexus.json
- Articles marked needs_resolution are excluded from homepage service lists and normal search results; permanent links remain available with a content-review warning for editors
- A link and a draft are not validated content; source and service-owner validation remain required before production cutover

## External references
- York-specific workflows should use current York pages and authorized internal knowledge
- 1Password product steps should use support.1password.com documentation
- Other vendor links should use the vendor’s own maintained support documentation; generic marketing websites are insufficient
- Reference-only content should not be relabeled as a task-resolution article without a real issue and answer
