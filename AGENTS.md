# MCCLUSTER CONTROL PLANE — READ THIS FIRST

This repository (`mcclusterishere/Apex-tactical-corporation`) is a McCluster satellite.

Canonical law lives in `mcclusterishere/mccluster/AGENTS.md`. If this file and the control repo disagree, the control repo wins.

- Control repo: https://github.com/mcclusterishere/mccluster
- Cloudflare Worker: `mccluster`
- API: `https://api.mccluster.org`
- Data plane: Supabase `zmnhbrjyhxzhkxmhkexs`

**There is no Worker named `mccluster-core`. Do not create one.**

## Allowed here

- Apex product UI, brand, local presentation, and client-side product behavior.
- Calls to the canonical McCluster API and shared data plane.
- Local fixtures/tests that do not become a second production source of truth.

## Not allowed here

- A separate production auth stack, database, admin system, billing system, CRM, social scheduler, or server backend.
- Railway/Prisma/SQLite as an independent production data plane.
- A second Cloudflare Worker or a `mccluster-core` service.
- CI that deploys this repository as a standalone backend.

Historical backend code may remain temporarily for migration/reference, but its deployment path must stay disabled until that logic is ported into the canonical McCluster control plane.
