# Validated Job Intake Rules

Every candidate must pass validation before entering jobs.json.

## Required gates
1. Live individual vacancy page.
2. Enrolled Nurse eligible.
3. No aged-care roles.
4. Perth/WA relevant to the candidate.
5. Full-time roles are rejected unless exceptional: graduate/transition, Royal Perth Hospital/RPBMLG pathway, theatre/perioperative, or another unusually strong early-career pathway.
6. Expired, removed, closed, or unavailable advertisements never remain in jobs.json.
7. Search/category pages, employer homepages, Work With Us pages, PDFs and generic job portals are evidence sources only, never application_url.
8. If no direct individual application URL can be verified, application_url must be null and the UI must not show Apply.
9. Deduplicate by employer + role + location and preserve the strongest canonical listing.
10. Ambiguous eligibility or lifecycle state requires human/AI review before activation.

## URL fields
- application_url: direct individual vacancy/application page only.
- employer_source_url: supporting employer/source page.
- discovery_source: where the vacancy was found.
- verified_live: true only after direct vacancy verification.
- verified_at: Australia/Perth verification date.
- rejection_reason: reason a candidate failed validation.

## Suitability order
first-EN likelihood > employment type > clinical/pathway value > distance > pay.

## Rejected log
Rejected/expired candidates go to rejected-jobs.json so they are not repeatedly rediscovered and re-added.
