# Deploying the frontend with cPanel Application Manager

The frontend and backend remain two separate Node.js applications:

- The frontend runs the standalone Next.js server from this repository.
- The backend runs the existing Express API and MongoDB integration.
- Browser requests to `/api/backend/*` reach the frontend first and are forwarded to the backend through `API_ORIGIN`.

## 1. Prepare the production bundle

Use Node.js 22 and set the production values before building:

```sh
API_ORIGIN=https://your-backend-host.example.com \
NEXT_PUBLIC_API_ORIGIN=https://your-backend-host.example.com \
NEXT_PUBLIC_ORIGIN=https://jobslounge.markcalthers.com \
npm run build:cpanel
```

If Analytics is enabled, also provide `NEXT_PUBLIC_GA_ID`. Values beginning with `NEXT_PUBLIC_` are compiled into the browser bundle, so rebuild after changing them.

The command creates `cpanel-deploy`. It includes the traced production dependencies, public assets, Next.js static chunks, and a Passenger-compatible `app.js`. It intentionally contains no `.env` files.

## 2. Upload the application

1. Create an empty frontend application directory under the cPanel account home, for example `jobslounge-frontend`.
2. Upload `cpanel-deploy.tar.gz` and extract it inside that directory. The supplied archive places `app.js` directly at the application root.
3. Keep the frontend in its own directory. Do not upload it over the Express backend application.

The bundle is self-contained, so a production `npm install` is not required after every upload.

## 3. Register it in Application Manager

Create or edit the application with:

- **Domain:** `jobslounge.markcalthers.com`
- **Base application URL:** `/`
- **Application path:** the frontend directory relative to the account home
- **Environment:** Production
- **Node.js version:** 22
- **Startup file:** `app.js`

Add these server environment variables in cPanel:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `API_ORIGIN` | The HTTPS origin of the Express backend, without `/api` or a trailing slash |
| `NEXT_PUBLIC_API_ORIGIN` | The same Express origin, exposed to browser requests without `/api` |
| `NEXT_PUBLIC_ORIGIN` | `https://jobslounge.markcalthers.com` |
| `NEXT_PUBLIC_GA_ID` | The production GA measurement ID, if Analytics is enabled |

`API_ORIGIN` must be reachable from the cPanel server. It stays server-side and must not be renamed to a `NEXT_PUBLIC_*` variable.

## 4. Restart and verify

Restart the app from Application Manager. If a manual restart is needed from the application directory, update Passenger's restart marker:

```sh
mkdir -p tmp
touch tmp/restart.txt
```

Check all of the following before changing DNS or taking Netlify offline:

- `/` loads without a 500 or missing static assets.
- A public vacancy detail page renders directly after a hard refresh.
- Candidate sign-in and administrator sign-in work.
- `/api/backend/health/ready` returns the backend health response through the frontend domain.
- Authenticated candidate and administrator pages load after refresh.
- Images, fonts and browser console requests have no blocked-host or mixed-content errors.

If the app returns 503, inspect the application logs first. The common causes are an incorrect application path, a missing `app.js`, an unsupported Node version, or an unavailable `API_ORIGIN`.

## 5. Cut over safely

1. Validate the cPanel application before removing the Netlify site.
2. Point only the website record for `jobslounge.markcalthers.com` to cPanel. Preserve MX, SPF, DKIM and DMARC records used by email.
3. Recreate the temporary `mccjobslounge.markcalthers.com` redirect on cPanel before retiring the Netlify redirect.
4. Test the public site, authentication, API gateway and email links from an external connection.
5. Keep the previous deployment available briefly for rollback.

The existing `netlify.toml` remains in the repository during the transition because it currently owns the old-domain redirect.
