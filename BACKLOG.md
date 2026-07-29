# Frontend backlog

This file records intentionally deferred product and design work that should survive beyond the current development conversation.

## Footer redesign

Status: deferred

- Redesign the entire public footer rather than making isolated additions to the current three-column layout.
- Rework its spacing, hierarchy, responsiveness, branding, contact information, and social-link presentation as one coherent component.
- Reconsider where and how the administrator login is exposed. The current `Staff access` link is too visually prominent and should be integrated more discreetly into the redesigned footer.
- Preserve keyboard accessibility, visible focus states, sufficient contrast, and a usable mobile layout.
- Review the final design visually at mobile, tablet, and desktop widths before considering the task complete.

## Candidate email campaigns

Status: deferred

- Implement actual job-alert delivery for candidates who enable `New vacancy alerts`; the current setting only persists their preference.
- Implement the career newsletter campaign for candidates who enable `Career newsletter`; the current setting only persists their preference.
- Before launch, define targeting and scheduling, use the durable email outbox for retries, add delivery telemetry, and provide a reliable unsubscribe path.
