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

## Candidate acquisition attribution

Status: deferred

- Ask **How did you hear about us?** as a short, skippable onboarding step after account creation rather than adding friction to registration.
- Use controlled source options such as search, LinkedIn, other social media, friend or colleague, school or community, event, employer, the Mark Calthers network, and Other; include **Prefer not to say**.
- Show a bounded optional detail field only when it adds useful context, especially for Other, event, community, or referral responses.
- Store the self-reported source, optional detail, response timestamp, and question version separately from automatically captured first-touch UTM/referrer attribution.
- Avoid repeatedly prompting candidates who answer, skip, or decline, while providing a later Settings option to update their response.
- Add privacy-safe aggregate reporting for Super-admins without exposing individual acquisition answers to routine recruiters or using them in hiring decisions.
