# Public property-record story

A standalone, source-linked narrative at `public/family-property-story/index.html`. Open it locally with its CSS and JavaScript alongside it, or serve it through the existing application's static-file path. Adding these files does not mean a deployment has occurred.

The narrative starts with the 1978 trust naming Molly B. Ford, distinguishes thirteen investigated county parcel IDs, follows selected recorded transfers, and identifies current title/authority questions. It does not establish current ownership, individual inheritance, wrongdoing, tribal jurisdiction or permission to enter.

## Publication scope

Only narrative/code and selected official public-record links are included. No original scans, certificates, tax notices, private reports, residential-address directory, family conversations or personal access plans are bundled. Names used in the narrative come from the cited historical land instruments. No new authentication, database, API, backend, global navigation or shipping-page rewrite is introduced.

Registry links may require a guest session or book/page search. County parcel displays can lag recorded transfers. The evidence checkpoint is 7 November 2026; this page is not a live title/lien-monitoring service.

## Verify

Run from the repository root:

    python tests/family-property-story.test.py

Python's standard library and Node are sufficient. The test verifies the exact public-file allowlist, official external-link hosts, local fragments, record/parcel counts, absence of document embedding and automatic external resources, mobile-first CSS constraints and 28 simulated interaction assertions.

Real-browser responsive review was completed on 8 November 2026 in Chromium at 1180px, 834px and 390px CSS viewport widths. All six chapters had zero horizontal overflow. See [the QA report](QA-2026-11-08.md) for measured results, two corrected defects and coverage limits. Native Safari/touch and print rendering remain unverified. Existing application tests and typecheck remain governed by the repository's normal CI.

## Review status

Local static/privacy, simulated interaction and scoped real-browser responsive checks passed. The source is for review; it has not been merged or deployed. The public page is intentionally a narrower account than a detailed legal or family evidence packet. Original instruments and qualified legal review control.
