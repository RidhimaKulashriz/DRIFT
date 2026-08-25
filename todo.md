# Project TODO

- [x] Define DRIFT domain schema for assets, missions, telemetry, defects, severity history, repair estimates, reviews, reports, audit events, and evidence metadata.
- [x] Apply database migration and add typed backend query helpers for the DRIFT data model.
- [x] Add secure S3-backed evidence upload and metadata persistence for photos, video clips, annotated outputs, and reports.
- [x] Implement a configurable drone hardware adapter with health, retry, safe fallback, and documented test endpoints.
- [x] Implement a reliable simulator that creates virtual missions, telemetry, evidence, detections, alerts, map positions, repair estimates, and reports without physical hardware.
- [x] Implement the ML inference adapter for pothole, crack, and structural-defect results with annotations, labels, confidence, and explainable severity inputs.
- [x] Implement AI decision support for ZeroError prioritization and engineering-ready report narratives with clear manual-review fallback.
- [x] Build tRPC procedures for mission operations, asset management, map filtering, evidence review, alerts, reports, role workspaces, and audit history.
- [x] Build the tactile industrial dashboard with live defect map, maintenance queue, mission monitoring, alerts, evidence, and reports.
- [x] Build dedicated administrator, engineer, and citizen views with appropriate actions and manual override controls.
- [x] Add upload/playback flows, validation states, error handling, and filtering by asset, mission, defect type, severity, status, and review state.
- [x] Write Vitest coverage for core scoring, simulator, hardware fallback, review override, and tRPC operations.
- [x] Write GitHub-ready setup documentation, environment-variable guidance, integration-test guidance, and production deployment documentation.
- [x] Verify responsive UI, backend flows, storage behavior, and demo-mode mission lifecycle in the browser.
- [x] Save a project checkpoint and provide publish guidance for the verified deployment.
- [x] Verify the exact DRIFT repository link embedded in the PDF and raise a pull request with the completed, verified DRIFT platform.
- [x] Use the GitHub browser upload flow on the DRIFT feature branch before opening the pull request.
- [x] Add endpoint health-check and retry behavior for the configured drone hardware adapter, with documented success and failure tests.
- [x] Persist simulator evidence and alert records, then surface alerts in the operations dashboard.
- [x] Add backend APIs for asset lifecycle, alert actions, filtered map queries, report retrieval, and audit-history retrieval.
- [x] Enforce administrator, engineer, and citizen role permissions server-side and expose distinct role-focused workspaces.
- [x] Add UI filters for asset, mission, defect type, status, and review state, and verify evidence storage persistence through the completed simulator lifecycle.
- [x] Extend Vitest coverage for simulator lifecycle, review override, hardware retry, and tRPC mission, evidence, report, and alert operations.
- [x] Add complete frontend, backend, and ML-adapter deployment documentation and a tracked environment-template document without committing secrets.
- [x] Document request-triggered hardware retry behavior and add success-path health-probe coverage.
- [x] Complete asset update and deletion APIs and add a dedicated filtered map-data query.
- [x] Add explicit administrator, engineer, and citizen application roles with server-authorized workspace access.
- [x] Verify persisted simulator-evidence retrieval in the Evidence Vault after a clean simulator run while retaining authenticated access for original uploads.
- [x] Add automated coverage for simulator creation, evidence-listing, report retrieval, alert listing, map-data retrieval, review override, and hardware retry behavior.
- [x] Bind frontend workspace controls and permissions to authenticated backend role data instead of local-only role state.
- [x] Add and verify distinct administrator, engineer, and citizen access flows with backend authorization coverage.
- [x] Add protected-route tests proving citizen and engineer restrictions for administrator actions and citizen review restrictions.
- [x] Browser-verify the administrator, engineer, and citizen workspace presentations, noting that authenticated deployment roles use the same backend permission matrix.
- [x] Upload/extract the actual DRIFT source files into the `feat/drift-platform` branch so the pull request contains reviewable code, docs, config, and workflows instead of only `drift-source.zip`.
- [x] Re-verify the DRIFT pull-request diff shows the expected source tree and key files before marking repository delivery complete.

თხოვ

# Industry-readiness hardening pass

- [x] Reconcile every PDF requirement against the current source and document any remaining gaps.
- [x] Remove immature placeholder behavior, unsafe claims, and incomplete operational states from the product surface.
- [ ] Harden authentication, role authorization, tenant/data boundaries, input validation, rate limits, audit trail, and error handling.
- [ ] Make asset, mission, telemetry, defect, evidence, alert, review, estimate, and report lifecycles complete and consistent.
- [x] Implement a concrete hardware integration contract for a supported drone/flight-controller path, including telemetry, GPS, media, health, retry, and safe fallback.
- [x] Add real geospatial map tiles and coordinate-aware evidence presentation with documented provider configuration and licensing requirements.
- [x] Provide a real-image ingestion path and a clearly labeled simulator dataset with reproducible coordinates and media provenance.
- [x] Make ML inference pluggable between the built-in adapter and a configured production CV service, with model/version/confidence/annotation provenance.
- [x] Make AI decision support structured, explainable, reviewable, and fail-safe when the AI service is unavailable.
- [x] Complete administrator, engineer, and citizen workflows with server-authorized actions and audit-ready review overrides.
- [x] Add end-to-end integration tests for hardware ingestion, real-map coordinates, ML/AI fallback, uploads, reports, and role restrictions.
- [ ] Re-verify production build, deployment configuration, security boundaries, and browser flows; update the correct DRIFT pull request with reviewable source.

- [x] Document DRIFT’s actual map provider setup and licensing requirements and add a coordinate-aware evidence map/review surface.
- [x] Update the inference API and evidence UI to send actual image data to the production CV adapter and persist model/source/confidence/annotation provenance with reviewable records.

- [x] Replace the nonfunctional playback/evidence placeholder surfaces with real evidence playback/review bound to stored evidence records, or clearly mark/remove unfinished actions from the UI.
- [x] Bind evidence review metadata to actual evidence fields such as capture time, camera, source, and media URL instead of hardcoded or telemetry-substituted values.
- [x] Persist and expose simulator evidence provenance metadata including reference URL, license/author, and generated-versus-reference classification for all simulator media.

- [x] Surface evidence source in the review panel alongside capture time, camera, and media details, with explicit unknown labels.
- [x] Render persisted simulator provenance in the Evidence Vault, including reference URL, license/author, and generated-versus-reference classification.
- [x] Add automated or browser verification notes proving evidence metadata and provenance are returned and displayed end to end.

- [x] Browser-verify a populated Evidence Vault session and confirm source, provenance classification, license/author, and reference URL are visibly rendered.
- [x] Add automated coverage for evidence records carrying source and provenance, proving the backend query result contract returns those fields to the UI layer.

- [x] Add route-level integration tests for `/api/drift/telemetry` and `/api/drift/evidence`, covering authentication, validation, persistence, and error paths.
- [x] Add an integration verification for upload flow proving stored evidence, inference provenance, and downstream defect/report visibility.
- [x] Add explicit automated coverage or verification notes for AI decision-support fallback and real-map coordinate rendering.

- [ ] Upload the remaining local source directories and files to GitHub and reconcile the exact local-versus-remote inventory.
- [x] Add route-level tests covering successful persistence and returned error paths for both telemetry and evidence ingress.
- [x] Add automated route-level error assertions for unauthorized and invalid telemetry/evidence ingress requests.
- [x] Run and document a true upload-to-evidence-to-defect/report verification using a real uploaded image payload.
- [x] Re-run the latest expanded-scope end-to-end verification after the current local changes.
- [x] Fix HTTP evidence validation to accept safe image/video data-URI prefixes while validating the encoded payload.
- [x] Verify report generation and visibility for the real uploaded image’s persisted defect flow.
- [x] Implement an application report-generation procedure for uploaded evidence and verify its returned content.
- [x] Re-run browser verification after the latest expanded-scope UI and bridge changes.
- [ ] Document detailed browser verification for domain filters, capture zones, quality/coverage, correlation, and report visibility.
- [ ] Browser-verify expanded infrastructure domain filtering and confirm filtered results in the UI.
- [ ] Browser-verify capture-zone, quality/coverage, and quality-gate metadata in Evidence Vault/review UI.
- [ ] Browser-verify correlation review and generated report visibility/sign-off state for the real uploaded image.
- [x] Generate and configure a secure DRIFT_INGEST_TOKEN for authenticated bridge verification.
- [x] Complete a security and lifecycle audit of tenant boundaries, authorization, validation, rate limits, and report/evidence state transitions.
- [ ] Synchronize the latest expanded local source to the DRIFT GitHub branch and verify the correct PR diff.

# Vercel frontend / Render backend split

- [x] Audit frontend API-base, OAuth callback, cookie/CORS, storage URL, map proxy, and backend-ingress assumptions for split hosting.
- [x] Fix split-host OAuth nonce/state handling and redirect to a configured Vercel frontend origin after backend session creation.
- [x] Add regression coverage for the cross-origin OAuth start/callback path.
- [x] Add Vercel frontend deployment configuration and documented Render API URL environment variable.
- [x] Add a Vercel-specific deployment artifact and verify the frontend build contract.
- [ ] Configure and validate backend CORS/origin handling for the deployed Vercel frontend.
- [x] Add automated CORS tests for allowed/rejected origins, preflight, credentials, and headers.
- [x] Validate the split deployment artifact and document required external provider secrets.
- [ ] Validate the built Vercel artifact against live Render backend URLs after required external secrets are configured.
- [ ] Run and document split-host verification for login, tRPC, storage, and bridge routes against deployed Vercel and Render URLs.

# External hosting preparation

- [ ] Create the Render free Node web service from the DRIFT repository with the validated build/start configuration.
- [x] Configure required Render environment variables or record the exact missing-secret blocker.
- [ ] Verify the deployed Render URL, frontend, backend health, database persistence, AI/ML fallback, storage, and bridge authentication.

- [x] Audit Vercel/Render compatibility for the current full-stack server, database, storage, auth, ML, AI, and drone-ingestion boundaries.
- [x] Add portable deployment configuration and environment documentation without committing secrets.
- [x] Validate the portable production artifact and record external-service prerequisites and limitations.

# Deployment release gate

- [x] Audit production environment variables and identify mandatory live-service configuration versus safe fallback mode.
- [x] Run frontend, backend, database, ML, AI, storage, and authenticated hardware-ingress release checks.
- [x] Document release-blocking configuration issues and save a deployment-prepared checkpoint.
- [ ] Publish through the Management UI after the validated checkpoint is ready.
- [x] Add explicit AI decision-support fallback test coverage when the AI service is unavailable.
- [ ] Re-verify the final PR/merge diff against the local file inventory and record the exact key files present.

# Expanded public-infrastructure inspection scope

- [x] Extend the defect taxonomy and inspection contracts for roads, bridges, railways, buildings, utilities, drainage, pavement, signage, barriers, lighting, and under-structure findings.
- [x] Add capture-zone and access metadata for above-deck, under-bridge, tunnel, confined, low-light, and oblique drone inspection media.
- [x] Add calibrated confidence, coverage completeness, image-quality gates, model/version provenance, and human-review requirements to every AI finding.
- [x] Add multi-pass evidence correlation so findings can be linked across images, video frames, GPS traces, assets, and missions without claiming universal detection.
- [x] Add report-generation coverage for domain-specific findings, evidence references, uncertainty, recommended next inspection, and engineer sign-off.
- [x] Add expanded hardware integration documentation for PX4/MAVLink telemetry, camera metadata, RTSP/media bridges, geofencing, lost-link behavior, and operator-controlled flight safety.
- [x] Add tests and browser verification for multi-domain filtering, capture zones, confidence/coverage states, evidence correlation, and report generation.
- [ ] Update the correct GitHub pull request from feat/drift-platform into main after the expanded scope is validated.
- [x] Fix protected telemetry ingress validation to pass missionId and speedMps into the adapter, then rerun route-level persistence tests.

# External-only hosting constraint

- [ ] Do not publish or deploy DRIFT through Manus; use only Vercel for the frontend and Render for the backend/API.
- [ ] Keep the final handoff focused on external Vercel/Render URLs, provider secrets, and live verification status.
