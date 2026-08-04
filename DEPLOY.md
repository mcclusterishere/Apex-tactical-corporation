# Going live

The register is built to deploy to any container host. These are the exact steps
for Railway, which is the least-effort option that still gives a real domain and
a persistent disk. The whole thing is self-contained — self-hosted fonts, no CDN,
no outbound network at runtime — so the only moving parts are a disk and a handful
of environment variables.

The database is SQLite on a mounted volume. That is correct for a single office;
switch to Postgres later by changing the `datasource` provider in
`prisma/schema.prisma` and pointing `DATABASE_URL` at a Postgres service. Nothing
else changes.

## Railway, step by step

1. **New project → Deploy from GitHub repo.** Choose
   `mcclusterishere/apex-tactical-corporation`, branch
   `claude/apex-tactical-ledger-nxef56`. Railway detects Next.js and builds with
   Nixpacks; `railway.json` and `nixpacks.toml` in the repo drive the rest.

2. **Add a volume.** Attach a volume to the service, mount path **`/data`**. This
   is where the ledger and the evidence store live, and it is what makes the data
   survive a redeploy. Without it, every deploy starts empty.

3. **Set the variables** (service → Variables):

   | Variable | Value |
   |---|---|
   | `APEX_MASTER_KEY` | Generate with `openssl rand -base64 48`. **Back it up.** Losing it loses every sealed value. |
   | `DATABASE_URL` | `file:/data/ledger.db` |
   | `STORAGE_DIR` | `/data/storage` |
   | `NODE_ENV` | `production` |
   | `SEED_FOUNDER_PASSWORD` | A strong password you choose. This is the Sovereign's first sign-in password. |
   | `APEX_PUBLIC_ORIGIN` | Set after step 4 to the generated URL, e.g. `https://apex-kingdom.up.railway.app` |

4. **Generate a domain** (service → Settings → Networking → Generate Domain).
   Copy it into `APEX_PUBLIC_ORIGIN` and redeploy so certified extracts and
   credentials print the right verification address.

5. **Deploy.** The start command (`npm run start:railway`) creates the schema on
   the volume, runs the idempotent seed — which opens the ledger and records the
   founding instruments — and starts the server. The configuration preflight
   refuses to start if anything above is missing, and says which.

6. **First sign-in.** Go to the domain, sign in as `matthew@mccluster.org` with
   the `SEED_FOUNDER_PASSWORD` you set, and change the password immediately. Then
   enrol a second factor from *Your account*, and run the anchoring procedure from
   the ledger-chain page so the register's dates become provable.

## What it costs

Railway's usage-based plan runs a small app like this for a few dollars a month;
a single instance with a small volume is plenty for one office. The free trial
covers standing it up to look at.

## A word on the public deployment

Once it is on a public URL, the public routes — `/verify/...`,
`/credentials/verify`, the gazette — are reachable by anyone, which is the whole
point of them. Everything else is behind sign-in and clearance. Member data lives
in this database, so treat the master key and the founder password as what they
are, and put Cloudflare Access or Railway's own controls in front of it before it
holds anything real. See `docs/13-INFRASTRUCTURE-AND-PORTABILITY.md`.
