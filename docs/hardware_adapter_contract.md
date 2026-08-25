# DRIFT Hardware Integration Runbook

## Supported boundary

DRIFT is an **inspection ingestion and decision-support platform**, not a flight-control system. It must never arm, launch, navigate, or otherwise command an aircraft. A qualified operator remains responsible for flight planning, airspace compliance, arming, failsafes, payload safety, and the vendor ground-control station.

The supported reference architecture is:

```text
PX4 or ArduPilot flight controller
        │  serial / Ethernet, MAVLink
        ▼
Linux companion computer (Raspberry Pi, Jetson, or equivalent)
        │  bridge process: MAVSDK/MAVLink Router + camera uploader
        ▼
Authenticated HTTPS bridge endpoints in DRIFT
        │
        ├── telemetry → /api/drift/telemetry
        └── media     → /api/drift/evidence
```

The official [PX4 Companion Computers guide](https://docs.px4.io/main/en/companion_computer/) documents the companion-computer pattern, serial/Ethernet connectivity, MAVLink, MAVSDK, and MAVLink Router. This is the first hardware path to bench-test. DJI and other vendor ecosystems require a separate vendor-approved adapter; do not send undocumented vendor requests to production.

## Required configuration

Configure these values through the deployment secret manager, never in frontend code or source control:

| Variable | Purpose |
|---|---|
| `DRIFT_INGEST_TOKEN` | Shared bearer token used by the trusted bridge service for telemetry and evidence ingestion. Use a long random value and rotate it through a controlled release. |
| `DRIFT_HARDWARE_ENDPOINT` | HTTPS health endpoint for the organisation’s bridge service. DRIFT probes it only; it does not control the aircraft. |
| `ML_INFERENCE_URL` | HTTPS endpoint for the organisation’s computer-vision service. It is optional; the application remains usable with clearly labelled deterministic simulator/fallback inference. |
| `ML_INFERENCE_TOKEN` | Optional bearer token for the production CV service. |

## Telemetry ingress

The bridge must send an authenticated JSON request to the DRIFT deployment:

```bash
curl -X POST "$DRIFT_BASE_URL/api/drift/telemetry" \
  -H "Authorization: Bearer $DRIFT_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "missionId": 42,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "altitude": 34.2,
    "speedMps": 7.8,
    "batteryPercent": 84,
    "timestamp": 1787656160000
  }'
```

The server rejects missing fields, non-finite values, invalid geographic bounds, negative altitude/speed, battery values outside 0–100, invalid mission identifiers, and timestamps outside the allowed future-skew window. Accepted telemetry is persisted with UTC capture time and an audit event.

## Evidence ingress

The trusted bridge can send a base64-encoded photo or video after the mission exists:

```bash
curl -X POST "$DRIFT_BASE_URL/api/drift/evidence" \
  -H "Authorization: Bearer $DRIFT_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(node -e 'const fs=require(\"fs\"); const p=process.argv[1]; console.log(JSON.stringify({missionId:42,fileName:require(\"path\").basename(p),mimeType:\"image/jpeg\",mediaKind:\"photo\",latitude:28.6139,longitude:77.2090,base64:fs.readFileSync(p).toString(\"base64\")}))' ./frame.jpg)"
```

DRIFT stores the bytes in managed object storage and stores only the storage reference plus mission metadata in the database. The bridge must preserve the original capture file, timestamp, camera identifier, and mission association in its own operational record so the inspection chain of custody remains reconstructable.

## Production computer-vision contract

When `ML_INFERENCE_URL` is configured, a non-demo evidence inference request may send JSON containing `fileName`, `imageBase64`, `latitude`, and `longitude`. The service must return this exact shape:

```json
{
  "model": "inspection-yolo-v2",
  "label": "crack",
  "confidence": 0.91,
  "boundingBox": { "x": 10, "y": 20, "width": 30, "height": 25 }
}
```

`label` must be `pothole`, `crack`, or `structural`; confidence must be 0–1; bounding-box values are percentages from 0–100. DRIFT validates the response, recomputes ZeroError scoring server-side, and falls back safely if the service is unavailable or malformed. An ML result is advisory and never releases a work order without authorised human review.

## Bench-test sequence

1. Create a simulator mission and note its persisted mission identifier.
2. Keep the aircraft disarmed. Connect the companion computer to the flight controller over the vendor-supported serial or Ethernet link.
3. Run MAVLink Router or an approved MAVSDK bridge and expose only the bridge’s authenticated HTTPS service to DRIFT.
4. Send one valid telemetry request and confirm the mission telemetry list updates.
5. Send invalid latitude, missing battery, and future-skewed timestamps; confirm all are rejected.
6. Upload one real test image and confirm it appears in the Evidence Vault with mission coordinates and the original storage link.
7. If a production CV service is configured, send one non-demo image and confirm model name, bounding box, confidence, and source are shown in the review record.
8. Verify the health endpoint reports correctly when the bridge is stopped and restarted.
9. Only after organisational flight approval, airspace review, and vendor safety checks may the bridge observe a live mission. DRIFT still issues no flight commands.

## No-drone demonstration

The simulator creates a persisted mission, a reproducible New Delhi reference route, 12 telemetry points, three clearly labelled simulated findings, simulated annotation evidence, ZeroError scores, alerts, repair estimates, a report record, and audit events. The UI labels this data as simulator evidence; it must never be presented as a real inspection or used for maintenance release.

## Failure behavior

If `DRIFT_HARDWARE_ENDPOINT` is absent, the dashboard remains in **offline** status and simulator mode remains available. If the bridge is unreachable, the dashboard shows **retrying** with operator guidance. DRIFT does not silently fabricate live telemetry, does not arm or control aircraft, and does not interpret a health response as proof that a flight is safe.
