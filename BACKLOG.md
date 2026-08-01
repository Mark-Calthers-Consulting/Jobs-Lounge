# Frontend backlog

This file records intentionally deferred product and design work that should survive beyond the current development conversation.

## Candidate email campaigns

Status: deferred

- Implement actual job-alert delivery for candidates who enable `New vacancy alerts`; the current setting only persists their preference.
- Implement the career newsletter campaign for candidates who enable `Career newsletter`; the current setting only persists their preference.
- Before launch, define targeting and scheduling, use the durable email outbox for retries, add delivery telemetry, and provide a reliable unsubscribe path.

## Staff security centre

Status: deferred

- Add a server-side session registry with a device/session list and individual revocation.
- Add **Sign out all other sessions** with confirmation and security notification.
- Record successful and failed staff sign-ins with a defined retention policy and a privacy-safe activity view.
- Add TOTP multi-factor authentication, one-time recovery codes, MFA removal, and a secure recovery process.
- Require recent step-up authentication before sensitive actions such as staff role changes and organization configuration.
- Add Super-admin policies for mandatory staff MFA and staff session lifetimes.
- Expand immutable security audit events and mandatory security notifications for account and policy changes.

## Career Insights future enhancements

Status: deferred

- Add related-article discovery after the public listing and category strategy have enough content to support it.

## Personalised vacancy recommendations

Status: deferred

- Let candidates specify target roles or categories, preferred locations, work arrangements, and job types.
- Replace the current newest-unapplied-vacancies feed with deterministic recommendations based on those explicit preferences and suitable profile fields.
- Exclude vacancies the candidate has already applied to and provide a short, understandable reason for each recommendation.
- Add indexed, bounded recommendation queries with a useful recent-vacancies fallback when preferences are incomplete.
- Reuse the same preference model for future job-alert targeting without using sensitive personal information or opaque automated scoring.
