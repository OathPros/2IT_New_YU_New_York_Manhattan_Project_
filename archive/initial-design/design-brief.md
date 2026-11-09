# UIT redesign concept

## Direction

Make yorku.ca/uit the shortest route from a technology need to an answer or action

The proposed homepage has three parts: a conversational input, direct actions, and a compact service index. Institutional stories, statistics, and organization information sit with About UIT and the CIO site rather than competing with support tasks

This is a proposed direction based on a review of the public homepage, audience directories, and selected service pages on 9 November 2026. It is not a complete content inventory or an approved York template

## One service one home

Audience is an attribute of a service offering, not the top level organizing principle. A shared page can expose different actions, eligibility, and guidance without maintaining duplicate service descriptions

| Current pattern | Proposed destination | Context within the page |
| --- | --- | --- |
| Student Email and Faculty & Staff Email | /uit/services/email/ | Undergraduate, graduate, employee, and faculty specific accounts |
| Student and employee Passport York pages | /uit/services/passport-york/ | Account type and recovery method |
| Student and employee Internet Access pages | /uit/services/connectivity/ | Campus Wi-Fi, visitor access, residence, and VPN |
| Student and employee Software & Apps pages | /uit/services/software/ | Eligibility, device ownership, software availability |
| Student and employee M365 pages | /uit/services/microsoft-365/ | Available apps, licensing, and role specific access |
| Student and employee Printing pages | /uit/services/printing/ | Campus, device, and printing service |
| Student and employee Storage pages | /uit/services/storage/ | Storage platform and eligibility |
| Student and employee learning technology routes | /uit/services/teaching-learning/ | Learner, instructor, and classroom tasks |
| Student and employee AI routes | One shared AI front door | Tool eligibility and the activity to complete |

These are proposed future URLs. The interactive concept uses hash routes and links to current official destinations

Keep service boundaries meaningful. Related offerings can share a landing page while retaining distinct IDs, eligibility, and owners. Shared content does not mean pretending every user receives the same product

## The experience

1. A person describes a need or chooses a direct action
2. The site resolves the task and asks only for missing context that changes the answer
3. The response presents a concise answer, an authoritative source, and the next action
4. Device or audience differences appear in place without restarting the journey
5. A person can browse or reach human support at any point

Never force someone to chat just to open a tool. Keep canonical service URLs, keyboard navigation, and a functional nonchat path

Store chosen context for the current session and make it easy to change. Do not infer access rights from a role selector. People with multiple roles must be able to choose the relevant account or offering

## Shared content and AI

Use one governed service record for each service, with structured offerings beneath it. Both service pages and the assistant read the same records

| Information | Proposed source of authority | Use |
| --- | --- | --- |
| Service identity, offerings, eligibility, actions, relationships | NEXUS if adopted as the service authority | Page rendering and action selection |
| Reviewed troubleshooting and procedural knowledge | Halo knowledge articles or the designated content owner | Grounded answers and guides |
| Incidents and planned maintenance | An approved live operational feed | Relevant interruption notice at the point of need |
| Requests and ticket state | Halo through authorized APIs | Submit and track requests with appropriate sign-in |
| UIT priorities, leadership, governance, and news | CIO website | Institutional information outside the support journey |

These are proposed integrations. None are connected in this concept

A minimal service record needs a permanent ID, canonical URL, name, plain language aliases, summary, owner, reviewed date, audience rules, offerings, action URLs, access requirements, related knowledge IDs, and provenance

For production, resolve service and task first, retrieve approved content with visibility checks, and generate only from that evidence. Show the source used. If the evidence is missing, contradictory, or out of date, clarify or route to support. Do not turn an unverified response into a confident instruction

Use deterministic actions for opening tools and forms. Keep sign-in and credential entry in official systems. Add request creation only through an explicit review and submission flow

## Page system

| Page or state | Required information |
| --- | --- |
| Home | Ask, direct actions, service index |
| Service | What it is, who can use it, primary action, concise help, support route |
| Task or guide | Prerequisites, actionable steps, relevant device variants, escalation |
| Answer | Answer, source, next action, necessary clarifying question |
| Get help | Relevant team, current channels and hours, optional user approved context handoff |
| About UIT | Link to CIO information and institutional content |

Use short titles, natural text wrapping, large hit targets, strong focus states, minimal decoration, and purposeful whitespace. No image tiles for routine tasks, competing search systems, homepage news feed, promotional statistics, or floating chat widget

This standalone concept uses a simplified typographic masthead. Production must integrate the approved York header, wordmark, footer, accessibility, language, analytics, and privacy requirements

## Implementation sequence

1. Inventory current URLs, search terms, support demand, analytics, and faculty specific service exceptions
2. Select priority tasks from actual demand and test the proposed service labels with students, employees, and people with multiple roles
3. Assign canonical service IDs and owners, merge duplicate content, and redirect each retired URL to the matching service or task
4. Launch the unified service pages and direct actions with accessible nonchat navigation
5. Connect grounded answers to the same content and validate role handling, sources, escalation, and access boundaries
6. Add live incident context and authenticated transactions after the underlying systems are ready

Measure completion, time to first useful action, steps to completion, failed searches, reformulations, correct support routing, answer quality, and accessibility task success. Establish baselines before setting numerical targets. Chat volume and page count are not success measures by themselves

## What the prototype demonstrates

- One shared Email page with undergraduate, graduate, and employee variants
- The same service renderer used in browsing and scripted conversation
- Role context remembered within the session
- Guided sign-in routing and a new phone Duo example
- Service filtering by names and task aliases
- Human support options and copying the latest question
- Stable links to individual concept services and browser Back support

The prototype has eight representative services. It does not reproduce the full UIT catalogue. Some actions deliberately lead to current service guidance rather than performing a transaction

Answers are scripted and matched with simple rules. This is not a live AI assistant. There is no live status feed, authentication, ticket creation, or automatic support transcript transfer. Copying the latest question is the only context handoff implemented

## Sources reviewed

- https://www.yorku.ca/uit/
- https://www.yorku.ca/uit/student-services/
- https://www.yorku.ca/uit/faculty-and-staff-services/
- https://www.yorku.ca/uit/student-services/email/
- https://www.yorku.ca/uit/faculty-and-staff-services/email/
- https://www.yorku.ca/uit/student-services/passport-york/
- https://www.yorku.ca/uit/faculty-and-staff-services/passport-york/
- https://www.yorku.ca/uit/student-services/internet-access/
- https://www.yorku.ca/uit/infosec/duo-two-factor-authentication/
- https://www.yorku.ca/uit/student-services/software-and-apps/
- https://www.yorku.ca/uit/faculty-and-staff-services/software-and-apps/
- https://www.yorku.ca/uit/contact/

Current pages are evidence for the concept, not a guarantee that every instruction on those pages is current. Operational content needs owner review during consolidation


## Verification

The static HTML audit and JavaScript syntax check passed. Browser checks covered the homepage at 320, 375, 768, 1024, 1280, and 1440 px iframe viewports, plus increased text spacing. All eight service views were checked at the narrowest width with increased text spacing. A long Duo heading was corrected and checked again

The Email variants, service filtering and empty results, password routing, new phone Duo flow, role context in a follow up, and support question handoff were exercised. No page generated JavaScript errors were observed; the browser extension emitted its own metadata warnings

Full screen reader testing, native browser zoom at 200 percent, authentication, live integrations, and complete link checking remain for production validation. The representative source links were reviewed through the public York pages


## Publication record

The concept is saved and tested locally. Hosted publication failed twice, so no working hosted URL is claimed

- Site: appgprj_6af1e905034881918f95a2989bcc9282
- Saved version: appgprj_6af1e905034881918f95a2989bcc9282~appgver_21b7159b96908191853fad966ae39a1d
- Initial deployment: appgdep_6af1ebd383388191ba38a74101e61b78
- Initial failure: Cloudflare API request failed with status 504
- Retry deployment: appgdep_6af1ec69aae08191a85490e9ef7819a3
- Retry failure: Failed to publish the built site

The standalone UIT_Redesign_Concept.html contains the same application HTML and JavaScript for opening in a browser
