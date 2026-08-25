"""Shared helpers and CSS for the DRIFT dashboard."""
import json
import os
import streamlit as st


BACKEND = os.getenv("DRIFT_BACKEND_URL", os.getenv("BACKEND_URL", "http://127.0.0.1:8000")).rstrip("/")


# ── Severity mappings (ops-center palette) ───────────────────────
SEV_COLOR   = {"L3": "#FF2D55", "L2": "#FF6B35", "L1": "#30D158"}
SEV_LABEL   = {"L3": "CRITICAL", "L2": "HIGH",   "L1": "LOW"}
SEV_BADGE   = {"L3": "hw-badge-critical", "L2": "hw-badge-high", "L1": "hw-badge-low"}
SEV_FOLIUM  = {"L3": "#FF2D55", "L2": "#FF6B35", "L1": "#30D158"}
SEV_RADIUS  = {"L3": 12, "L2": 10, "L1": 6}
SEV_OPACITY = {"L3": 0.9,  "L2": 0.85, "L1": 0.75}




# ── CSS injection ────────────────────────────────────────────────
def inject_css():
    """Inject the full DRIFT ops-center design system."""
    st.markdown("""<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500&display=swap');


    /* ── Global reset ──────────────────────────────────────── */
    html, body,
    [data-testid="stAppViewContainer"],
    [data-testid="stMain"],
    section.main,
    .stApp {
        background-color: #080C10 !important;
        color: #E6EDF3 !important;
        font-family: 'Inter', sans-serif !important;
    }
    .main .block-container {
        padding: 0.5rem 1.2rem 2rem !important;
        max-width: 100% !important;
        background-image:
            linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px);
        background-size: 40px 40px;
    }
    #MainMenu, footer                { display: none !important; }
    [data-testid="stHeader"]         { display: none !important; }
    [data-testid="stToolbar"]        { display: none !important; }
    [data-testid="stDecoration"]     { display: none !important; }
    .viewerBadge_container__1QSob   { display: none !important; }


    /* ── Sidebar ───────────────────────────────────────────── */
    [data-testid="stSidebar"] {
        background-color: #0D1117 !important;
        border-right: 1px solid #21262D !important;
    }
    [data-testid="stSidebar"] p,
    [data-testid="stSidebar"] label,
    [data-testid="stSidebar"] span,
    [data-testid="stSidebar"] .stMarkdown { color: #E6EDF3 !important; }


    [data-testid="stSidebar"] .stTextInput input {
        background: #161B22 !important;
        border: 1px solid #21262D !important;
        border-radius: 0 !important;
        color: #E6EDF3 !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
    }
    [data-testid="stSidebar"] .stTextInput input:focus {
        border-color: #00D9FF !important;
        box-shadow: 0 0 0 2px rgba(0,217,255,0.1) !important;
    }
    [data-testid="stSidebar"] .stMultiSelect [data-baseweb="select"] {
        background: #161B22 !important;
