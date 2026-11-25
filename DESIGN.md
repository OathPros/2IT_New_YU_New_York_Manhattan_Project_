# Design direction — York IT Service Experience

Status: Implemented direction. Evidence lives in `.devkit/artifacts/` (gitignored screenshots) and `.devkit/concepts/`.

## Product character

- **Task first.** People arrive with a problem, not a service name. The homepage begins with "Start with what you need to do" and an intent search
- **Editorial calm.** Warm paper, charcoal ink, large Plex type and hairline rules. Hierarchy comes from typography and alignment, not boxes
- **Institutional confidence.** York red is used sparingly for action and emphasis. No gradients, glass, illustration or decorative icons
- **Honest.** Draft knowledge, schedules and support hours are stated plainly. Nothing implies a live integration or validation that does not exist
- **Fast to act.** Every page puts the real next action (sign in, reset, request, call) above explanation

## Reference study

Captured with Playwright on the actual sites (desktop 1440 and mobile 390) into `.devkit/artifacts/references/`. Screenshots of third-party sites are not committed.

| Reference | Borrowed | Not copied |
| --- | --- | --- |
| Anthropic | Warm off-white ground, large light display type against semibold, generous vertical rhythm | Illustration style, marketing hero scale |
| Linear | Command palette with grouped instant results, properties rail, mono metadata, density in lists | Dark theme, gradients, glow |
| IBM Design | Label column plus content grid, Plex weight contrast, hairline rules | Heavy blue, IBM component chrome |
| Apple Support | Explicit "which do you have" choice before instructions, obvious contact path | Rounded tile grids, centred long-form text, product photography |

Limitations: cookie and consent banners overlay parts of some captures; Apple Support regional pages vary. These were noted, not worked around with scripts that dismiss consent.

## Concept exploration

Three directions were generated from the real model and rendered for comparison (see `.devkit/concepts/README.md`):

- **A Editorial**: selected as the foundation
- **B Precision console**: dark; contributed the palette, the properties rail and needs tags, translated to light
- **C Guided support**: contributed the explicit audience choice; its rounded tile grid was rejected

## Design system

### Typography

- IBM Plex Sans, self-hosted and subset to Latin WOFF2: Light 300, Regular 400, Italic, Medium 500, SemiBold 600
- IBM Plex Mono 400 for labels, IDs and metadata (uppercase, tracked 0.08em)
- Display: `clamp()` headline in SemiBold with a Light second line (`IT help at York` / `Start with what you need to do`)
- Body 17px with a line height of 1.6. Headings use `text-wrap: balance` and paragraphs use `pretty`. No clamping or truncation anywhere

### Colour

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `--paper` | #f6f4ef | Page ground | |
| `--ink` | #191919 | Text, rules for emphasis | 16+:1 |
| `--ink-2` | #45433f | Secondary text | 8.98:1 on paper |
| `--ink-3` | #66635c | Labels, metadata | 5.45:1 on paper, 4.90:1 on paper-2 |
| `--red-ink` | #b3102b | Eyebrows, numbers, primary buttons | 6.31:1 on paper; white on it 6.94:1 |
| `--night` | #151515 | Spotlight band, footer | night-2 text 10.6:1 |
| `--draft` | #7a4b00 on #fbf0d9 | Imported draft state | 6.55:1 |
| `--ok` | #1d5e2a on #e4f0e5 | Validated state (none yet) | 6.66:1 |

### Layout

- 1360px maximum wrap with a fluid gutter of `clamp(20px, 4.5vw, 64px)`
- **Index grid**: a 3/12 mono label column and a 9/12 content column, separated by hairlines. It is the primary section pattern. The label is sticky on desktop and stacks above the content under 960px
- **Hero**: a 7/4 split, with the finder on the left and "Go straight to" quick actions on the right as a two-column list. Each action names its destination only when the name differs from the label
- **Workspace**: main column plus a 15–19rem properties rail (service, start here, eligibility, connected services, knowledge state, schedule). Under 960px the rail stacks and a compact "Start here" block moves to the top of the main column so the primary action comes first. JSON projections are exposed through `<link rel="alternate">` rather than shown in the interface
- Breakpoints at 1100, 960, 720 and 420. All collapsed tracks use `minmax(0,1fr)` so legacy content cannot force overflow

### Components

- **Finder**: an underlined input with a square ink submit. It hosts instant grouped results and is reused in the hero, the search page and the palette
- **Task rows**: number, title, summary, service and arrow. Hover shifts the arrow; there are no cards. The compact variant (no numbers, smaller titles) is used for secondary lists such as the spotlight and the offering preview of three
- **Choice**: square selectable options for "Which York account do you have", with `aria-pressed`. The selected option shows an ink border and a small red marker
- **Steps**: numbered, with mono "You need" tags, an action and a "Read the guide" quick view with the cited article's state
- **Knowledge rows**: title, audience and state. The knowledge index has a "Jump to" service list. Quick view opens a sheet dialog; the permanent URL is always present
- **Reader**: Halo structure (Issue, Environment, Cause, Resolution) and a provenance panel (state, captured, review, audience, sources, suggest an update). Unvalidated articles show "Imported draft · Not validated by a service owner" directly under the title. Sources are named by host and path, never "Source 1"
- **Disclosure**: preserved per-audience source text on service pages uses `<details>`, with the first open, so nothing is lost or repeated as a wall
- **Escalation**: "Still stuck" or "Need a person", with real channels from the contact page. Pages with their own escalation use a compact footer

### Motion

- Arrow nudges and colour transitions of 150–200ms with a custom ease
- Dialogs fade and rise. Cross-page view transitions are on when the browser supports them
- Everything is disabled under `prefers-reduced-motion`

## Critique and correction

A design-director pass over the rendered slice (`.devkit/artifacts/slice-3`) raised fifteen issues. The corrections, rendered and verified in `.devkit/artifacts/slice-4`, were:

- Legacy contact HTML on `/help/` is collapsed behind a disclosure with a note that the live chat it mentions is not available here
- Search and palette results show knowledge state, and the reader states draft status under the title
- Source links are named by destination (WCAG 2.4.4)
- On mobile the task primary action comes before the steps
- The home hero carries the quick actions, and the separate quick-action band was removed
- The spotlight uses a facts list, and repeated task lists became compact previews
- Single-task groups on `/tasks/` are merged into "Other services"
- Catalogue actions use ink links rather than red on every row, and the double rule was removed
- Relation labels sit outside links, the question heading weight was aligned, and the footer rule sits inside the wrap

## Key experiences

1. **I cannot sign in**: diagnose by symptom, then go straight to the right task, guide or contact
2. **Reset a forgotten password**: choose the account type, then see the available ways with what you need, a quick view of the source guide, an "I do not know my student number" fallback and escalation
3. **Passport York service**: tasks, connected service tasks (Duo lost phone, Wi-Fi), offerings with actions, 33 guides grouped into 4 topics with audience filtering, preserved source text, and a rail with schedule and knowledge state
4. **Search anywhere**: Ctrl+K or Cmd+K opens the palette. There is no single-character shortcut (WCAG 2.1.4). Natural phrases such as "lost phone" rank the guided task first; product names still rank their records

## Accessibility

- Skip link, landmarks and a single h1
- Visible 2px red focus rings
- Dialogs use native `<dialog>` with labelled titles and focus return
- Filters announce counts through `role="status"`
- Forced colours and print styles are provided
- Every capability works without JavaScript

## Quality bar

Evaluate actual screenshots: home, tasks, Passport York service and offering, knowledge index and article, search and help, each at 1440 and 390. Check for no horizontal overflow, no console or CSP errors, the primary action visible above the fold, and no card grids or pill clusters.
