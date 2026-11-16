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

### Automated deployment

After the cPanel application and SSH alias have been configured, deploy from the repository root with:

```sh
bash scripts/deploy-frontend.sh
```

The script builds the production frontend, creates the self-contained cPanel bundle, uploads it through the existing `jobsapi-cpanel` SSH alias, synchronizes it to `/home/cricle/jobslounge`, preserves remote environment files and Passenger state, and restarts the application. Its temporary archive is removed locally and remotely after deployment.

The remote alias and application directory can be overridden without editing the script:

```sh
FRONTEND_DEPLOY_REMOTE=my-cpanel \
FRONTEND_DEPLOY_DIR=/home/account/frontend-app \
bash scripts/deploy-frontend.sh
```

The build still uses `frontend/.env.production` and any environment variables supplied to the command. Remember that `NEXT_PUBLIC_*` values are compiled into the bundle; cPanel runtime variables cannot change those values without rebuilding.

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

Before restarting a manual upload, install the Apache protections from the
application directory (the automated deployment does this for you):

```sh
/opt/cpanel/ea-nodejs22/bin/node scripts/harden-cpanel.cjs "$PWD"
```

The installer prepends a managed security block to `.htaccess`, preserves cPanel's
existing directives, and saves the original once as
`.htaccess.jobslounge-before-security`. Subsequent runs update only the managed
block. Keep these files when synchronizing deployments.

The rules deny direct requests to runtime files, dependency manifests, private
directories, deployment archives, and dotfiles. Public assets, Next.js browser
chunks under `/_next/static/`, and normal application routes remain available.
They also remove `X-Powered-By` from both Apache response-header tables when
`mod_headers` is enabled. If Passenger still adds the header later, ask the host
to suppress it in the virtual-host configuration; do not put the server-only
`PassengerShowVersionInHeader` directive in `.htaccess`.

After deployment, verify `/package.json`, `/app.js`, `/server.js`,
`/DEPLOYMENT.txt`, `/.next/`, and `/node_modules/` return 403 or 404. Check the
homepage, a vacancy route, a JavaScript chunk, and the API gateway still work.
The API application has the same installer in its own `scripts` directory.
Its Apache document root is separate from its Node.js application directory;
install there too with `--document-root`. The backend deployment script does both
and accepts `BACKEND_DEPLOY_DOCUMENT_ROOT` if that hosting path changes.

Run the public smoke checks from the frontend repository after deployment:

```sh
node scripts/verify-cpanel-security.mjs
```

The verifier checks blocked runtime files, header removal on both domains,
homepage JavaScript, the logo, public pages, and API access directly and through
the frontend gateway. It makes only public GET requests and sends no emails or
registrations. Optional arguments override the frontend and API origins.

To undo a first installation that causes a hosting error, restore the saved
`.htaccess.jobslounge-before-security` over `.htaccess`. If no `.htaccess`
existed before installation, removing the newly created file restores the
previous configuration. Restoring it also removes the protection, so investigate
the hosting error before leaving that rollback in place.

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
