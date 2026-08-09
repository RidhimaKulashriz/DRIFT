# DRIFT BY RIDHIMA KULASHRI

DRIFT is an AI-powered drone infrastructure inspection platform for real-time defect detection, segmentation, anomaly analysis, GPS mapping, and automated reporting.

## Architecture

The platform includes a FastAPI backend, a Streamlit dashboard, WebSocket streaming clients, PostgreSQL/PostGIS persistence, and an edge-inference workflow designed for NVIDIA Jetson hardware. It supports simulated drone feeds for local development and testing.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The backend is available at `http://localhost:8000`. The dashboard can be started with:

```bash
streamlit run dashboard/app.py
```

For the database-backed setup, use:

```bash
docker compose up -d
```

## Repository layout

- `backend/`: API, inference, data processing, persistence, and report generation.
- `dashboard/`: Streamlit live inspection dashboard.
- `scripts/`: connection checks and simulated edge-device utilities.
- `tests/`: automated and integration tests.
- `data/`: demo input and generated inspection data.

## Project identity

This repository is maintained as **DRIFT BY RIDHIMA KULASHRI**. Source branding and contributor references from the imported project have been removed.
