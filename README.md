# Jobs Lounge frontend

Next.js application for public vacancies, candidate accounts, applications, and the administration centre. Browser API requests use a same-origin gateway at `/api/backend/*`; Next.js forwards those requests to the separately deployed Express API.

## Requirements

- Node.js 20 LTS or later
- npm
- A running Jobs Lounge backend

## Local setup

```sh
npm ci
cp .env.example .env.development
npm run dev
```

Set `API_ORIGIN=http://localhost:5000` in `.env.development`, then open `http://localhost:3000`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `API_ORIGIN` | Yes | Server-only backend origin without `/api`. Used by rewrites and Server Components. |
| `NEXT_PUBLIC_ORIGIN` | Yes in production | Canonical frontend origin used for share links. |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics measurement ID. |

Never replace `API_ORIGIN` with a `NEXT_PUBLIC_*` variable; backend topology and credentials must remain server-side.

## Commands

```sh
npm run dev      # local development server
npm run lint     # ESLint and accessibility rules
npm run test:unit # Vitest component and utility tests
npm run build    # production compile, type-check, and route generation
npm run start    # run the compiled Next.js server
```

Treat unit tests, lint, and build as required pre-deployment checks.

## Route groups

- `/`, `/vacancies`, `/vacancies/[jobId]`, `/blog`, `/contact`: public pages
- `/auth`: candidate authentication
- `/dashboard/*`: authenticated candidate area
- `/admin-center/login`: administrator authentication
- `/accept-staff-invitation`: secure staff password creation
- `/admin-center/*`: role-protected staff area for Administrators, Recruiters, and Super administrators
- `/admin-center/blog/*`: Recruiter/Super-admin article management and Markdown editing
- `/api/backend/*`: same-origin proxy to the Express `/api/*` routes

Route protection is enforced in the dashboard/admin layouts and again by the backend authorization middleware. Frontend checks improve navigation but are not a security boundary.

## Architecture

- Next.js App Router provides server-rendered public pages and client-side dashboard workflows.
- TanStack Query owns remote server state and invalidation.
- React Hook Form/Zod provide form handling and shared client validation where applicable.
- Authentication uses the backend’s secure, HTTP-only cookie. Unsafe browser requests obtain and send a signed CSRF token through `csrfFetch`.
- `next.config.ts` defines the backend gateway, security headers, CSP, and private-page cache controls.
- Public Career Insights uses managed Cloudinary cover images with local category artwork as its legacy fallback.

Backend architecture, API contracts, deployment steps, and incident procedures live in the backend repository documentation.

Deferred frontend product and design work is tracked in [BACKLOG.md](./BACKLOG.md).

## Production deployment

1. Set `API_ORIGIN` to the cPanel API origin, for example `https://jobsapi.example.com`.
2. Set `NEXT_PUBLIC_ORIGIN` to the public frontend origin.
3. Run `npm ci`, `npm run lint`, and `npm run build`.
4. Deploy the build and start it with `npm run start` using the hosting platform’s Node process manager.
5. Confirm `/api/backend/health/ready` returns HTTP 200 through the frontend origin.

Do not point production at Render or another legacy API origin.
