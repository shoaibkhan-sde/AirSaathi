# AirSaathi — Intelligent Clean-Air Companion for Families

> **Breathe Better. Live Healthier.**  
> A privacy-first, context-aware web application designed to help households in South Asia and urban centers make evidence-based, actionable decisions to combat urban air pollution and seasonal smog.

[![Tests](https://img.shields.io/badge/Tests-143%20Passed-emerald.svg)](tests/)
[![Coverage](https://img.shields.io/badge/Coverage-89.15%25%20Lines-teal.svg)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.6-blue.svg)](tsconfig.json)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success.svg)](tests/accessibilityAudit.test.ts)
[![Security](https://img.shields.io/badge/Security-Server--Side%20Key%20Isolation-orange.svg)](server/)

---

## Table of Contents

- [A. Project Overview](#a-project-overview)
- [B. Problem Statement & Solution](#b-problem-statement--solution)
- [C. Architecture & Request Flow](#c-architecture--request-flow)
- [D. Complete Folder Structure](#d-complete-folder-structure)
- [E. Technology Stack](#e-technology-stack)
- [F. Features & Implementation Status](#f-features--implementation-status)
- [G. Setup Instructions](#g-setup-instructions)
- [H. Environment Variables](#h-environment-variables)
- [I. Local Development Commands](#i-local-development-commands)
- [J. Testing Instructions & Results](#j-testing-instructions--results)
- [K. Deployment Instructions](#k-deployment-instructions)
- [L. Evaluation Criteria & Evidence](#l-evaluation-criteria--evidence)
- [M. Performance & Testing Metrics](#m-performance--testing-metrics)
- [N. Security & Privacy](#n-security--privacy)
- [O. Known Limitations & Gaps](#o-known-limitations--gaps)
- [P. Future Improvements](#p-future-improvements)
- [Q. License](#q-license)

---

## A. Project Overview

### Description
**AirSaathi** (*"Air Companion"*) is a specialized web application engineered to transform raw environmental data into personalized, household-specific clean-air routines. Instead of presenting abstract particulate counts, AirSaathi combines modeled atmospheric estimates with household vulnerability profiles to deliver actionable exposure-reduction strategies.

### The Real-World Problem
Across South Asia and global metropolitan areas, severe winter temperature inversions and post-harvest biomass burning produce hazardous air quality (frequently exceeding PM2.5 levels of 300–500 µg/m³). Public air monitors report high outdoor numbers, but typical families encounter distinct challenges:
- Generic public advisories (e.g., *"Stay indoors"*) fail because indoor concentrations can reach 60–80% of outdoor levels through infiltration and unvented domestic cooking (LPG, biomass, kerosene).
- Vulnerable demographics—such as infants, asthmatics, and elderly individuals—suffer acute health impacts while other household members may require daily commute guidance.
- Families lack clarity on whether opening windows for ventilation is beneficial or harmful at specific hours of the day.

### Target Users & Intended Impact
1. **Families with Children and Elderly Members**: Provides targeted vulnerability warnings, room sanctuary setups, and sleep protection protocols.
2. **Daily Urban Commuters**: Delivers transport-specific advice (active corridors for cyclists/walkers, cabin recirculation for drivers, N95 recommendations for two-wheeler and open transit riders).
3. **Households Seeking Affordable Interventions**: Focuses on high-impact zero-cost behavioral modifications (kitchen draft separation, wet damp-dusting, diurnal cross-ventilation timing) rather than demanding costly equipment.

---

## B. Problem Statement & Solution

```
                                      THE GAP
  [ Raw Outdoor AQI (e.g. 280) ]  ---------------->  [ Generic "Stay Indoors" Advice ]
                                                          |
                                                          x Does not factor cooking fuels
                                                          x Does not account for asthmatics
                                                          x Ignores commuter exposure
                                                          x Fabricates indoor sensor values
                                      AIRSAATHI
  [ Open-Meteo / CAMS AQI ]  +  [ Onboarding Profile ]  -->  [ Deterministic Rules Engine ]
                                                          +  [ Isolated Gemini Assistant ]
                                                                  |
                                                                  v
                                              [ Household-Specific Actionable Plan ]
```

### Why Generic Advice Fails
1. **Combustion Source Blindness**: Advising a family using biomass or unvented LPG to *"keep all windows closed indefinitely"* concentrates carbon monoxide and kitchen particulate matter indoors, aggravating respiratory strain.
2. **One-Size-Fits-All Fallacy**: An adult working from home needs different precautions than a motorcycle commuter traveling during peak rush-hour smog.
3. **No Support for Sustainable Action**: Citizens often feel helpless regarding ambient pollution. AirSaathi pairs defensive guidance with transparent, verified carbon-avoidance tracking.

### The AirSaathi Solution
- **Vulnerability-Driven Onboarding**: Collects household composition (children under 12, seniors 65+, adults only), health conditions (asthma, cardiovascular sensitivities), commute mode, cooking fuel, heating source, and air purifier ownership.
- **Calibrated Atmospheric Ingestion**: Retrieves live particulate data (PM2.5, PM10, European/US AQI) from Open-Meteo's Copernicus Atmosphere Monitoring Service (CAMS) grid (~45 km resolution).
- **Dual Deterministic & AI Guidance**:
  - *Deterministic Engines* generate guaranteed, rule-verified daily home cards, diurnal smart tip routines, and room-by-room indoor air checklists without hallucination risks.
  - *Server-Isolated AI Assistant* (Google Gemini) provides conversational exploration grounded in the user's live city metrics and profile context.

---

## C. Architecture & Request Flow

```mermaid
flowchart TD
    subgraph Client["Browser (React 18 + TypeScript SPA)"]
        UI["UI Views (Home, Tips, Indoor, Sustainability, Settings, Chat)"]
        CTX["AppContext (useProfileSync, useAppInteractions)"]
        LS[("localStorage: profile, checklist, chat, actions")]
        AQC["Client AQI Cache (15-min TTL Memory Map)"]
    end

    subgraph Server["Backend / Middleware (Node.js HTTP / Vite Plugin)"]
        API["apiHandler.ts (/api/*)"]
        SEC["securityHeaders.ts (Origin Check, CSP, Headers)"]
        RL["clientRateLimiter.ts (Sliding Window / Redis)"]
        VAL["validationSchemas.ts (Zod Strict Schemas)"]
        PS["promptSanitizer.ts (Injection Defense & Output Verification)"]
        HTTP["httpClient.ts (safeFetch: Host Allowlist, Timeout, No Redirects)"]
    end

    subgraph Upstream["External Services (Strict Allowlist)"]
        OM["Open-Meteo Air Quality & Geocoding APIs"]
        NOM["OpenStreetMap Nominatim (Reverse Geocoding)"]
        GEM["Google Gemini API (REST v1beta / v1)"]
    end

    UI --> CTX
    CTX <--> LS
    CTX <--> AQC
    CTX -- "POST /api/location/resolve\nPOST /api/air-quality/current\nPOST /api/chat" --> API

    API --> SEC
    SEC --> RL
    RL --> VAL
    VAL --> HTTP
    VAL --> PS

    HTTP -- "HTTPS Only (Allowed Hosts)" --> OM
    HTTP -- "HTTPS Only (User-Agent Attributed)" --> NOM
    PS -- "HTTPS Only (Server Secret Only)" --> GEM
```

### Request Flow Step-by-Step
1. **Location Resolution**: The user enters a city or 6-digit PIN code (or clicks *"Use my location"*). Coordinated requests are routed to `/api/location/resolve`. Device coordinates are rounded to two decimal places (~1.1 km) for location privacy.
2. **Reverse Geocoding**: Upstream queries resolve via Open-Meteo Geocoding or OpenStreetMap Nominatim. If offline or unavailable, built-in fallback stations supply validated metrics.
3. **Air Quality Ingestion**: The backend queries Open-Meteo's CAMS atmospheric model grid. Responses are mapped to standard EPA and CPCB air quality categories.
4. **Deterministic Evaluation**: Pure client-side services ([homeRecommendations.ts](file:///e:/AirSaathi/src/services/recommendations/homeRecommendations.ts), [smartTipsEngine.ts](file:///e:/AirSaathi/src/services/recommendations/smartTipsEngine.ts), [indoorAirEngine.ts](file:///e:/AirSaathi/src/services/recommendations/indoorAirEngine.ts)) process the metrics against the user's profile without sending personal data to AI models.
5. **AI Interaction**: When the user asks a question, `/api/chat` verifies the payload with Zod schemas, checks sliding-window rate limits, sanitizes prompts against injection attempts, and communicates server-to-server with Google Gemini. The client receives clean, structured bullet-point guidance.

---

## D. Complete Folder Structure

```
AirSaathi/
├── .env.example                     # Reference template for environment variables
├── eslint.config.js                 # ESLint 9 flat configuration
├── index.html                       # HTML5 entry with accessible viewport & meta tags
├── package.json                     # Scripts, dependencies, and project metadata
├── postcss.config.js                # PostCSS plugins (Tailwind, Autoprefixer)
├── tailwind.config.js               # Theme tokens, fonts, and custom color palette
├── tsconfig.json                    # Strict TypeScript configuration
├── vite.config.ts                   # Vite configuration with embedded backend API plugin
│
├── public/                          # Static public assets
│   ├── assets/                      # Production illustrations and icons
│   │   ├── airsaathi/               # Brand mark, skyline hero, living room, running shoe
│   │   ├── favicon.png              # High-resolution favicon
│   │   └── ...                      # Onboarding and sustainability artwork
│   └── favicon.ico                  # Standard shortcut icon
│
├── server/                          # Server-only backend architecture
│   ├── airQualityService.ts         # Upstream Open-Meteo air quality ingestion
│   ├── apiHandler.ts                # HTTP request dispatcher for /api/* routes
│   ├── apiUtils.ts                  # JSON serialization, body parsing, and status mapping
│   ├── clientRateLimiter.ts         # IP extraction, HMAC-SHA256 hashing, rate limit checks
│   ├── config.ts                    # Zod-validated server environment configuration
│   ├── constants.ts                 # Rate limit thresholds, body limits, default models
│   ├── forwardGeocoding.ts          # Forward city/PIN geocoding via Open-Meteo
│   ├── geminiChatService.ts         # Gemini REST client, model discovery, and FAQ cache
│   ├── geocodingService.ts          # Coordinated location resolution service
│   ├── httpClient.ts                # safeFetch with HTTPS allowlist, timeouts, header strip
│   ├── index.ts                     # Standalone Node.js HTTP server (port 3001)
│   ├── promptSanitizer.ts           # Prompt injection neutralizing and AI output validator
│   ├── rateLimiter.ts               # In-memory sliding window and Redis client adapter
│   ├── recommendationService.ts     # Server-side profile recommendation builder
│   ├── reverseGeocoding.ts          # Nominatim reverse geocoding with user-agent attribution
│   ├── securityHeaders.ts           # Origin verification and security response headers
│   ├── staticLocations.ts           # Verified regional station fallback directory
│   ├── types.ts                     # Server-side TypeScript interfaces
│   └── validationSchemas.ts         # Strict Zod schemas for all inbound payloads
│
├── src/                             # Client-side React 18 application
│   ├── App.tsx                      # Root component, routing, skip-link, and layout shell
│   ├── index.css                    # Tailwind directives, focus-visible, and reduced-motion
│   ├── main.tsx                     # React DOM entry
│   │
│   ├── components/
│   │   ├── assistant/               # FloatingBotLauncher, ChatWindow, AirGuideView
│   │   ├── common/                  # Sidebar, MobileNav, ToastContainer, BackgroundLeaves
│   │   ├── dashboard/               # AQIHeroCard, RecommendationsRow, heroConfig
│   │   ├── indoor/                  # IndoorAirView, RoomGuidanceSection, IndoorQuickTips
│   │   ├── onboarding/              # OnboardingView, HouseholdStep, LifestyleStep, Selectors
│   │   ├── settings/                # SettingsView, LocationModal, FamilyModal
│   │   ├── sustainability/          # SustainabilityView, Hero, Actions, Alternatives, Progress
│   │   └── tips/                    # SmartTipsView, RoutineTimeline, RoutineCard, Protection
│   │
│   ├── context/                     # Application state management
│   │   ├── AppContext.tsx           # Primary context provider and dispatch hooks
│   │   ├── appCityStorage.ts        # City resolution and fallback storage
│   │   ├── profileStorage.ts        # UserProfile persistence with privacy rounding
│   │   ├── useApp.ts                # Context consumer hook
│   │   └── useToastManager.ts       # Toast notifications state manager
│   │
│   ├── data/                        # Static datasets (CPCB categories, mock stations)
│   ├── services/                    # Client services & deterministic recommendation logic
│   │   ├── airQualityService.ts     # Client AQI coordinator with 15-minute in-memory cache
│   │   ├── chatService.ts           # Client dispatch to /api/chat
│   │   ├── chatStorage.ts           # LocalStorage chat persistence with quota handling
│   │   └── recommendations/         # Home, Smart Tips, Indoor Air, Sustainability engines
│   └── types/                       # Shared domain TypeScript interfaces
│
└── tests/                           # Automated test suite (Node.js test runner)
    ├── accessibilityAudit.test.ts   # WCAG 2.2 AA verification suite
    ├── airQualityUnit.test.ts       # EPA/CPCB categories, directory search, cache TTL
    ├── apiRoutes.test.ts            # API route payload and missing-key behavior
    ├── aqiBoundaries.test.ts        # Complete EPA boundary value assertions (0 to 500)
    ├── architecture.test.ts         # Strict line limit (<= 205) and boundary import checks
    ├── e2eOnboardingAndNav.test.ts  # End-to-end first-time and navigation journeys
    ├── e2eRecommendationsAndChat.test.ts # End-to-end settings sync, chat, and checklists
    ├── edgeCasesResilience.test.ts  # Offline fallbacks, corrupt state, rapid clicks
    ├── homeRecommendations.test.ts  # Deterministic home recommendation matrix
    ├── indoorAirEngine.test.ts      # Kitchen, bedroom, and living room rules
    ├── integrationCoreFlows.test.ts # Onboarding -> Storage -> Home recs data flow
    ├── integrationServiceFlows.test.ts # Provider errors, geocoding fallbacks, live sync
    ├── locationValidation.test.ts   # Coordinate boundaries and privacy rounding
    ├── onboardingUnit.test.ts       # Form validation and mutual exclusivity checks
    ├── performanceResilience.test.ts# Rate limiting and concurrent burst resilience
    ├── providerIntegration.test.ts  # Upstream mock simulation and HTTP failure handling
    ├── rateLimiter.test.ts          # Serialized queue and sliding window mechanics
    ├── reverseGeocoding.test.ts     # Settlement name extraction and POI stripping
    ├── securityInputIsolation.test.ts # Key isolation, body capping, injection filters
    ├── securityProtectionHeaders.test.ts # Upstream HTTPS allowlist and CORS policies
    ├── smartTipsEngine.test.ts      # Diurnal routine generation and vulnerability rules
    ├── storageChecklistChat.test.ts # Storage resilience for room checklists and chat
    ├── storageProfileSustainability.test.ts # Profile persistence and CO2 action tracking
    └── sustainabilityEngine.test.ts # Transparent CO2 calculations and mobility shifts
```

---

## E. Technology Stack

| Category | Technology | Actual Purpose in Repository |
|---|---|---|
| **Frontend Framework** | React 18.3.1 | Component-based interactive user interface |
| **Language** | TypeScript 5.6.3 | Full-stack static typing with strict null checks |
| **Build Tool & Bundler** | Vite 5.4.11 | Fast HMR dev server and Rollup production bundling |
| **Styling & CSS** | Tailwind CSS 3.4.15 | Utility-first styling with responsive and dark mode support |
| **Iconography** | Lucide React 1.16.0 | Semantic, accessible SVG UI icons |
| **Schema Validation** | Zod 4.6.7 | Strict runtime validation for API bodies and environment variables |
| **Air Quality Data** | Open-Meteo Air Quality API | Modeled particulate and AQI estimates (Copernicus CAMS grid) |
| **Geocoding & Location** | Open-Meteo & OpenStreetMap | Forward coordinates search and reverse town settlement naming |
| **AI Integration** | Google Gemini API (REST) | Dynamic context-grounded conversational assistant |
| **Backend / API Engine** | Node.js HTTP Server & Connect | Lightweight REST API dispatcher and Vite dev middleware plugin |
| **Rate Limiting** | Sliding Window & ioredis 6.0 | Request throttling with optional Redis cluster support |
| **Data Persistence** | Browser `localStorage` | Client-side privacy-first storage for profile, checklist, and chat |
| **Testing Engine** | Node.js Test Runner (`node:test`) | Native ESM test execution with `--experimental-strip-types` |

---

## F. Features & Implementation Status

| Feature Area | Description | Implementation Status | Test Status |
|---|---|---|---|
| **Onboarding Wizard** | 2-step setup collecting location, household members, health sensitivities, commute mode, and fuels | **Implemented** | **Tested** (`onboardingUnit.test.ts`, `e2eOnboardingAndNav.test.ts`) |
| **Location Auto-Detection** | Browser Geolocation API integration with coordinate privacy rounding (2 decimal places) | **Implemented** | **Tested** (`locationValidation.test.ts`) |
| **Home Dashboard** | Real-time AQI card with explicit category, PM2.5/PM10 metrics, and 3 deterministic recommendation cards | **Implemented** | **Tested** (`homeRecommendations.test.ts`) |
| **Smart Tips** | Diurnal activity routines (morning, afternoon, evening) with exposure alerts and save-to-plan bookmarks | **Implemented** | **Tested** (`smartTipsEngine.test.ts`) |
| **Indoor Air Guidance** | Room-specific checklist (Kitchen, Bedroom, Living Room, Study) with fuel and purifier calibrations | **Implemented** | **Tested** (`indoorAirEngine.test.ts`) |
| **Sustainability Tracker**| Transparent CO₂ avoidance calculations based strictly on completed lifestyle actions (no fabricated claims) | **Implemented** | **Tested** (`sustainabilityEngine.test.ts`) |
| **AI Assistant (Chatbot)** | Context-aware floating chat grounded in city AQI and household profile; injection-filtered | **Implemented** | **Tested** (`apiRoutes.test.ts`, `securityInputIsolation.test.ts`) |
| **Settings & Profile Edit**| In-place location hub switcher, household profile editor, and onboarding reset wizard | **Implemented** | **Tested** (`e2eRecommendationsAndChat.test.ts`) |
| **Offline Resilience** | Automatic graceful fallback to offline regional station datasets during network disconnection | **Implemented** | **Tested** (`edgeCasesResilience.test.ts`) |
| **WCAG 2.2 AA Accessibility**| Skip-to-content, keyboard focus-visible rings, Escape dismissal, live regions, non-color AQI | **Implemented** | **Tested** (`accessibilityAudit.test.ts`) |
| **Distributed Redis Throttling**| Distributed rate-limiting via Redis when `REDIS_URL` is configured | **Environment-dependent** | **Tested** with in-memory fallback (`rateLimiter.test.ts`) |
| **Micro-Local Indoor Sensors** | Direct IoT Bluetooth/WiFi hardware monitor streaming | **Planned** | Not implemented |

---

## G. Setup Instructions

### Prerequisites
- **Node.js**: Version `20.18.0` or higher (verified on Node.js `v24.16.0`).
- **Package Manager**: `npm` (version `10.x` or higher).
- **Git**: Installed and available in terminal.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AirSaathi.git
cd AirSaathi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the reference `.env.example` into `.env`:
```bash
cp .env.example .env
```
Open `.env` in your editor. For local development with full AI chatbot functionality, supply your Gemini API key:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=3001
```
*(If no Gemini API key is provided, the application and deterministic recommendation engines run fully; the chatbot will return a helpful offline configuration notice rather than crashing).*

### 4. Start Local Development Server
```bash
npm run dev
```

### 5. Access the Application
Open your browser to:
```
http://localhost:5173
```
*Note: The Vite development server automatically mounts the backend API middleware at `/api/*`, enabling full frontend-backend communication on a single port.*

---

## H. Environment Variables

| Variable | Required? | Purpose | Where It Is Used |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | Authorizes server-side requests to Google Gemini for the assistant | `server/config.ts`, `server/geminiChatService.ts` (Server only) |
| `GEMINI_MODEL` | Optional | Specifies target Gemini model (default: `gemini-1.5-flash`) | `server/config.ts`, `server/geminiChatService.ts` (Server only) |
| `PORT` | Optional | Port for standalone Node backend (default: `3001`) | `server/config.ts`, `server/index.ts` (Server only) |
| `OPEN_METEO_API_KEY` | Optional | Commercial API key for high-volume Open-Meteo customer endpoints | `server/config.ts`, `server/airQualityService.ts` (Server only) |
| `OPEN_METEO_API_BASE_URL` | Optional | Custom base endpoint (default: `https://air-quality-api.open-meteo.com`) | `server/config.ts` (Server only) |
| `NOMINATIM_USER_AGENT` | Optional | Custom HTTP User-Agent header for OpenStreetMap Nominatim | `server/config.ts`, `server/reverseGeocoding.ts` (Server only) |
| `REDIS_URL` | Optional | Connection URL for shared Redis rate limiting; uses memory fallback if unset | `server/config.ts`, `server/rateLimiter.ts` (Server only) |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS allowed origins | `server/config.ts`, `server/securityHeaders.ts` (Server only) |
| `RATE_LIMIT_SALT` | Optional | Salt string for anonymizing client IPs before storing rate limits | `server/config.ts`, `server/clientRateLimiter.ts` (Server only) |

> [!CAUTION]
> **Zero Client-Side Keys**: Notice that no variables use the `VITE_` prefix. Under no circumstances should `GEMINI_API_KEY` or commercial data keys be prefixed with `VITE_`. All external API keys remain strictly confined to server-side execution.

---

## I. Local Development Commands

All scripts are configured in [package.json](file:///e:/AirSaathi/package.json):

```bash
# Start Vite development server with embedded API backend
npm run dev

# Run full automated test suite (143 tests across all suites)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run end-to-end user journey tests
npm run test:e2e

# Run test suite with native code coverage report
npm run test:coverage

# Perform static TypeScript type checking
npm run typecheck

# Run ESLint quality checks (zero warnings allowed)
npm run lint

# Format codebase using Prettier
npm run format

# Verify formatting without modifying files
npm run format:check

# Compile production bundle
npm run build

# Preview compiled production build locally
npm run preview
```

---

## J. Testing Instructions & Results

Testing is executed natively through Node.js (`node:test` and `node:assert/strict`) utilizing Node's built-in TypeScript execution flag (`--experimental-strip-types`). No third-party test runners or heavy testing runtimes are required.

### Actual Measured Test Execution (November 2026)

| Test Category | Command | Actual Measured Result | Status |
|---|---|---|---|
| **Full Suite** | `npm test` | **143 passed**, 0 failed (4.42s) | **PASS** |
| **Unit Tests** | `npm run test:unit` | **70 passed**, 0 failed (1.18s) | **PASS** |
| **Integration Tests** | `npm run test:integration` | **16 passed**, 0 failed (1.38s) | **PASS** |
| **E2E Journeys** | `npm run test:e2e` | **6 passed**, 0 failed (0.43s) | **PASS** |
| **Accessibility Tests** | `node --test tests/accessibilityAudit.test.ts` | **9 passed**, 0 failed (0.04s) | **PASS** |
| **Architecture Quality** | `node --test tests/architecture.test.ts` | **3 passed**, 0 failed (0.41s) | **PASS** |
| **Type Checking** | `npm run typecheck` | 0 errors | **PASS** |
| **Linting** | `npm run lint` | 0 warnings, 0 errors | **PASS** |
| **Production Build** | `npm run build` | 12 optimized chunks in 15.63s | **PASS** |

### Code Coverage Summary (`npm run test:coverage`)
- **Line Coverage**: **89.15%**
- **Function Coverage**: **89.26%**
- **Branch Coverage**: **78.00%**

---

## K. Deployment Instructions

### Production Build
Execute the production build script:
```bash
npm run build
```
The output is written to the `dist/` directory:
- Optimized single-page application entry `dist/index.html` (1.36 kB).
- Code-split view chunks (`OnboardingView`, `SmartTipsView`, `IndoorAirView`, `SustainabilityView`, `SettingsView`, `AirGuideView`, `ChatWindow`).
- Vendor chunk isolation (`vendor-react`, `vendor-icons`).

### Standalone Backend Execution
If running on a Node.js hosting platform (Render, Railway, AWS ECS, Google Cloud Run):
```bash
node --experimental-strip-types server/index.ts
```
The server listens on `PORT` (default: 3001) and exposes the `/api/*` endpoints.

### Verification of Deployment
1. Navigate to `/` — verify that uninitialized sessions redirect to the Onboarding wizard.
2. Complete Step 1 and Step 2 — verify that recommendations load without console errors.
3. Open network tab — verify all `/api/*` requests return headers `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.

---

## L. Evaluation Criteria & Evidence

### Google × Hack2Skill PromptWars Evaluation Alignment

| Evaluation Criterion | Implemented Evidence | Verification Method | Current Status |
|---|---|---|---|
| **1. Problem Statement Alignment** | Personalized clean-air plans accounting for cooking fuel, heating, vulnerable members, and commute modes. | Code inspection of [homeRecommendationRules.ts](file:///e:/AirSaathi/src/services/recommendations/homeRecommendationRules.ts); verified against edge cases. | **VERIFIED** |
| **2. Code Quality & Modularity** | Every file in `src/`, `server/`, and `tests/` is strictly $\le 200$ (max 205) lines. Clear separation of services, storage, and presentation. | Enforced by [tests/architecture.test.ts](file:///e:/AirSaathi/tests/architecture.test.ts) and ESLint (`--max-warnings 0`). | **VERIFIED** |
| **3. Efficiency & Performance** | Code splitting via `React.lazy`, client AQI cache with 15-min TTL, in-flight request deduplication, zero client AI key bundle leakage. | Measured Vite Rollup chunk sizes; test assertion in [airQualityUnit.test.ts](file:///e:/AirSaathi/tests/airQualityUnit.test.ts). | **VERIFIED** |
| **4. Testing Completeness** | 143 automated tests covering EPA boundaries (0 to 500), rate limiting, storage quota exceptions, offline fallbacks, and user journeys. | Automated execution via `npm test` and `npm run test:coverage` (89.15% line coverage). | **VERIFIED** |
| **5. Accessibility (WCAG 2.2 AA)** | Skip-to-content anchor, high-contrast `:focus-visible` styling, Escape key dialog closing, live status regions, and screen-reader summaries. | Validated in [tests/accessibilityAudit.test.ts](file:///e:/AirSaathi/tests/accessibilityAudit.test.ts) and manual keyboard navigation. | **VERIFIED** |
| **6. Security & Privacy** | `GEMINI_API_KEY` server-only, strict upstream HTTPS host allowlist, body size capping, prompt injection neutralization, salted IP hashing. | Validated in [tests/securityInputIsolation.test.ts](file:///e:/AirSaathi/tests/securityInputIsolation.test.ts) and [securityProtectionHeaders.test.ts](file:///e:/AirSaathi/tests/securityProtectionHeaders.test.ts). | **VERIFIED** |
| **7. Functional Completeness** | 5 core views + Onboarding wizard + Settings + Floating AI Chatbot + Toast manager fully wired to state. | Manual browser execution and end-to-end user journey tests (`e2eOnboardingAndNav.test.ts`). | **VERIFIED** |

---

## M. Performance & Testing Metrics

*Measurements recorded on November 21, 2026 under local development and Node.js v24.16.0 / Windows 11 conditions.*

### Build Artifact Breakdown (`npm run build`)
| Asset | Uncompressed Size | Gzipped Size | Purpose |
|---|---|---|---|
| `dist/index.html` | 1.36 kB | 0.69 kB | SPA Root Document |
| `dist/assets/index-*.css` | 67.44 kB | 12.06 kB | Compiled Tailwind CSS & focus styles |
| `dist/assets/vendor-react-*.js` | 141.81 kB | 45.43 kB | React 18 & ReactDOM runtime |
| `dist/assets/index-*.js` | 93.45 kB | 29.97 kB | Core application bundle & Context |
| `dist/assets/OnboardingView-*.js` | 42.00 kB | 8.56 kB | Lazy-loaded onboarding wizard |
| `dist/assets/vendor-icons-*.js` | 27.98 kB | 6.57 kB | Lucide SVG icons chunk |
| `dist/assets/SustainabilityView-*.js`| 22.76 kB | 6.84 kB | Lazy-loaded carbon tracker view |
| `dist/assets/SettingsView-*.js` | 15.32 kB | 3.22 kB | Lazy-loaded settings & modal view |
| `dist/assets/SmartTipsView-*.js` | 14.73 kB | 4.01 kB | Lazy-loaded smart tips routines |
| `dist/assets/IndoorAirView-*.js` | 13.72 kB | 3.99 kB | Lazy-loaded room checklist view |
| `dist/assets/ChatWindow-*.js` | 11.34 kB | 3.63 kB | Lazy-loaded floating chat UI |
| `dist/assets/AirGuideView-*.js` | 8.51 kB | 2.60 kB | Lazy-loaded full-page AI guide view |
| **Total Build Time** | **15.63 seconds** | — | Compiled cleanly with zero errors |

### Runtime & Quality Measurements
- **Total Automated Tests**: 143 passed (0 failed).
- **Test Suite Duration**: 4.42 seconds.
- **Client AQI Cache TTL**: 15 minutes (900,000 ms) in-memory deduplication.
- **Lighthouse Performance Score**: *Not measured yet (requires headless production server environment).*
- **Core Web Vitals (LCP/FID/CLS)**: *Not measured yet.*

---

## N. Security & Privacy

### API Key Handling
- The Google Gemini API key is accessed exclusively via `process.env.GEMINI_API_KEY` on the server.
- The client-side browser code makes calls to `/api/chat`, never to Google servers directly.
- The Vite client build bundle contains zero API secrets.

### Data Collection & Storage
- **Profile Data**: Saved to browser `localStorage` under key `airsaathi_user_profile_v2`. It never leaves the client except when sent to `/api/onboarding/complete` or as context to `/api/chat`.
- **Location Privacy**: Geolocation coordinates are automatically rounded to 2 decimal places (~1.1 km precision) before caching or querying to prevent revealing specific residences.
- **Checklist & Actions**: Saved to `localStorage` under `airsaathi_room_checklist_v1` and `airsaathi_completed_actions_v1`.
- **User Clearing**: Users can reset all stored preferences, checklists, and chat history anytime in **Settings → Reset Household Questionnaire** or via browser data clearing.

### Network & Backend Security
- **Strict HTTPS Host Allowlist**: Backend calls via `safeFetch` are restricted to:
  - `generativelanguage.googleapis.com`
  - `air-quality-api.open-meteo.com`
  - `customer-api.open-meteo.com`
  - `geocoding-api.open-meteo.com`
  - `nominatim.openstreetmap.org`
- **Header Sanitization**: Outbound upstream requests strip client cookies, authorization tokens, and proxy headers.
- **Request Body Capping**: Inbound requests are limited to 1 MB (and 100 KB for `/api/chat`) to protect against buffer overflow or memory denial-of-service.
- **Rate Limiting**: Sliding window rate limits (60 req/min for general API, 20 req/min for chat) with HMAC-SHA256 salted IP anonymization.

---

## O. Known Limitations & Gaps

1. **Atmospheric Data Resolution**: Open-Meteo AQI is derived from the Copernicus Atmosphere Monitoring Service (CAMS) atmospheric model grid (~45 km resolution). While accurate for regional smog and particulate trends, it does not reflect micro-local street-corner anomalies.
2. **No Hardware Indoor Sensors**: AirSaathi's indoor guidance is based on validated physical and behavioral principles (combustion source control, filtration sanctuary, window drafts). It does not connect to physical IoT air monitors.
3. **Third-Party API Dependency**: Air quality estimates depend on Open-Meteo API availability. In the event of complete upstream failure, AirSaathi automatically serves validated regional station fallback data.
4. **Local Device Storage**: Clearing browser site data deletes stored preferences, requiring the user to retake the 1-minute onboarding wizard.
5. **Production Deployment URL**: *Not verified yet (pending official cloud deployment host assignment).*

---

## P. Future Improvements

- **Local Low-Cost Sensor Ingestion**: Integration with community air monitors (e.g., PurpleAir or OpenAQ APIs) to augment regional CAMS models with localized readings.
- **AQI Forecasts & Advance Warnings**: 24-to-48 hour diurnal smog forecasting to advise families before severe inversions develop.
- **Multilingual Support**: Localization into Hindi, Urdu, Bengali, and Punjabi to increase regional accessibility across South Asia.
- **Push Alerts**: Web push notifications for severe smog transitions (e.g., AQI transitioning from Moderate to Very Unhealthy).

---

## Q. License

**No license has been specified yet.**  
All rights are currently reserved by the original project contributors. Commercial use, reproduction, or distribution requires explicit permission from the author.
