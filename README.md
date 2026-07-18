# Placely

Centralized placement portal for Indian engineering colleges. Production-grade React SaaS.

This iteration upgrades the stack from React Context to **Redux Toolkit + redux-persist**, and ships 8 new features that demonstrate production-readiness (bookmarks, command palette, settings, CSV export, activity feed, recommendations, error boundary, resume upload).

See `Placely_Production_Upgrade.docx` (shipped alongside this folder) for the full feature-by-feature breakdown with the *why* behind every decision.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 + CSS variables |
| Routing | React Router v6 (lazy loaded) |
| **State** | **Redux Toolkit** (was Context API) |
| **Persistence** | **redux-persist** (localStorage backend) |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Charts | Recharts |
| Build | Vite 5 (Rollup, manual chunks) |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Opens at `http://localhost:5173`. Demo credentials:

| Role | Email |
|---|---|
| Student | `divyansh@gmail.com` |
| Admin | `divyansh@admin.com` |

Any non-empty password works.

---

## Folder structure

```
src/
├── store/                          # ⭐ Redux Toolkit
│   ├── index.js                    # store + persistor setup
│   ├── hooks.js                    # useAuth, useAppData, useBookmarks, etc
│   └── slices/                     # 8 slices, one per domain
│       ├── themeSlice.js
│       ├── authSlice.js
│       ├── applicationsSlice.js
│       ├── jobsSlice.js
│       ├── notificationsSlice.js
│       ├── bookmarksSlice.js       # NEW
│       ├── activityFeedSlice.js    # NEW
│       └── settingsSlice.js        # NEW
├── components/
│   ├── ui/                         # Button, Card, Badge, Modal, etc
│   ├── layout/                     # Sidebar, Topbar, Shell, ThemeApplier
│   ├── feedback/                   # Preloader, ErrorBoundary, Toast, Skeleton
│   ├── domain/                     # JobCard, AlumniCard, StatusStepper
│   └── CommandPalette.jsx          # NEW — ⌘K global search
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── student/                    # Dashboard, Jobs, Companies, Alumni, Profile
│   │   ├── BookmarksPage.jsx       # NEW
│   │   └── SettingsPage.jsx        # NEW
│   └── admin/                      # AdminDashboard, AdminJobs, Applicants
│       └── ActivityFeedPage.jsx    # NEW
├── context/
│   └── ToastContext.jsx            # Transient UI state stays in Context
├── lib/
│   ├── eligibilityEngine.js
│   ├── recommendations.js          # NEW — algorithmic job scoring
│   └── csv.js                      # NEW — RFC 4180 encoder
├── data/mockData.js                # API-shaped mock data
├── routes/                         # AppRouter, ProtectedRoute
├── styles/                         # tokens.css, globals.css
├── App.jsx                         # Provider + PersistGate + ErrorBoundary
└── main.jsx
```

---

## What's new (8 features)

### Architecture
1. **Redux Toolkit** — global state across 8 slices. Better DevTools, fewer wasted renders, scales to 50+ components.
2. **redux-persist** — selective localStorage persistence. Refresh no longer destroys user state.
3. **Error Boundary** — catches render errors with a branded fallback instead of white screen.

### Features
4. **Bookmarks** — save jobs for later. Dedicated `/bookmarks` page. Persisted.
5. **Command Palette (⌘K)** — global keyboard-first search across jobs, companies, alumni, pages.
6. **Settings page** — notification prefs, theme, density, reduced motion, danger zone.
7. **CSV Export** — admin can export jobs/applicants tables as RFC 4180-compliant CSV.
8. **Activity Feed** — admin audit log with kind filters (jobs/applications/stage changes).
9. **Recommended Jobs** — algorithmic dashboard widget scoring jobs by eligibility, industry, package, location.
10. **Resume Upload** — drag-and-drop UI on profile with simulated AI parsing.

---

## Bundle (production build)

| Chunk | Raw | Gzip |
|---|---|---|
| main (`index`) | 82 KB | 28 KB |
| react-vendor | 165 KB | 54 KB |
| framer-motion | 115 KB | 38 KB |
| icons (lucide) | 23 KB | 5 KB |
| recharts (lazy, admin only) | 414 KB | 110 KB |
| Per-page chunks | 3–10 KB each | 1–3 KB each |

Code-split by route, lazy-loaded on demand.

---

## State persistence whitelist

Stored in `localStorage` under key `placely:root`:

- ✅ `theme` — light/dark preference
- ✅ `auth` — user + role (so refresh doesn't log you out)
- ✅ `applications` — student's applied jobs
- ✅ `bookmarks` — saved job IDs
- ✅ `settings` — notification prefs, density, motion
- ❌ `jobs`, `notifications`, `activityFeed` — server-owned, refetched on load

---

## How to verify each feature is working

| Feature | Steps |
|---|---|
| Redux state | Open Redux DevTools (Chrome ext) → see all slices |
| Persistence | Make any change → refresh → state restored |
| Bookmarks | Hover job card → click bookmark icon → check `/bookmarks` |
| Command palette | Press `⌘K` / `Ctrl+K` → type → navigate |
| Settings | `/settings` → toggle anything → refresh → preserved |
| CSV export | Admin → Jobs/Applicants → "Export CSV" button |
| Activity feed | Admin → Activity feed → filter by kind |
| Recommended jobs | Student dashboard → "Recommended for you" widget |
| Error boundary | Trigger a render error → see fallback |
| Resume upload | Profile → scroll to resume zone → drag a PDF |

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR at `:5173` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint check |

---

## Production roadmap (next 3 sprints)

| Sprint | Work |
|---|---|
| 1 | Replace mockData with axios calls; add RTK Query for server caching |
| 1 | Real JWT auth (HTTP-only cookies, refresh token rotation) |
| 2 | Real resume parser integration (Affinda or in-house LLM endpoint) |
| 2 | Sentry integration in `ErrorBoundary.componentDidCatch` |
| 3 | PostHog product analytics — track ⌘K usage, bookmark frequency |
| 3 | WebSocket-driven activity feed for real-time admin visibility |
| Always | Playwright E2E tests for apply, create-job, export flows |
