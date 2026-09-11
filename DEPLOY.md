# Deployment status

**Standalone backend deployment is disabled.**

Apex is a satellite of the McCluster control plane. Production auth, data, privileged server logic, billing, and integrations belong behind the canonical `mccluster` Worker at `https://api.mccluster.org` and the shared McCluster Supabase project.

The previous Railway + Prisma + SQLite deployment instructions are historical only. Do not recreate that stack and do not deploy this repository as an independent backend.

## Current rule

- Product/UI work may continue in this repository.
- Local fixtures and tests may use local state where needed for development.
- Production server/data logic must be migrated into `mcclusterishere/mccluster` before it is enabled.
- Do not set `DATABASE_URL`, `APEX_MASTER_KEY`, or a founder seed password on a public deployment of this satellite.
- Do not add a Railway, Render, Fly.io, Vercel server, or second Cloudflare Worker to replace the retired deployment path.

If a feature currently depends on the historical Prisma/SQLite server, treat that feature as pending migration rather than standing up a second production backend.
