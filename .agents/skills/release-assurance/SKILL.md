---
name: release-assurance
description: Verify significant features, migrations, refactors or release candidates before merge or deployment.
---

# Procedure

Inspect acceptance criteria, diff and current test commands. Run appropriate build/lint/unit/integration tests. For UI, exercise representative journeys, responsive widths, keyboard and error states; use axe and Lighthouse where configured. For data, check IDs, relationships, migrations, privacy and authorization. Verify external links without sending live transactions; use approved test environments. Record command, result and evidence; distinguish not run from pass. Identify blockers, rollback and unresolved risks. Do not merge or deploy without authorization.
