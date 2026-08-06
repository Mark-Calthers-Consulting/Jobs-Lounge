# Frontend backlog

This file records intentionally deferred product and design work that should survive beyond the current development conversation.

## Archive job status

Status: deferred

- Revisit the job lifecycle to introduce or refine **Archive** as a job status.

## Service monitoring and Super-admin operations

Status: deferred

- Configure an independent external uptime monitor for the public frontend, direct API liveness and readiness endpoints, the frontend-to-backend gateway, response latency, and TLS certificate expiry.
- Keep outage detection and alert delivery outside Jobs Lounge so monitoring remains available when the frontend, API, database, cPanel, or authentication flow is unavailable.
- Add a Super-admin-only **Operations** page for diagnosing reachable but degraded services rather than treating the page itself as the outage monitor.
- Add a curated authenticated operations API that reports safe summaries for API uptime and deployment version, MongoDB readiness, email-worker heartbeat, email outbox depth by state, recent delivery success/failure, recent backend error totals, response latency, and Cloudinary configuration/last successful upload.
- Do not expose the Prometheus `METRICS_TOKEN`, raw logs, recipient details, credentials, provider responses, or other secrets to the browser.
- Present clear **Operational**, **Degraded**, **Unavailable**, and **Unknown** states with last-checked timestamps, actionable explanations, accessible refresh behaviour, and explicit partial-failure handling.
- Add alerts for readiness failures, growing email retry queues, dead email records, stale worker heartbeats, elevated server-error rates, and certificate expiry; define alert channels, ownership, escalation, and acknowledgement expectations.
- Account for Passenger process suspension and multi-process metrics when designing heartbeats and interpreting process-local counters.

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

## Google candidate authentication

Status: deferred

- Add the official Google Identity Services **Continue with Google** button to candidate signup and login while retaining email/password authentication as a fallback.
- Verify Google ID tokens on the backend and store Google's stable subject identifier; do not store access or refresh tokens or request Gmail, Drive, or other unrelated scopes.
- Treat a Google email as verified only when the validated token includes the verified-email claim.
- Send new Google candidates through a short completion step for required information Google does not provide, particularly telephone, without creating placeholder profile data.
- Link existing candidate accounts only after verified-email and provider-identity checks, and prevent one Google identity from being linked to multiple accounts.
- Prevent candidate Google authentication from automatically linking, activating, or signing into staff accounts and pending staff invitations.
- Add unlinking and fallback-login safeguards so candidates cannot accidentally remove their only usable authentication method.
- Configure separate development and production web credentials/origins, update CSP for Google Identity Services, and add abuse-control, audit-redaction, accessibility, account-linking, and end-to-end authentication tests.
- Consider One Tap and Google Workspace-based staff SSO only after the standard candidate button flow is stable; staff accounts must remain Super-admin provisioned.
