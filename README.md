# 🛰️ Earth Observation Data Pipeline System

A full-stack satellite-based environmental monitoring platform that ingests real-time atmospheric data, processes it through a 5-stage ETL pipeline, and displays insights on a mission control–style dashboard.

> **Live Data Source:** [Open-Meteo API](https://open-meteo.com/) (free, no auth required)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)

---

## ✨ Features

- **Real-Time Data Ingestion** — Fetches live temperature, humidity, and cloud cover data from the Open-Meteo API for multiple Philippine cities
- **5-Stage ETL Pipeline** — Visual pipeline with stages: API Fetch → Data Cleaning → Feature Engineering → Alert Engine → Storage
- **Risk Scoring Engine** — Computes Heat Index and Risk Scores with automatic alert generation (HIGH / MEDIUM / LOW)
- **Interactive Satellite Map** — Leaflet-powered dark map with color-coded risk markers; **double-click anywhere** to run an ad-hoc environmental scan
- **Reverse Geocoding** — Double-clicked locations are automatically named via OpenStreetMap Nominatim
- **Trend Charts** — Recharts-powered area charts tracking temperature and heat index over time
- **Auto-Refresh** — Configurable 30-second polling interval for continuous monitoring
- **MongoDB Persistence** — Raw data, processed results, and pipeline logs stored in MongoDB Atlas

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS v4 |
| Charts | Recharts (Area charts) |
| Map | Leaflet (raw API, SSR-safe) |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas (Mongoose) |
| Icons | Lucide React |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account ([free tier](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/earth-observation-pipeline.git
cd earth-observation-pipeline
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/earth-obs?retryWrites=true&w=majority
```

> **MongoDB Atlas Setup:**
> 1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
> 2. Create a database user with read/write permissions
> 3. Whitelist your IP (or `0.0.0.0/0` for development)
> 4. Copy the connection string and replace `<username>` and `<password>`

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the system will automatically trigger an initial pipeline run if no data exists.

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/fetch-data` | Run pipeline for a single location `{ lat, lon, name }` |
| `POST` | `/api/fetch-all` | Run pipeline for all 3 hardcoded locations in parallel |
| `GET` | `/api/data` | Get latest record per location (summary) |
| `GET` | `/api/data?location=Quezon City` | Get last 24 records for a specific location |

## 🧠 Pipeline Architecture

```
[API Fetch] → [Data Cleaning] → [Feature Engineering] → [Alert Engine] → [Storage]
```

1. **API Fetch** — Calls Open-Meteo for hourly forecast data
2. **Data Cleaning** — Replaces nulls, rounds floats, validates types
3. **Feature Engineering** — Computes Heat Index (`temp + 0.33 * humidity - 4`) and Risk Score
4. **Alert Engine** — Evaluates thresholds for heat, humidity, and cloud cover
5. **Storage** — Persists raw data, processed results, and pipeline logs to MongoDB

## 🌍 Monitored Locations

| City | Latitude | Longitude |
|------|----------|-----------|
| Quezon City | 14.65 | 121.07 |
| Cebu City | 10.32 | 123.89 |
| Davao City | 7.19 | 125.45 |

> **Pro Tip:** Double-click anywhere on the map to run an ad-hoc environmental scan for any location on Earth!

## 🎨 Design

Dark mission control aesthetic with:
- Background: `#0a0e1a` (deep navy)
- Accent: `#06b6d4` (cyan)
- Cards: `#111827` with glowing borders
- Font: Inter + Space Mono (Google Fonts)
- Animated pipeline visualization with pulse effects

## 📦 Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the `MONGODB_URI` environment variable in Vercel project settings
4. Deploy — done!

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                    # Mission Control dashboard
│   ├── layout.tsx                  # Root layout with fonts
│   ├── globals.css                 # Global styles + Leaflet overrides
│   └── api/
│       ├── fetch-data/route.ts     # Single location pipeline
│       ├── fetch-all/route.ts      # All locations pipeline
│       └── data/route.ts           # Data retrieval endpoint
├── components/
│   ├── MetricCard.tsx              # Stat display cards
│   ├── LocationOverview.tsx        # Location summary table
│   ├── AlertPanel.tsx              # Live alert feed
│   ├── PipelineVisualizer.tsx      # ETL stage visualization
│   ├── TemperatureChart.tsx        # Recharts trend analysis
│   ├── LocationMap.tsx             # Map wrapper (SSR-safe)
│   ├── MapInner.tsx                # Raw Leaflet map implementation
│   ├── GlobalAlertBanner.tsx       # Critical alert banner
│   └── AdHocAnalysisPanel.tsx      # Double-click scan results
├── lib/
│   ├── mongodb.ts                  # Mongoose connection singleton
│   ├── locations.ts                # Hardcoded location config
│   ├── pipeline.ts                 # Full ETL pipeline logic
│   └── alertEngine.ts              # Alert evaluation logic
├── models/
│   ├── RawData.ts                  # Raw API response schema
│   ├── ProcessedData.ts            # Processed metrics schema
│   └── PipelineLog.ts             # Pipeline execution log schema
├── .env.example                    # Environment variable template
└── README.md
```

## 📄 License

MIT

---

*Designed for Global Environmental Surveillance*
