# CivicMind
### AI-Powered Inclusive City Intelligence Platform

CivicMind is a production-style full-stack civic-tech platform that empowers cities to understand urban infrastructure hazards and prioritize repairs based on **HUMAN IMPACT** rather than complaint volume or political noise.

> *"Cities should not prioritize infrastructure only by what is broken. They should prioritize by how much that problem affects people."*

---

## 🏛️ Core Product & Intelligence Architecture

CivicMind models the complete municipal infrastructure repair loop:

```
Citizen
   ↓
Report + Evidence + Location
   ↓
AI Detection Layer [Pluggable YOLO Contract]
   ↓
Infrastructure Understanding
   ↓
Human Impact Engine (0–100 Normalized)
   ↓
Impact Forecast (Ripple Projections)
   ↓
Priority Engine (CRITICAL / HIGH / MEDIUM / LOW)
   ↓
Authority Dashboard (Smart Queue & Hotspot Map)
   ↓
What-If Repair Simulator
   ↓
Municipal Work Order Generator
   ↓
Repair Resolution
```

---

## ⚡ Newly Implemented Intelligence Layer

### 1. Human Impact Engine (`backend/app/services/impact_engine.py`)
- Computes deterministic, normalized **0–100 Human Impact Scores**:
  $$\text{Human Impact Score} = \text{Severity (0-30)} + \text{Pedestrian Impact (0-25)} + \text{Accessibility Impact (0-25)} + \text{Location Context (0-15)} + \text{History (0-10)}$$
- Priority Tiers:
  - **CRITICAL** (80–100): Immediate physical danger, wheelchair artery blocked, hospital/clinic route.
  - **HIGH** (60–79): Severe structural wear, school zone crossing, heavy pedestrian detour.
  - **MEDIUM** (30–59): Moderate hazard, sanitation overflow.
  - **LOW** (0–29): Minor cosmetic wear.
- Provides explainable algorithmic rationales for every score.

### 2. Clean AI / YOLO Integration Contract (`backend/app/services/ai/interface.py`)
- Standardized data contract:
  ```json
  {
    "category": "ACCESSIBILITY",
    "confidence": 0.92,
    "severity": "HIGH",
    "bounding_boxes": [],
    "accessibility_features": []
  }
  ```
- Ready for YOLOv8/v11 or DETR weights without rewriting authentication, database, or API logic.

### 3. Accessibility Intelligence
- Structured tracking of mobility impediments:
  - Stairs (No Ramp Alternate)
  - Broken / Missing Ramp
  - Broken Elevator
  - Narrow Passage (<36")
  - Blocked Sidewalk
  - Physical Obstacle
  - Inaccessible Entrance
  - Wheelchair Route Barrier
- Accessibility issues immediately receive high-priority weighting.

### 4. Impact Forecast (Temporal Ripple Model)
- Estimates the progression of unresolved hazards across:
  - **Immediate (Days 1–7)**: Localized blockage and route detour for seniors and wheelchairs.
  - **Medium-Term (Days 8–30)**: Diverted pedestrian footfall and defect perimeter expansion (+20-35%).
  - **Long-Term (Day 30+)**: Sub-base erosion, quadrupled repair cost, and trip-and-fall liability.
- Displays estimated daily public exposure (e.g. 1,200–3,500 daily commuters).

### 5. What-If Repair Simulator
- Interactive UI simulation modal demonstrating:
  - **Before**: Current impact score & priority (e.g. 93 / CRITICAL)
  - **After**: Simulated post-repair score (e.g. 14 / LOW)
  - **Civic Relief Delta**: Quantitative point reduction (e.g. -79 points, 84.9% improvement) and restoration of universal mobility.

### 6. Smart Prioritization & Explainable Queue
- Authority dashboard sortable by:
  - **Human Impact Score (Default & Primary)**
  - Priority Tier
  - Defect Severity
  - Recency
- Every row presents bulleted algorithmic reasons explaining why the case was prioritized.

### 7. Map Intelligence (Leaflet + OpenStreetMap)
- Interactive spatial GIS map rendered with priority markers:
  - Pulsing red/rose pins for Critical (&ge; 80) incidents
  - 0–100 score displayed directly inside the pin emblem
  - Rich popups exposing title, category, severity, priority, accessibility tags, and recurrence badges.

### 8. Infrastructure Memory (Spatial Recurrence Clustering)
- Detects repeated community reports within 120m proximity.
- Boosts the historical impact factor (+4 to +10 points) and flags the report with a **"REPEATED"** badge.

### 9. Municipal Work Order Generator
- Produces formal municipal dispatch orders (`WO-YYYY-XXXXX`):
  - Department Assignment (e.g., Office of Disability Access & Universal Mobility - ADA Division)
  - Target SLA (CRITICAL: 24h, HIGH: 72h, MEDIUM: 7 days)
  - Location coordinates and summary
  - Recommended corrective engineering actions
  - Required safety rigging and equipment list
  - Printable and copyable formatted view.

### 10. Evidence Confidence Signals
- Evaluates evidence quality signals:
  - Camera capture vs existing file upload
  - Corroborated GPS telemetry
  - SHA-256 file hashing
  - Duplicate image detection across the database
  - Rates quality as **HIGH**, **MEDIUM**, or **LOW** without directly skewing the Human Impact score.

### 11. Demo Mode
- Clearly marks benchmark test records with a `DEMO` badge.
- Authority filter allows switching between "All Records", "Live Citizen Submissions", and "Demo Benchmark Cases".

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router DOM v7, Axios, Leaflet, Recharts, PWA support.
- **Backend**: Python 3.14 compatible, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 (`from_attributes = True`), `pwdlib[argon2]` (no passlib/bcrypt), JWT (`python-jose`).
- **Database**: SQLite (automatic column migration, PostgreSQL/PostGIS compatible).

---

## 🚀 How to Run

### Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API: `http://localhost:8000` | Swagger: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: `http://localhost:5173`

### Production Build
```bash
cd frontend
npm run build
```

---

## 🔑 Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Citizen Demo** | `citizen@civicmind.org` | `Citizen123!` | Report hazards, track personal cases |
| **Municipal Authority** | `authority@civicmind.org` | `Authority123!` | Authority Console (`/authority`), triage queue, work orders |
| **System Admin** | `admin@civicmind.org` | `Admin123!` | Administrative configuration |
