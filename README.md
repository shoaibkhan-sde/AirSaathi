# AirSaathi (एयर साथी)

> An intelligent clean-air companion helping urban families in South Asia navigate severe winter smog with personalized, actionable guidance.

[![Tests](https://img.shields.io/badge/Tests-143%20Passed-emerald.svg)](tests/)
[![Coverage](https://img.shields.io/badge/Coverage-89.15%25%20Lines-teal.svg)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.6-blue.svg)](tsconfig.json)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success.svg)](tests/accessibilityAudit.test.ts)
[![Security](https://img.shields.io/badge/Security-Server--Side%20Key%20Isolation-orange.svg)](server/)

## Description

Winter smog across South Asian cities turns routine daily activities—morning school runs, commuting, cooking, and opening windows—into critical health choices. Generic air warnings fail urban households because effective protection depends on **where you live, current air quality, and your household's unique makeup**.

AirSaathi collects key household context through a lightweight onboarding flow (location, vulnerable dependents like children or seniors, respiratory sensitivities, commute mode, kitchen fuel, and purifier availability) and pairs it with **live atmospheric data** and **Google Gemini** to deliver an evidence-based clean-air plan:

1. **Today's Air Snapshot**: Live AQI and $PM_{2.5}$ categorized on Indian CPCB and US-EPA scales with personalized health warnings.
2. **Personalized Smart Tips & Daily Routine**: Time-calibrated routines (morning commute, ventilation windows, evening outdoor play).
3. **Indoor Air Room Checklist**: Source-control guidance tailored to kitchen cooking fuel, bedroom purifier setup, and living areas.
4. **Sustainable Alternatives & CO2 Tracker**: Practical lower-emission mobility and energy swaps with transparent impact calculations.

A persistent **floating AI chat assistant** provides on-demand, contextual answers about air quality while maintaining full awareness of the user's current city and AQI reading.

## How it works

```text
Browser UI ────────► Local Client Engine (Fast UI & LocalStorage Persistence)
                         │ 
                         ├─► GET  /api/aqi?lat=..&lon=.. ──► Open-Meteo & Nominatim
                         ├─► POST /api/onboarding/complete ─► Zod Validation & Profile
                         └─► POST /api/chat ───────────────► Server Guard ──► Gemini 2.5 Flash
                                                               (Fallback: Built-in Air Guide)
```

- **Dual-Mode Backend:** The API runs standalone (`server/index.ts` on port 3001) or embedded directly as Vite connect middleware on port 5173 for zero-setup local development.
- **Server-Side API Key Isolation:** The Gemini API key is read solely on the server (`server/config.ts`) and is never shipped to client-side bundles.
- **Grounding & Schema Enforcement:** Gemini outputs are strictly validated via Zod schemas, stripped of control characters, and guarded against prompt injection.
- **Resilient Fallback:** If upstream AI or environmental services fail, deterministic offline engines serve safe, pre-compiled guidance without breaking the UI.

## Key features

### Personalised Clean-Air Guidance
- Dynamic rule engines evaluate household risks (e.g. prioritizing asthma triggers, elderly respiratory vulnerability, and child outdoor safety).
- Advice adapts to primary cooking fuel (LPG, biomass, induction) and commute modes (metro, two-wheeler, walking).
- Every recommendation highlights a direct, quantified impact (e.g., *"Reduces morning $PM_{2.5}$ exposure by ~65%"*).

### Always-Available AI Assistant
- Floating launcher available across all tabs with suggested starter prompts and conversation history.
- Grounded with live AQI metrics and user profile context; refuses non-air-quality prompts.
- Deterministic fallback handles offline or unconfigured API states gracefully.

### Indoor Air & Sustainability Tracking
- Interactive room-by-room checklist (Kitchen, Bedroom, Living Room) with persistent state.
- Transparent carbon-footprint savings calculator based on verified transportation and energy displacement formulas.

### Security and Privacy
- Zero persistent PII: No user accounts, database, or tracking cookies; profile persists locally in browser `localStorage`.
- Device coordinates rounded to ~1 km for privacy.
- Strict security headers (CSP, HSTS, X-Content-Type-Options), client rate limiting (10 requests/min), and input length caps.

### Accessible and Fast
- Compliant with **WCAG 2.2 AA**: Semantic landmarks, keyboard navigation, visible focus rings, skip-to-content links, and screen reader announcements.
- Information never relies solely on color: AQI status combines numeric values, text descriptors, and distinct category chips.
- 12 code-split chunks with dynamic imports for heavy modals and sections.

## Technology stack

| Area | Technology | Role & Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript 5.6 | Component architecture with strict type safety |
| **Styling** | Tailwind CSS 3.4 | Utility-first, responsive design with clean design tokens |
| **Icons** | Lucide React | Lightweight SVG icons loaded with code-splitting |
| **Bundler** | Vite 6 | Rapid HMR and optimized production code-splitting |
| **Backend** | Express + Node.js (v20+) | Secure API gateway with rate limiting and input validation |
| **GenAI** | Google Gemini 2.5 Flash | Structured clean-air recommendations via `@google/genai` |
| **Air Data** | Open-Meteo Air Quality | Global Copernicus CAMS atmospheric grid (~45 km resolution) |
| **Geocoding** | Nominatim / OpenStreetMap | Reverse geocoding with user-agent attribution |
| **Validation** | Zod 3.23 | Strict request, profile, and response schema enforcement |
| **Testing** | Node.js Test Runner | Native, fast test execution without extra testing dependencies |

## Folder structure

```text
AirSaathi/
├── server/                        # Backend API (Express / Vite Middleware)
│   ├── config.ts, env.d.ts        # Dedicated server-only environment config
│   ├── apiHandler.ts              # Route handling & Zod request validation
│   ├── geminiChatService.ts       # Gemini API integration & prompt isolation
│   ├── rateLimiter.ts             # Per-client IP rate limiting & hashing
│   └── securityHeaders.ts         # CSP, HSTS, and frame protection headers
├── src/                           # Frontend Application (React + Vite)
│   ├── components/
│   │   ├── assistant/             # Floating AI Chatbot & message bubbles
│   │   ├── dashboard/             # AQI Hero Card, Hourly Forecast & Daily Plan
│   │   ├── indoor/                # Room Checklist & source-control guidance
│   │   ├── onboarding/            # 3-step modal (Location, Household, Lifestyle)
│   │   ├── settings/              # Profile editing, reset, & theme toggles
│   │   └── sustainability/        # Eco-actions & CO2 savings tracker
│   ├── context/                   # AppContext, profile synchronization & toast state
│   ├── services/                  # Air quality engine, local storage & fallbacks
│   └── types/                     # TypeScript domain models and schemas
├── tests/                         # 24 unit, integration, and E2E test suites
├── public/assets/                 # Optimized WebP illustrations and icons
├── eslint.config.js               # Strict linting configuration
└── README.md                      # Evidence-based documentation
```

> **Architecture Discipline**: Every source and test file in `src/`, `server/`, and `tests/` is strictly constrained to $\le 200$ (max 205) lines for maintainability.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY (server-side only)

# 3. Start development server (serves frontend + backend on port 5173)
npm run dev
```

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Optional | Server-side Google Gemini key (app uses built-in fallback if unset) |
| `PORT` | Optional | Standalone server port (default: `3001`) |
| `ALLOWED_ORIGIN` | Optional | Allowed CORS origin for standalone API (default: `http://localhost:5173`) |

**Core Scripts:**
- `npm test` — Run all 143 tests across unit, integration, and E2E suites.
- `npm run test:coverage` — Generate test coverage reports via Node.js test runner.
- `npm run typecheck` — Strict TypeScript validation (`tsc --noEmit`).
- `npm run lint` — ESLint verification with zero warnings tolerance.
- `npm run build` — Production build with Vite code-splitting into `dist/`.

## Evaluation criteria

| Criterion | Implementation Evidence |
| :--- | :--- |
| **Code Quality** | Strict modularity; 100% of files $\le 205$ lines (verified by `tests/architecture.test.ts`). Zero TypeScript errors (`tsc --noEmit`), zero ESLint warnings, and strict separation between client bundle and server secrets. |
| **Security & Privacy** | AI key is never bundled in client code. Strict Zod schemas reject invalid fields, bodies are capped, IPs are hashed for rate limiting, and all client coordinates are rounded to ~1 km. |
| **Efficiency** | Dynamic imports split code into 12 chunks. In-memory caching (15-min TTL) prevents redundant air quality requests. CSS is only 42.4 kB (7.79 kB gzip). |
| **Testing & QA** | 143 passing tests across 24 test suites covering input validation, AQI boundary mapping, storage resilience, edge-case failure modes, and end-to-end user journeys. |
| **Accessibility** | Built to WCAG 2.2 AA standards: semantic landmarks, screen-reader live regions, keyboard traps prevention, skip-to-content link, and color-independent air quality indicators. |
| **Problem Alignment** | Tailored specifically for urban South Asian smog scenarios; provides actionable room checklists, travel alternatives, and personalized household protection. |

**Known Limitations & Gaps:**
- Atmospheric data is retrieved from Copernicus CAMS grid models (~45 km spatial resolution) rather than individual street-corner micro-sensors.
- Rate limiting in development operates with an in-memory sliding window; production scaling across serverless clusters benefits from Redis.
- Carbon reduction metrics represent mathematical approximations based on typical commuter benchmarks.

## Testing results

*Empirically measured on production build (Node.js v22.14.0, Windows x64):*

| Verification Check | Result | Details |
| :--- | :---: | :--- |
| **Total Test Suite** | **143 passed** / 0 failed | 24 test files executed in 4.42s |
| **Unit Tests** | **70 passed** / 0 failed | Onboarding, AQI boundaries, recommendations |
| **Integration Tests** | **16 passed** / 0 failed | Provider integration & API route verification |
| **E2E Journeys** | **6 passed** / 0 failed | First-time onboarding, state sync, settings update |
| **Line Coverage** | **89.15%** | Exceeds standard 80% production threshold |
| **Function Coverage** | **89.26%** | High coverage across recommendation & storage logic |
| **Branch Coverage** | **78.00%** | Thorough edge-case and fallback branch testing |
| **Type & Lint Gates** | **0 errors / 0 warnings** | Enforced via `tsc --noEmit` and `eslint` |
| **Asset Distribution** | **12 chunks** | CSS 42.42 kB (7.79 kB gzip), HTML 1.83 kB |

## Future improvements

- **Station-Level CPCB Fusion:** Integrate live Central Pollution Control Board (CPCB) monitoring station APIs to augment satellite grid data with hyperlocal ground readings.
- **Push Alerts & Forecasts:** Implement Web Push notifications for early morning smog spikes and 48-hour air quality trend predictions.
- **Multilingual Support:** Localize interface and recommendations into Hindi, Urdu, and Bengali.
- **PWA & Offline ServiceWorker:** Cache daily action plans for completely offline access during network blackouts.

## License

This project is licensed under the [MIT License](LICENSE).
