HEAD
# ✈ Traveloop — Personalized Travel Planning Made Easy

> Plan smarter. Travel better. Built for real travelers — with real data, real budgets, and zero fragmentation.

Deployed Link:https://traveloop-plum.vercel.app/

Traveloop is a full-stack, production-grade travel planning platform built for the **Odoo Hackathon**. It collapses the entire trip planning workflow — dream → design → organize → share — into one responsive application backed by a relational PostgreSQL database, an AI-assisted planning engine, and zero mandatory paid dependencies.

---

## Table of Contents

- [Vision & Problem](#vision--problem)
- [What Makes Traveloop Different](#what-makes-traveloop-different)
- [MVP Features](#mvp-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Backend — Setup & Running](#backend--setup--running)
- [Frontend — Setup & Running](#frontend--setup--running)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Auth & Cookies](#auth--cookies)
- [AI Endpoints](#ai-endpoints)
- [Shared Types Contract](#shared-types-contract)
- [Engineering Standards](#engineering-standards)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Vision & Problem

The average traveler visits **28 different websites across 76 online sessions** to plan a single trip (Nielsen Research). Existing tools are fragmented: TripIt organizes confirmations but cannot plan; Google Trips shut down; Wanderlog maps trips but is tightly coupled to paid Google APIs; no app gives day-level budget guardrails or adapts to *who* is actually traveling.

Traveloop solves this in one platform:

- No tab-switching. No fragmentation.
- Self-hosted city and activity data — no Google Places billing.
- Day-level budget alerts, not just totals.
- Personalized for who is traveling: solo, couple, family, senior, or group.
- Region-specific hidden gems — not just TripAdvisor's top 10.
- Zero mandatory paid dependencies. Runs entirely on free tiers for the MVP.

---

## What Makes Traveloop Different

| Differentiator | Description |
| --- | --- |
| **Traveler Profile Engine** | Personalization driven by *who* is traveling — family, senior, couple, solo, group — filters activities, packing lists, and recommendations end-to-end |
| **Regional DNA Mode** | Curated city data surfaces region-specific hidden gems (e.g. Godavari delta boat rides, Amaravathi stupa, Kakinada coast) instead of generic tourist routes |
| **Day-Level Budget Guard** | Per-day cost breakdown with over-budget alerts computed server-side via SQL aggregation — not just a total |
| **AI-Assisted Planning** | Gemini 1.5 Flash generates itineraries, packing lists, and budget estimates with static curated fallback if Gemini is unavailable |
| **Self-Hosted Search** | PostgreSQL `tsvector` + GIN index for city full-text search — no Algolia, no paid search API |
| **Leaflet + OpenStreetMap** | Fully free map with animated polyline route drawing — no Google Maps billing account required |
| **Zero-Auth Public Share** | Public itinerary URL (`/trip/:slug`) readable without login — one click to copy and share |
| **Offline-First Resilience** | Itinerary cached in `localStorage` after first load — readable in poor connectivity |

---

## MVP Features

### Phase 1 — Must Ship

| # | Feature | Differentiator |
| --- | --- | --- |
| 1 | Auth — Email/Password + JWT HttpOnly Cookie | Security baseline |
| 2 | Traveler Profile Engine (Solo / Couple / Family / Senior / Group) | Drives all personalization |
| 3 | Trip CRUD — Name, dates, type, budget cap, cover photo | Core planning loop |
| 4 | Itinerary Builder — Stops, drag-to-reorder, date validation | Core planning loop |
| 5 | City Search — PostgreSQL full-text, self-hosted data | Zero API dependency |
| 6 | Activity Search — Profile-filtered, own DB | Personalized discovery |
| 7 | AI Itinerary Generator (Gemini 1.5 Flash + curated fallback) | WOW factor #1 |
| 8 | Budget & Cost Breakdown — Day-level alerts, Chart.js | WOW factor #2 |
| 9 | Live Map with Route Drawing (Leaflet + OpenStreetMap) | WOW factor #3 |
| 10 | Packing Checklist — AI-seeded by profile + destination season | Practical utility |
| 11 | Public Itinerary Share — Zero-auth read-only URL | Virality hook |
| 12 | Trip Notes / Journal — Per stop, timestamped, autosave | Retention feature |

### Phase 2–4 — Future Scope

| Feature | Phase |
| --- | --- |
| Vlog upload (Cloudinary video) | 2 |
| Real-time collaborative editing (WebSocket) | 2 |
| Regional DNA curated content | 2 |
| Day-level offline mode (Service Worker) | 2 |
| AI chatbot (Gemini conversational) | 3 |
| Network / medical / food location data | 3 |
| Coupon & reward system | 3 |
| Admin analytics dashboard | 4 |
| OAuth (Google / Facebook) | 4 |

---

## Recently Added Platform Features

Traveloop has been extended beyond the original static-data MVP into a dynamic travel intelligence platform. The frontend still uses the existing dashboard, search, city detail, and community screens, but the data layer now supports real enrichment and safer fallbacks.

### Dynamic Destination Intelligence

- Backend destination aggregation layer that keeps third-party calls behind Traveloop APIs.
- Modular providers for Wikipedia, Unsplash, OpenTripMap, OpenWeather, and GeoDB Cities.
- Normalized destination responses with description, image, gallery, weather, attractions, budget estimate, best season, and AI-ready summary.
- DB-backed `destination_enrichments` catalog so the website can serve stable destination content without calling external APIs on every page load.
- Destination deduplication across dashboard Explore cards, Search results, Cities/Explore page, and backend city/trending responses.
- Legacy city image proxy dependency removed from the frontend; image lookups now go through the main Traveloop backend.

### Travel Transport Discovery

- City detail pages now show train, flight, and bus options through the backend transport search endpoint.
- Transport cards include mode-specific icons, operators, timings, duration, indicative INR pricing, and route notes.
- Graceful fallback transport data is generated when live/provider-backed inventory is unavailable, so destination pages do not render empty transport sections.

### AI and Community Enhancements

- New AI trip-plan endpoint that injects user context plus destination intelligence before itinerary generation.
- Community feed responses now include computed AI-style post summaries and auto-tags.
- Similar traveler discovery endpoint for matching users by profile/style.
- Destination chat rooms let authenticated travelers discuss the same place inside Traveloop without exposing email, phone, username, or other personal contact details. The city detail page renders this as a collapsible pop-down chat box with persisted starter messages, generated traveler aliases, polling, and DB-backed user messages scoped by city/destination.

### Destination Catalog Maintenance

- New enrichment script for populating destination data into the database:

```bash
cd backend
npm run destinations:enrich
```

Run this after migrations and seeding when you want to refresh stored destination descriptions, images, attractions, weather, and summaries.

---

## Architecture

Three-tier architecture with strict separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
│  React + Vite + Tailwind CSS  │  Served via Vercel CDN (free)      │
│  Leaflet.js (maps)  │  Chart.js (budgets)  │  Cloudinary Widget    │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS REST + JSON
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                             │
│  Node.js + Express.js on Railway.app (free tier)                   │
│  JWT Middleware  │  Rate Limiter  │  Helmet  │  CORS Guard          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Auth    │  │  Trips   │  │   AI     │  │   Location/Util  │  │
│  │ Service  │  │ Service  │  │ Service  │  │     Services     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
│                        Prisma ORM Layer                             │
└───────────┬──────────────────────────────────┬───────────────────-─┘
            │                                  │
            ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────────────┐
│   DATA LAYER        │          │   EXTERNAL FREE SERVICES     │
│  PostgreSQL via     │          │  Google Gemini Flash (AI)    │
│  Railway.app        │          │  Cloudinary Free (media)     │
│  (Prisma ORM)       │          │  OpenStreetMap (maps)        │
│  Cloudinary URLs    │          │  Resend.com (email)          │
│  stored as TEXT     │          └──────────────────────────────┘
└─────────────────────┘
```

### Request Flow

| Step | Action | Component |
| --- | --- | --- |
| 1 | Browser loads app | Vercel serves React SPA from CDN |
| 2 | `POST /api/v1/auth/login` | Express → bcrypt verify → JWT in HttpOnly cookie |
| 3 | All subsequent requests | Cookie sent automatically; JWT middleware verifies on every route |
| 4 | AI itinerary generation | `POST /api/v1/ai/itinerary` → Gemini API → parsed JSON → response |
| 5 | Photo/video upload | Cloudinary Widget uploads browser-direct → URL saved to DB |
| 6 | Map rendering | `GET /api/v1/maps/trips/:id/route` → Leaflet renders markers + animated polyline |
| 7 | Public share | `GET /api/v1/public/trips/:slug` → no auth → read-only trip JSON |
| 8 | Budget calculation | SQL aggregation server-side → returned as summary object |

=======
# Traveloop — AI Powered Smart Travel Planning Platform

Frontend Deployment: https://traveloop-plum.vercel.app/  
Backend Deployment: https://traveloop-production.up.railway.app/  
API Health Endpoint: https://traveloop-production.up.railway.app/health  

>>>>>>> 710944a (connect real backend auth)
---

# Overview

HEAD
| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite | Fast HMR, concurrent features, 5× faster builds than CRA |
| UI | Tailwind CSS v3 | Utility-first, no runtime, consistent design tokens |
| State | Zustand + React Query | Zustand for UI state; React Query for server state + caching |
| Maps | Leaflet.js + OpenStreetMap | 100% free, no API key, animated polylines supported |
| Charts | Chart.js + react-chartjs-2 | Lightweight, free, supports pie/bar/doughnut for budget screen |
| Backend | Node.js 20 + Express.js | REST-friendly, huge middleware ecosystem |
| ORM | Prisma | Auto-migrations, TypeScript type safety, Prisma Studio for inspection |
| Validation | Zod | Schema-first, TypeScript-native, shared between frontend and backend |
| Database | PostgreSQL 16 | Relational, 3NF schema, `tsvector` full-text search, `CHECK` constraints |
| Auth | JWT + bcrypt + HttpOnly cookie | No vendor lock-in, custom auth, HttpOnly prevents XSS token theft |
| AI | Google Gemini 1.5 Flash | Free: 15 req/min, 1M tokens/day — sufficient for demo and MVP |
| Media | Cloudinary Free | Browser-direct upload, 25 GB storage, signed uploads from backend |
| Email | Resend.com | 3,000 emails/month free, modern API, OTP and welcome email delivery |
| Destination Data | Wikipedia, Unsplash, OpenTripMap, OpenWeather, GeoDB Cities | External enrichment stays server-side, cached/stored in Traveloop DB |
| Frontend Host | Vercel | 100 GB bandwidth/month free, preview deploys on PR |
| Backend Host | Railway.app | Free $5 credit/month, includes PostgreSQL, no spin-down on inactivity |
| Logger | Winston + Morgan | Structured JSON logging, HTTP access log |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) | Contract tests + integration tests |

---

## Monorepo Structure

```
traveloop/
├── backend/                        # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma           # Single source of truth for DB schema
│   │   ├── migrations/             # Auto-generated by prisma migrate
│   │   └── seed.ts                 # 50 cities, 200 activities seed data
│   ├── src/
│   │   ├── server.ts               # Express app factory
│   │   ├── index.ts                # Entry point + graceful shutdown
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT cookie verification
│   │   │   ├── admin.middleware.ts # isAdmin check
│   │   │   ├── validate.middleware.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/               # router · controller · service · repository · dto
│   │   │   ├── trips/
│   │   │   ├── stops/
│   │   │   ├── cities/
│   │   │   ├── activities/
│   │   │   ├── ai/                 # Gemini calls + prompt templates + fallback data
│   │   │   ├── media/
│   │   │   ├── notes/
│   │   │   ├── packing/
│   │   │   └── public/
│   │   ├── utils/
│   │   │   ├── logger.ts           # Winston structured logger
│   │   │   ├── slugify.ts          # nanoid-based URL-safe slug
│   │   │   ├── paginate.ts         # skip/take calculator
│   │   │   └── cloudinary.ts       # Sign upload + delete helper
│   │   └── types/
│   │       └── express.d.ts        # Extend Request: user: { id, email, role, isAdmin }
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── api-tests.http              # Manual REST Client test file
│   └── tsconfig.json
│
├── frontend/                       # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                    # client.ts + per-resource API files
│   │   ├── components/             # ui/ · layout/ · trips/ · itinerary/ · budget/ · shared/
│   │   ├── pages/                  # Auth/ · Dashboard/ · Trips/ · Itinerary/ · Budget/ · Packing/ · Notes/ · Profile/ · Public/
│   │   ├── store/                  # authStore.ts · tripStore.ts (Zustand)
│   │   ├── hooks/                  # useTrip · useBudget · useAI · useMap · useDebounce
│   │   └── lib/                    # queryClient.ts · constants.ts · utils.ts
│   └── tsconfig.json
│
├── shared/
│   └── types/
│       └── index.ts                # Shared DTOs — imported by both frontend and backend
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
│
└── infra/
    ├── docker-compose.yml
    ├── railway.toml
    └── .env.example
=======
Traveloop is a production-oriented full-stack AI-powered travel planning ecosystem designed to simplify and modernize the complete travel workflow — from destination discovery and itinerary generation to budgeting, collaborative planning, trip organization, and public itinerary sharing.

The platform combines AI-assisted trip planning, scalable cloud deployment, modular backend engineering, secure authentication systems, and responsive modern UI/UX into a centralized intelligent travel ecosystem.

Instead of relying on fragmented travel tools across multiple platforms, Traveloop provides a unified intelligent travel experience with extensible architecture and scalable infrastructure.

---

# Architecture

```text
Presentation Layer
React + Vite + Tailwind CSS

        ↓ HTTPS REST API

Application Layer
Node.js + Express.js

        ↓ Prisma ORM

Data Layer
PostgreSQL Database

External Services
- Google Gemini AI
- Cloudinary
- OpenStreetMap
- Wikipedia
- Unsplash
- OpenTripMap
- OpenWeather
- GeoDB Cities
- Resend
- Twilio
>>>>>>> 710944a (connect real backend auth)
```

---

HEAD
## Backend — Setup & Running

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (local or via Railway / Neon)
- npm

### Install

```bash
cd backend
npm install
```

### Configure

Copy `.env.example` to `.env` and fill all required values.

```powershell
cp .env.example .env
```

For Neon, use SSL in the connection string:
=======
# Backend Infrastructure

Traveloop Backend is built using:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

The backend exposes:

```bash
GET /health
```

and versioned API routes under:

```bash
/api/v1
```

---

# Backend Stack

- Runtime: Node.js 20+
- API: Express + TypeScript
- Database: PostgreSQL via Prisma
- Authentication: JWT stored in HttpOnly cookies
- Validation: Zod
- Testing: Jest + Supertest
- Logging: Winston + Morgan

---

# Tech Stack

## Frontend
- React 18
- Vite
- Tailwind CSS
- Zustand
- React Query
- Axios
- Leaflet.js

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- Winston Logger
- Morgan Logger
- Jest + Supertest

## Deployment & Infrastructure
- Railway
- Vercel
- GitHub
- Docker-ready Infrastructure

## External Services
- Google Gemini AI
- Cloudinary
- OpenStreetMap
- Resend Email Service
- Twilio Messaging APIs

---

# Core Features

## Authentication & Security
- Secure JWT authentication using HttpOnly cookies
- Protected route middleware
- Secure origin validation
- Helmet security middleware
- Express rate limiting
- Zod schema validation

## AI-Powered Planning
- AI itinerary generation
- AI enriched trip planning with destination intelligence context
- AI packing recommendations
- AI budget estimation
- Personalized travel workflows
- Gemini AI integration

## Smart Trip Management
- Trip creation and management
- Dynamic itinerary builder
- Destination exploration
- DB-backed destination enrichment catalog
- Dynamic Explore/Cities/Search destination deduplication
- Train, flight, and bus discovery on destination detail pages
- Multi-stop trip organization
- Public itinerary sharing
- Notes and packing management
- Budget tracking workflows

## Community
- Community post feed with likes, bookmarks, and comments
- Computed AI-style summaries for travel posts
- Auto-tagging of posts by destination and travel theme
- Similar traveler suggestions based on traveler profile and travel styles

## Travel Intelligence & Aggregation
- Wikipedia descriptions and destination summaries
- Unsplash destination imagery through backend-only API access
- OpenTripMap attractions and nearby places
- OpenWeather weather snapshots and seasonal context
- GeoDB city metadata and coordinates
- Backend TTL caching plus stored DB enrichment for production stability
- Graceful fallbacks when external APIs, quotas, or network calls fail

## Maps & Location Services
- OpenStreetMap integration
- Leaflet interactive maps
- GeoJSON route visualization
- Destination markers and navigation support

## Media & Cloud Integration
- Cloudinary media uploads
- Signed upload APIs
- Railway backend infrastructure
- Vercel CDN deployment

---

# Backend Modules

Implemented backend modules include:

- Authentication
- Trips
- Stops
- Cities
- Destinations
- Destination Enrichments
- Activities
- Notes
- Packing Items
- Media
- AI Services
- Travel Data Aggregation Services
- Notifications
- Public Trip Sharing
- Maps & Route Services

---

# Environment Configuration

Copy `.env.example` to `.env` and configure the required variables.

```bash
cp .env.example .env
```

For Neon PostgreSQL SSL configuration:
>>>>>>> 710944a (connect real backend auth)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

HEAD
### Database Setup

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Seed data contains **50 cities** and **200 activities**.

### Run

Development (with hot reload):

```powershell
npm run dev
```

Production-style local run:

```powershell
npm run build
npm start
```

The backend listens on `http://localhost:3000` by default.

### Deployment Commands

Build:

```bash
npm run build
```

Production start (Railway / Render):

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run build
npm start
---

# Required Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

JWT_SECRET="minimum-32-character-random-secret"

JWT_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:5173"

NODE_ENV="development"

PORT="3000"

LOG_LEVEL="debug"
>>>>>>> 710944a (connect real backend auth)
```

---

HEAD
## Frontend — Setup & Running

### Install
=======
# Optional Environment Variables

```env
GEMINI_API_KEY="..."

CLOUDINARY_CLOUD_NAME="..."

CLOUDINARY_API_KEY="..."

CLOUDINARY_API_SECRET="..."

RESEND_API_KEY="..."

TWILIO_ACCOUNT_SID="..."

TWILIO_AUTH_TOKEN="..."

TWILIO_PHONE_NUMBER="..."
```

---

# Frontend Environment Variables

```env
VITE_API_URL=https://traveloop-production.up.railway.app/api/v1
```

Optional:

```env
```

---

# API Infrastructure

The backend exposes structured REST APIs for:

- Authentication
- Trips
- Stops
- Activities
- Cities
- Media
- Packing
- Notes
- Maps
- AI Services
- Notifications

API response contracts follow standardized formats for:
- Resource responses
- Paginated data
- Error handling
- Metadata management

---

# Authentication System

Traveloop uses secure JWT authentication stored inside HttpOnly cookies.

Features include:
- Secure cookie-based authentication
- Protected route middleware
- Ownership-based resource access
- Secure production cookie strategy
- Origin validation for state-changing requests

---

# AI Integration

Traveloop integrates Google Gemini AI for:
- Dynamic itinerary generation
- Packing list generation
- Budget estimation workflows
- Personalized destination planning

Fallback workflows are implemented to ensure platform stability even when external AI services are unavailable.

---

# Database & ORM

Traveloop uses PostgreSQL with Prisma ORM.

Key implementation features:
- Prisma schema migrations
- Seeded city and activity datasets
- Relationship modeling
- Typed database access
- Scalable query workflows

---

# Notification Services

Integrated notification systems include:
- Email notifications via Resend
- SMS notifications
- WhatsApp notifications
- OTP-based password reset workflows

---

# Testing & Validation

## Backend Testing
- Jest unit testing
- Supertest API testing
- Manual API contract testing
- Zod schema validation

## Security Standards
- Helmet middleware
- Secure cookies
- Strict CORS policies
- Password hashing
- Request rate limiting

---

# Monorepo Structure

```text
traveloop/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
├── backend/
│   ├── prisma/
│   ├── src/modules/
│   ├── middleware/
│   ├── utils/
│   └── shared/
│
├── devops/
│   ├── docker-compose.yml
│   └── deployment configurations
│
└── README.md
```

---

# Deployment Workflow

## Frontend Deployment
- Platform: Vercel
- Build System: Vite
- CDN-based static hosting

## Backend Deployment
- Platform: Railway
- Express production server
- PostgreSQL integration

---

# Current Implementation Status

## Implemented
- Authentication system
- Trips management
- Stops management
- Cities APIs
- Activities APIs
- Public itinerary sharing
- Budget aggregation
- Notes system
- Packing management
- Media upload infrastructure
- AI itinerary generation
- AI budget estimation
- AI packing workflows
- OpenStreetMap route services
- Email/SMS/WhatsApp notifications
- Production deployment infrastructure
- Cookie authentication
- API contract testing

## Planned Extensions
- Advanced analytics dashboard
- Offline support
- Real-time collaboration
- AI chatbot workflows
- PDF itinerary exports
- Rewards & coupons system
- Extended admin analytics

---

# Installation

## Frontend
>>>>>>> 710944a (connect real backend auth)

```bash
cd frontend
npm install
HEAD
```

### Configure

```env
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

> `VITE_*` variables are bundled into the client build. Never put secrets in `VITE_` prefixed vars.

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
=======
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
>>>>>>> 710944a (connect real backend auth)
```

---

HEAD
## Environment Variables

### Backend (Required)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Use `sslmode=require` for Neon. |
| `JWT_SECRET` | Minimum 32-character random string. Rotate quarterly. |
| `JWT_EXPIRES_IN` | `"7d"` for MVP. |
| `FRONTEND_URL` | Exact deployed frontend origin for CORS whitelist. |
| `NODE_ENV` | `"development"` or `"production"`. |
| `PORT` | Defaults to `3000`. Railway injects automatically. |

### Backend (Optional / Feature-Specific)

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio key. If missing, AI endpoints return curated fallback data. |
| `UNSPLASH_ACCESS_KEY` | Unsplash access key for destination hero images and galleries. Backend only. |
| `OPENTRIPMAP_API_KEY` | OpenTripMap key for attractions, monuments, and nearby places. Backend only. |
| `OPENWEATHER_API_KEY` | OpenWeather key for current destination weather. Backend only. |
| `GEODB_API_KEY` | RapidAPI GeoDB Cities key for city metadata and coordinates. Backend only. |
| `CLOUDINARY_CLOUD_NAME` | For Cloudinary signature generation. |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard. |
| `CLOUDINARY_API_SECRET` | Never expose to the client. |
| `RESEND_API_KEY` | Resend.com key for OTP and welcome emails. |
| `RESEND_FROM_EMAIL` | e.g. `Traveloop <no-reply@traveloop.me>` |
| `LOG_LEVEL` | `"debug"` for development, `"info"` for production. |
| `TWILIO_ACCOUNT_SID` | Optional — SMS / WhatsApp notifications. |
| `TWILIO_AUTH_TOKEN` | Optional. |
| `TWILIO_SMS_FROM` | Optional. |
| `TWILIO_WHATSAPP_FROM` | Optional. |
### Frontend (Required)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend Railway URL injected at Vercel build time. |
| `VITE_CLOUDINARY_CLOUD_NAME` | For the Cloudinary upload widget (not secret). |

Do not commit `.env`. It is already in `.gitignore`.

---

## Database

PostgreSQL 16. 3NF normalized schema. All foreign keys enforced at the database level. Soft deletes on trips only (`deleted_at` nullable timestamp). Indexes on all FK columns and frequently filtered columns.

### Core Tables

| Table | Key Columns |
| --- | --- |
| `users` | `id` (UUID PK), `email` (UNIQUE), `password_hash`, `traveler_profile` ENUM, `is_admin`, `otp_hash`, `otp_expires_at` |
| `trips` | `id`, `user_id` (FK), `title`, `start_date`, `end_date`, `trip_type` ENUM, `budget_cap_usd`, `vibe` ENUM, `is_public`, `public_slug` (UNIQUE), `status` ENUM, `deleted_at` |
| `stops` | `id`, `trip_id` (FK), `city_id` (FK), `order_index`, `arrival_date`, `departure_date`, `accommodation_name`, `accommodation_cost` |
| `cities` | `id`, `name`, `state`, `country`, `latitude`, `longitude`, `cost_index` ENUM, `is_regional_gem`, `search_vector` TSVECTOR |
| `destination_enrichments` | `id`, `city_id` (UNIQUE FK), `description`, `wiki_url`, `hero_image_url`, `gallery` JSONB, `attractions` JSONB, `weather` JSONB, `budget_estimate` JSONB, `ai_summary`, `source_metadata`, `refreshed_at` |
| `activities` | `id`, `city_id` (FK), `name`, `category`, `trip_type_tags[]`, `estimated_cost_usd`, `duration_hours` |
| `stop_activities` | `id`, `stop_id` (FK), `activity_id` (FK), `scheduled_time`, `actual_cost_usd`, `is_completed` |
| `packing_items` | `id`, `trip_id` (FK), `name`, `category` ENUM, `is_packed`, `ai_suggested` |
| `notes` | `id`, `trip_id` (FK), `stop_id` (FK nullable), `title`, `content`, `note_type`, `is_important` |
| `media` | `id`, `trip_id` (FK), `stop_id` (FK nullable), `media_type` ENUM, `cloudinary_url`, `cloudinary_id` |

### Key Design Decisions

- `cities.search_vector`: `TSVECTOR` generated column with GIN index — full-text city search with no Algolia dependency.
- `destination_enrichments`: DB-backed travel intelligence cache for stable dashboard/search/detail content without repeated third-party API calls.
- `trips.public_slug`: UNIQUE constraint enforces URL uniqueness.
- `stops.order_index`: indexed for fast `ORDER BY` per trip, updated via bulk reorder endpoint.
- Budget aggregation: computed server-side via SQL aggregation across `stop_activities` and `stops.accommodation_cost`.
- Prisma schema is the single source of truth — migrations are auto-generated, never edited manually.

### Prisma Commands

Development migration:

```powershell
npm run prisma:migrate
```

Production migration:

```powershell
npm run prisma:deploy
```

Seed:

```powershell
npm run prisma:seed
```

Destination enrichment:

```powershell
npm run destinations:enrich
```

The enrichment script populates `destination_enrichments` from the travel aggregation layer. It refreshes stored descriptions, images, galleries, attractions, weather snapshots, budget estimates, source metadata, and AI summaries. The app reads this stored catalog first and falls back to live providers only when stored enrichment is missing.

---

## API Overview

Base URL: `http://localhost:3000/api/v1`

All endpoints follow this response envelope:

```json
// Single resource
{ "data": {}, "meta": null }

// List resource
{ "data": [], "meta": { "total": 1, "page": 1, "limit": 20 } }

// Error
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE", "details": null }
```

Deletes return `204 No Content`.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | DB status and server uptime |
| `GET` | `/api/v1/docs` | No | Lightweight API docs page |
| `GET` | `/api/v1/docs/openapi.json` | No | OpenAPI JSON summary |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Create account and set auth cookie |
| `POST` | `/api/v1/auth/login` | No | Authenticate and set auth cookie |
| `POST` | `/api/v1/auth/logout` | Yes | Clear auth cookie |
| `GET` | `/api/v1/auth/me` | Yes | Return current user |
| `POST` | `/api/v1/auth/forgot-password` | No | Generate and email OTP |
| `POST` | `/api/v1/auth/reset-password` | No | Reset password with OTP |

Register body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "name": "Test User",
  "avatarUrl": "https://example.com/avatar.jpg",
  "travelerProfile": "solo"
}
```

Login body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Reset password body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### Cities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cities` | No | List and search deduplicated cities with stored enrichment when available |
| `GET` | `/api/v1/cities/:id` | No | City detail with activities and destination enrichment fields |

Query params: `q`, `country`, `region`, `costIndex`, `page`, `limit`

```
GET /api/v1/cities?q=delhi&page=1&limit=20
```

### Destination Intelligence

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/destinations/trending` | No | Trending deduplicated destinations for dashboard Explore cards |
| `GET` | `/api/v1/destination/:name` | No | Normalized destination intelligence by city/name |
| `GET` | `/api/v1/destinations/:cityId/intelligence` | No | Backward-compatible city intelligence endpoint |
| `GET` | `/api/v1/nearby?lat=&lon=&radiusKm=` | No | Nearby destination recommendations from coordinates |
| `GET` | `/api/v1/weather/:city` | No | Current or stored weather context for a city |
| `GET` | `/api/v1/destinations/transport/search` | No | Flight/train/bus transport options with fallback data |

Normalized destination responses include:

```json
{
  "name": "Goa",
  "country": "India",
  "description": "Destination summary from stored enrichment or Wikipedia.",
  "image": "https://...",
  "gallery": ["https://..."],
  "weather": { "temp": 31, "condition": "Sunny" },
  "topAttractions": [],
  "budgetEstimate": { "budget": 8000, "comfort": 16000, "luxury": 36000, "currency": "INR" },
  "bestSeason": "Nov-Feb",
  "aiSummary": "Short practical travel intelligence summary.",
  "sources": {}
}
```

Transport query example:

```text
GET /api/v1/destinations/transport/search?origin=Delhi&destination=Goa&departureDate=2026-06-01&mode=all
```

### Community Enhancements

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/community` | Optional | Community feed with likes, bookmarks, comments, computed summaries, and auto-tags |
| `POST` | `/api/v1/community/:postId/like` | Yes | Toggle like and return refreshed post state |
| `POST` | `/api/v1/community/:postId/comments` | Yes | Add a comment and return refreshed post state |
| `GET` | `/api/v1/community/similar-travelers` | Yes | Suggest travelers with similar profile/style metadata |
| `GET` | `/api/v1/community/place-chat?cityId=&destinationName=` | Yes | List recent alias-only messages for a destination chat room |
| `POST` | `/api/v1/community/place-chat` | Yes | Send a message to a destination chat room without exposing personal user info |

Destination chat message body:

```json
{
  "cityId": "city-uuid",
  "destinationName": "Jaipur",
  "body": "Anyone planning the fort circuit tomorrow morning?"
}
```

Destination chat responses intentionally expose only `authorAlias`, `isOwn`, `isSystem`, `destinationName`, `body`, and timestamps. They do not include email addresses, phone numbers, usernames, or contact links. If a destination has no existing messages, Traveloop persists a few generic starter messages under system traveler aliases so rooms never render as empty.

### Activities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/activities` | No | List and search activities |
| `GET` | `/api/v1/activities/:id` | No | Activity detail |
| `POST` | `/api/v1/trips/:id/stops/:stopId/activities` | Yes | Assign activity to stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId/activities/:saId` | Yes | Remove activity from stop |

Activity query params: `cityId`, `category`, `maxCost`, `tripType`, `q`, `page`, `limit`

Assign activity body:

```json
{
  "activityId": "uuid",
  "scheduledTime": "14:30",
  "actualCostUsd": 25
}
```

Only `activityId` is required.

### Trips

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips` | Yes | List owned trips |
| `POST` | `/api/v1/trips` | Yes | Create trip |
| `GET` | `/api/v1/trips/:id` | Yes | Trip detail with stops |
| `PUT` | `/api/v1/trips/:id` | Yes | Update trip |
| `DELETE` | `/api/v1/trips/:id` | Yes | Soft delete trip |
| `PUT` | `/api/v1/trips/:id/publish` | Yes | Toggle `is_public` |
| `GET` | `/api/v1/trips/:id/budget` | Yes | Day-level budget summary |
| `GET` | `/api/v1/trips/:id/notes` | Yes | List notes |
| `POST` | `/api/v1/trips/:id/notes` | Yes | Create note |
| `PUT` | `/api/v1/trips/:id/notes/:noteId` | Yes | Update note |
| `DELETE` | `/api/v1/trips/:id/notes/:noteId` | Yes | Delete note |
| `GET` | `/api/v1/trips/:id/packing-items` | Yes | List packing items |
| `POST` | `/api/v1/trips/:id/packing-items` | Yes | Create packing item |
| `PUT` | `/api/v1/trips/:id/packing-items/:itemId` | Yes | Update packing item |
| `DELETE` | `/api/v1/trips/:id/packing-items/:itemId` | Yes | Delete packing item |
| `GET` | `/api/v1/trips/:id/media` | Yes | List media records |
| `POST` | `/api/v1/trips/:id/media` | Yes | Save Cloudinary URL after upload |
| `DELETE` | `/api/v1/trips/:id/media/:mediaId` | Yes | Delete media record |

Trip list query params: `status`, `sort`, `search`, `page`, `limit`

Create trip body:

```json
{
  "title": "Rajasthan Loop",
  "description": "Optional description",
  "coverPhotoUrl": "https://example.com/photo.jpg",
  "startDate": "2026-06-01",
  "endDate": "2026-06-05",
  "tripType": "solo",
  "budgetCapUsd": 500,
  "vibe": "comfort"
}
```

Required: `title`, `startDate`, `endDate`, `tripType`

### Stops

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips/:id/stops` | Yes | List stops ordered by index |
| `POST` | `/api/v1/trips/:id/stops` | Yes | Add stop |
| `PUT` | `/api/v1/trips/:id/stops/:stopId` | Yes | Update stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId` | Yes | Remove stop |
| `PUT` | `/api/v1/trips/:id/stops/reorder` | Yes | Bulk reorder stops |

Create stop body:

```json
{
  "cityId": "uuid",
  "orderIndex": 0,
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-03",
  "notes": "Optional",
  "accommodationName": "Hotel name",
  "accommodationCost": 120
}
```

Reorder body:

```json
{
  "stopOrders": [
    { "id": "uuid", "orderIndex": 0 }
  ]
}
```

### Maps

```
GET /api/v1/maps/trips/:id/route
```

Returns Leaflet/OpenStreetMap markers and GeoJSON route data for all stops in an owned trip. Uses OpenStreetMap — no Google Maps API key required.

```json
{
  "data": {
    "tripId": "uuid",
    "provider": "openstreetmap",
    "tileLayerUrl": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "markers": [
      {
        "stopId": "uuid",
        "cityId": "uuid",
        "label": "Jaipur, India",
        "orderIndex": 0,
        "coordinates": { "latitude": 26.9124, "longitude": 75.7873 }
      }
    ],
    "routeGeoJson": {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[75.7873, 26.9124]] }
    }
  },
  "meta": null
}
```

### Public

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/trips/:slug` | No | Read-only public trip by slug |

### Notifications (Admin Only)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/notifications/email` | Send an email via Resend |
| `POST` | `/api/v1/notifications/sms` | Send an SMS via Twilio |
| `POST` | `/api/v1/notifications/whatsapp` | Send a WhatsApp message via Twilio |

Email body:

```json
{
  "to": "user@example.com",
  "subject": "Trip reminder",
  "text": "Your trip starts tomorrow.",
  "html": "<p>Your trip starts tomorrow.</p>"
}
```

SMS / WhatsApp body:

```json
{
  "to": "+15551234567",
  "message": "Your Traveloop trip starts tomorrow."
}
```

---

## Auth & Cookies

- JWT is stored in an HttpOnly cookie named `token`. Never in `localStorage`.
- Local development cookie: `SameSite=Lax`.
- Production cookie: `SameSite=Strict; Secure`.
- JWT payload: `{ sub: userId, email, role: "user"|"admin", isAdmin, iat, exp }`.
- Token TTL: 7 days for MVP.
- Password reset: 6-digit numeric OTP, bcrypt-hashed, expires in 15 minutes.
- All protected routes verify JWT via `authMiddleware` which attaches `req.user`.
- Admin routes additionally pass `adminMiddleware` which checks `req.user.isAdmin`.
- Resource ownership: every mutation verifies `resource.userId === req.user.id`.

Frontend requests must include credentials:

```ts
fetch(`${API_URL}/api/v1/auth/me`, {
  credentials: 'include'
});
```

CORS is configured with:

```ts
origin: process.env.FRONTEND_URL
credentials: true
```

State-changing requests (`POST`, `PUT`, `DELETE`) are protected by an origin guard — they must come from `FRONTEND_URL`.

---

## AI Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/ai/trip-plan` | Yes | Generate an enriched trip plan using user context plus destination intelligence |
| `POST` | `/api/v1/ai/itinerary` | Yes | Generate itinerary with Gemini 1.5 Flash or curated fallback |
| `POST` | `/api/v1/ai/packing` | Yes | Generate packing list by profile + destination season |
| `POST` | `/api/v1/ai/budget-estimate` | Yes | Per-day budget estimate by vibe |

Itinerary body:

```json
{
  "prompt": "7-day family trip to Rajasthan",
  "tripType": "family",
  "budgetStyle": "comfort",
  "durationDays": 7
}
```

Packing body:

```json
{
  "destinations": ["city-uuid-1", "city-uuid-2"],
  "travelDates": { "start": "2026-11-01", "end": "2026-11-08" },
  "tripType": "family",
  "travelerProfile": "family"
}
```

Budget estimate body:

```json
{
  "cities": ["city-uuid-1"],
  "durationDays": 5,
  "budgetStyle": "backpacker"
}
```

If `GEMINI_API_KEY` is missing or Gemini fails, all AI endpoints return curated static fallback data. No endpoint throws a 500 due to AI unavailability.

`/api/v1/ai/trip-plan` extends the itinerary workflow by injecting destination metadata, current/stored weather, attraction data, budget context, user preferences, travel style, interests, and location context before generation.

AI endpoints are rate-limited to **20 requests/hour per authenticated user** to protect Gemini quota.

---

## Shared Types Contract

All DTOs are defined in `shared/types/index.ts`. Both the frontend and backend import from this single file. No drift permitted.

Key types:

```ts
export type TravelerProfile = 'solo' | 'couple' | 'family' | 'senior' | 'group';
export type TripType = 'solo' | 'couple' | 'family' | 'group' | 'adventure' | 'pilgrimage' | 'honeymoon' | 'business';
export type TripStatus = 'planning' | 'confirmed' | 'ongoing' | 'completed';
export type BudgetVibe = 'backpacker' | 'comfort' | 'luxury';
export type CostIndex = 'low' | 'medium' | 'high';

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta | null;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string[]> | null;
}

export interface BudgetSummary {
  tripId: string;
  totalBudgetCapUsd: number | null;
  totalSpentUsd: number;
  byDay: DayBudget[];
  byCategory: CategoryBudget[];
  isOverBudget: boolean;
  remainingUsd: number | null;
}
```

Full type definitions are in `shared/types/index.ts`.

---

## Engineering Standards

### Architecture Rules

- Controller → Service → Repository pattern strictly enforced.
- No DB queries in route handlers or controllers. No business logic in repositories.
- No BaaS (Firebase, Supabase auth, PlanetScale). PostgreSQL with Prisma only.
- All external API keys live in backend `.env` only. Frontend never receives secrets.

### Naming Conventions

| Artifact | Convention | Example |
| --- | --- | --- |
| Files & folders | kebab-case | `trip-service.ts`, `auth.controller.ts` |
| Variables & functions | camelCase | `getUserById`, `tripData` |
| Classes & interfaces | PascalCase | `TripService`, `CreateTripDto` |
| Constants | SCREAMING_SNAKE_CASE | `JWT_SECRET`, `MAX_RETRY` |
| DB columns | snake_case | `user_id`, `created_at` |
| Prisma models | PascalCase singular | `Trip`, `Stop`, `User` |
| React components | PascalCase | `TripCard`, `BudgetBar` |
| React hooks | camelCase, `use` prefix | `useTrip`, `useBudget` |
| API routes | kebab-case nouns | `/api/v1/trip-notes` |
| Git branches | kebab-case | `feat/trip-crud`, `fix/auth-cookie` |

### Git Branching

```
main          → production-ready; protected; requires PR + passing CI
develop       → integration branch; all feature branches merge here first
feat/<topic>  → new features   (e.g. feat/trip-crud, feat/ai-itinerary)
fix/<topic>   → bug fixes       (e.g. fix/auth-cookie, fix/budget-calc)
chore/<topic> → tooling/config  (e.g. chore/eslint-setup)
release/<v>   → release prep    (e.g. release/v1.0.0)
```

### Commit Conventions

```
feat(auth): implement JWT HttpOnly cookie login
fix(trips): correct ownership check in delete handler
chore(docker): add multi-stage Dockerfile for backend
test(budget): add unit tests for day-level aggregation
```

### TypeScript Standards

- `"strict": true` in `tsconfig.json` — no exceptions.
- No `any` — use `unknown` + type narrowing or generics.
- All function parameters and return types explicitly typed.
- Prefer `interface` for object shapes; `type` for unions and aliases.
- Zod schemas on backend; infer types via `z.infer<typeof Schema>`.

### Linting & Formatting

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/strict"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error"
  }
}

// .prettierrc
{ "semi": true, "singleQuote": true, "tabWidth": 2, "printWidth": 100 }
```

```json
// package.json scripts
"lint": "eslint src --ext .ts,.tsx --max-warnings 0",
"typecheck": "tsc --noEmit",
"format": "prettier --write src/**/*.{ts,tsx}"
```

### Rate Limiting

| Tier | Limit | Window | Applied To |
| --- | --- | --- | --- |
| Global | 200 requests | 15 minutes per IP | All routes |
| Auth | 10 requests | 15 minutes per IP | `/auth/login`, `/auth/register`, `/auth/forgot-password` |
| AI | 20 requests | 1 hour per user | `/ai/*` |

Rate limit errors return `429` with `Retry-After` header and error code `RATE_LIMIT_EXCEEDED`.

### Security Baseline

- Helmet.js is the first middleware registered on Express.
- CORS: whitelist `FRONTEND_URL` only. No wildcard (`*`). `credentials: true`.
- SQL injection: impossible via Prisma parameterized queries — no raw string interpolation.
- XSS: React auto-escapes JSX. HttpOnly cookie blocks JS token access.
- bcrypt: minimum 12 salt rounds for all password hashing.
- File uploads: type whitelist (jpeg / png / webp / mp4 only) + max 5 MB client-side + Cloudinary.
- All admin routes check `req.user.isAdmin` server-side — never trust client claims.

### Logging Standards

```ts
// ✅ Correct — structured, no PII
logger.info('Trip created', { tripId, userId, action: 'CREATE_TRIP' });
logger.error('DB write failed', { error: err.message, stack: err.stack, tripId });

// ❌ Never log secrets or PII
logger.info('User logged in', { email: user.email }); // PII
logger.info('Token', { jwt: token });                  // Secret
```

---

## Testing

### Backend

Build check:

```powershell
npm run build
```

All automated tests:

```powershell
npm test
```

Serially (cleaner output):

```powershell
npm test -- --runInBand
```

Manual API testing:

1. Install the VS Code REST Client extension.
2. Start the backend with `npm run dev`.
3. Open `api-tests.http`.
4. Run requests from top to bottom.

The manual file creates a user, logs in, stores the auth cookie in the REST Client session, then tests all protected routes in order.

### Coverage Targets

| Layer | Framework | Scope | Target |
| --- | --- | --- | --- |
| Backend unit | Jest + ts-jest | `auth.service`, `budget.service`, `ai.service` | ≥ 80% on services |
| Backend integration | Jest + Supertest | All API endpoints with real test DB | All happy + error paths |
| Frontend unit | Vitest + Testing Library | Hooks: `useTrip`, `useBudget`; utils | ≥ 70% on hooks |
| Frontend E2E | Playwright (Phase 2) | Login → Create Trip → AI Generate | Critical user flows |

---

## Deployment

### Infrastructure

| Service | Purpose | Cost |
| --- | --- | --- |
| Vercel | Frontend — React SPA, preview deploys, CDN | Free (100 GB BW/month) |
| Railway.app | Backend Express API + PostgreSQL | Free ($5 credit/month, no spin-down) |
| Namecheap | Custom domain — `traveloop.me` | Free 1 year via GitHub Student Developer Pack |
| Cloudinary | Media storage and signed uploads | Free (25 GB storage) |
| Resend.com | Transactional email (OTP, welcome) | Free (3,000 emails/month) |
| Google Gemini | AI itinerary, packing, and budget generation | Free (1M tokens/day) |
| OpenStreetMap | Map tiles and GeoJSON route rendering | Free, unlimited |

### Custom Domain Setup

1. Apply for the [GitHub Student Developer Pack](https://education.github.com/pack).
2. Redeem the Namecheap `.me` domain — register `traveloop.me`.
3. Deploy frontend to Vercel; add `traveloop.me` as a custom domain in the Vercel dashboard.
4. Deploy backend to Railway; expose as `api.traveloop.me` via custom domain CNAME.
5. Add PostgreSQL as a Railway plugin — connection string injected automatically as `DATABASE_URL`.
6. Configure GitHub Actions in `.github/workflows/` for push-to-main auto-deploy of both services.
7. Run `npm run prisma:deploy` via Railway's start command.

### CI/CD

Three workflow files in `.github/workflows/`:

- `ci.yml` — lint, typecheck, and test on every pull request.
- `deploy-backend.yml` — deploy to Railway on merge to `main`.
- `deploy-frontend.yml` — deploy to Vercel on merge to `main`.

### Production Notes

- Use Neon or Railway for hosted PostgreSQL. Do not use `localhost` in production.
- Keep `sslmode=require` in the Neon database URL.
- Run production migrations with `npm run prisma:deploy`, not `prisma:migrate`.
- Use HTTPS in production so secure cookies work.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Rotate `JWT_SECRET` if it was ever shared or committed accidentally.

---

## Roadmap

| Phase | Features |
| --- | --- |
| **1 — MVP (Now)** | Auth, Traveler Profile Engine, Trip CRUD, Itinerary Builder, City/Activity Search, AI Itinerary, Budget Guard, Leaflet Map, Packing Checklist, Public Share, Trip Notes |
| **2** | Vlog uploads (Cloudinary video), Real-time collaborative editing (WebSocket), Regional DNA curated content, Offline mode (Service Worker + localStorage) |
| **3** | AI chatbot (Gemini conversational), Network/medical/food location data, Coupon & reward system |
| **4** | Admin analytics dashboard, OAuth (Google / Facebook), Mobile app (React Native, same backend) |

---

*Traveloop — Built for real travelers. Backed by real data. Deployed like a real product.*
=======
# Production Notes

- Railway hosts backend infrastructure and PostgreSQL integration
- Vercel serves frontend assets through CDN deployment
- Prisma manages schema migrations and ORM workflows
- Gemini AI powers intelligent travel planning
- Cloudinary handles scalable media storage
- OpenStreetMap removes dependency on paid map providers

---

# License

Developed as part of an AI-powered intelligent travel planning platform initiative focused on scalable cloud-native software engineering and modern full-stack architecture.
>>>>>>> 710944a (connect real backend auth)
