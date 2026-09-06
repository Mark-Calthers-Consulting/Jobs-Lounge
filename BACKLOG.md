# Frontend backlog

This file records intentionally deferred product and design work that should survive beyond the current development conversation.

## Homepage hero imagery

Status: deferred

- Replace the current compressed, blurry hero image with a genuinely high-resolution alternative that preserves the strong professional, people-led composition.
- Source the replacement from a clearly licensed, completely free commercial-use library; do not use paid stock or imagery with uncertain reuse rights.
- Review shortlisted images at their original resolution before selection, then create responsive, web-optimized variants without visibly degrading the desktop hero.
- Revisit the surrounding hero layout and copy as part of the later homepage visual refinement rather than forcing a weaker temporary image.

## Homepage expansion

Status: deferred

- Define and add up to three further homepage sections once each has a clear content purpose and trustworthy source material.
- Do not publish empty placeholders, fabricated company endorsements, vanity statistics, or testimonials that have not been supplied and approved.
- Reassess the page rhythm after real traffic and analytics are available before deciding whether the additions should cover editorial guidance, candidate outcomes, employer context, or another verified need.

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

Status: category-based foundation implemented; richer criteria deferred

- Category interests, explainable matching, unapplied-vacancy exclusion, and recent-vacancy fallback are implemented.
- Let candidates additionally specify target roles, preferred locations, work arrangements, and job types.
- Extend deterministic recommendations to those explicit preferences and suitable non-sensitive profile fields.
- Reuse the same preference model for future job-alert targeting without using sensitive personal information or opaque automated scoring.

## Candidate acquisition attribution

Status: self-reported onboarding response implemented; aggregate reporting deferred

- The skippable questionnaire, controlled sources, conditional detail, versioned private storage, and Settings editor are implemented.
- Keep self-reported answers separate from any future automatically captured first-touch UTM/referrer attribution.
- Add privacy-safe aggregate reporting for Super-admins without exposing individual acquisition answers to routine recruiters or using them in hiring decisions.

## Candidate product onboarding

Status: coach marks deferred

- Add contextual coach marks only after the candidate dashboard, applications, profile, and vacancy interfaces are stable.
- Keep tours short, dismissible, keyboard accessible, and tied to genuine first-use tasks rather than replaying a generic product walkthrough.

## Consent-based talent pool

Status: deferred

- Allow registered jobseekers who have not applied for a vacancy to explicitly opt into recruiter discovery.
- Keep ordinary registered users outside the recruiter Candidates directory until they either submit an application or provide clear talent-pool consent.
- Capture the consent version and timestamp, provide an easy withdrawal control, and remove withdrawn profiles from recruiter discovery without deleting the candidate account.
- Define recruiter search, retention, access auditing, privacy notices, and any contact rules before enabling the talent pool.
- Keep talent-pool membership distinct from an application and never imply that a member applied for a particular vacancy.

## Google Analytics and Super-admin reporting

Status: deferred

- Add a production Google Analytics 4 property with separate development and production configuration so local and test traffic cannot pollute live reporting.
- Complete the Google-side reporting setup: confirm the production GA4 property and web data stream, create a dedicated Google Cloud project, enable the Google Analytics Data API, create a least-privilege service account, grant it read-only access to the GA4 property, and configure the property ID and service-account credentials only in the backend production environment.
- Load analytics only after the applicable consent decision, document the cookie/privacy behaviour, honour opt-out choices, and avoid collecting candidate contact details, document URLs, free-text application content, or other personally identifiable information.
- Track a bounded event taxonomy for vacancy discovery, filter usage, vacancy views, application starts and successful submissions, account creation, profile completion, saved vacancies, and Career Insights engagement.
- Exclude or clearly segment staff and automated traffic so admin activity does not distort candidate acquisition and conversion reporting.
- Preserve privacy-safe campaign attribution using UTM parameters and referrer categories, and align it with the planned self-reported **How did you hear about us?** data without attempting individual-level hiring analysis.
- Add a Super-admin-only **Analytics** page showing curated aggregate metrics such as users, sessions, acquisition sources, vacancy conversion funnels, top vacancies, application conversions, devices, locations at an appropriate aggregate level, and Career Insights performance.
- Retrieve reporting data through a backend-owned Google Analytics Data API integration; keep service-account credentials and provider responses off the frontend, apply bounded date ranges and dimensions, cache results, rate-limit requests, and return only the required aggregate contract.
- Provide comparison periods, explicit time-zone handling, last-updated timestamps, accessible charts/tables, loading and partial-failure states, and CSV export only if governed reporting requirements are later approved.
- Add CSP allowances, environment documentation, audit events for analytics access/configuration, secret-redaction tests, permission tests, event-contract tests, and production validation before enabling collection.

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
