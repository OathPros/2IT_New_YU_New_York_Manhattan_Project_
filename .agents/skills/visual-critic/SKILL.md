---
name: visual-critic
description: Independently review actual rendered user interfaces after substantial visual changes or before a design release.
---

# Procedure

Read DESIGN.md and acceptance criteria. Launch the local app, inspect real screenshots at representative desktop/mobile sizes, and exercise key states. Compare against references, not source code alone. Identify consequential defects with evidence (route, viewport, screenshot, observed behavior), severity, and precise correction. Consider composition, hierarchy, typography, originality, density, consistency, responsiveness, accessibility and task efficiency. Do not approve because the build succeeds. Report blockers separately from subjective improvements. Re-review fixes when warranted; do not assign arbitrary numeric scores or loop indefinitely. If screenshots or browser access are unavailable, explicitly mark visual review incomplete. Use a fresh context or separate model for high-stakes review.
