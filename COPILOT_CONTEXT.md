# StreetLens Admin Dashboard — Copilot Context File

Paste this file into a new Copilot chat to restore full context.

---

## Project Overview
Admin dashboard for **StreetLens** — a civic issue reporting app where citizens report road/infrastructure problems via a Flutter mobile app. Municipal admins manage those reports here.

- **Framework:** Next.js 14.2.3 (App Router), TypeScript
- **Styling:** Tailwind CSS 3.4.1 + clsx
- **Backend:** Firebase (same project as Flutter app) — Firestore + Firebase Auth
- **Icons:** lucide-react 0.376.0
- **Dates:** date-fns 3.6.0
- **Package manager:** pnpm (NOT npm) — use `pnpm install` and `pnpm dev`
- **Run command:** `pnpm dev` → http://localhost:3000
- **Path alias:** `@/*` maps to `./src/*`

---

## Firebase Config
- **Project:** streetlens-8a15c
- **apiKey:** (stored in `.env.local` — never commit this file)
- **appId:** (stored in `.env.local` — never commit this file)
- Credentials live in `.env.local` (gitignored)
- **Firestore collections:**
  - `/issues/{issueId}` — fields: user_id, image_url, category, description, latitude, longitude, status, upvotes, assigned_worker, created_at, updated_at, user_name
  - `/users/{uid}` — fields: user_id, name, email, phone, role, created_at
- **Images:** Stored on Cloudinary, URLs saved in `image_url` field

---

## Auth & Role System
- Firebase Auth is shared with the Flutter citizen app
- Logic in `src/contexts/AuthContext.tsx`:
  - No `/users/{uid}` doc → manually created admin → **ALLOWED**
  - `role = "admin"` → **ALLOWED**
  - `role = "citizen"` → **BLOCKED** (signed out, redirected to /login with error)
- Admins are created manually in Firebase Auth console

---

## Pages Built

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Redirects to /dashboard |
| `/login` | `src/app/login/page.tsx` | Email/password login with show/hide password |
| `/dashboard` | `src/app/dashboard/page.tsx` | Stats cards + category bar chart + ResolutionStats + recent issues table |
| `/issues` | `src/app/issues/page.tsx` | Full issues list with search (description/reporter/category) + status filter + category filter |
| `/issues/[id]` | `src/app/issues/[id]/page.tsx` | Issue detail: photo, GPS link, info table, status selector, worker assign, Save button, **Print Report button** |
| `/citizens` | `src/app/citizens/page.tsx` | All citizens table with total/resolved/pending issue counts, searchable |
| `/citizens/[uid]` | `src/app/citizens/[uid]/page.tsx` | Citizen profile: avatar, name, email, phone, join date, stats row, full list of their issues |

---

## Components Built

| Component | File | Description |
|-----------|------|-------------|
| Sidebar | `src/components/Sidebar.tsx` | Nav: Dashboard, All Issues, Citizens. Mobile hamburger drawer. |
| StatusBadge | `src/components/StatusBadge.tsx` | Color chips: Pending (yellow), In Progress (blue), Resolved (green) |
| StatsCard | `src/components/StatsCard.tsx` | Stat counter card with icon + color variant |
| IssueTable | `src/components/IssueTable.tsx` | Reusable issues table. Reporter names are clickable links → /citizens/:uid |
| ResolutionStats | `src/components/ResolutionStats.tsx` | Avg resolution time, fastest/slowest issue, category breakdown bar chart, top-5 worker leaderboard |

---

## Key Files

- `src/types/index.ts` — TypeScript interfaces: `Issue`, `Citizen`, `AdminUser`, `FilterStatus`, `FilterCategory`
- `src/lib/firebase.ts` — Firebase app init, exports `auth`, `db`
- `src/lib/firestore.ts` — All Firestore ops: `subscribeToIssues`, `fetchAllIssues`, `updateIssueStatus`, `deleteIssue`, `fetchAllCitizens`, `fetchCitizenById`, `fetchIssuesByUserId`
- `src/contexts/AuthContext.tsx` — Auth context with role check
- `.npmrc` — Contains `node-linker=hoisted` (fixes VS Code red errors with pnpm)

---

## Print Report Feature
In `/issues/[id]`, the **Print Report** button calls `handlePrint()` which:
1. Builds a self-contained HTML string with inline CSS
2. Opens a new browser window via `window.open('', '_blank', 'width=900,height=700')`
3. Writes the HTML directly into the new window
4. The HTML has an embedded script that auto-triggers print and auto-closes the window after printing
5. Includes a QR code (via `api.qrserver.com`) linking to the GPS location

---

## VS Code Red Errors Fix
pnpm uses a virtual store by default which VS Code TypeScript can't see.
Fix already applied: `.npmrc` file with `node-linker=hoisted`.
Just run `pnpm install` once and all red errors will disappear.

---

## What's Pending (Deferred by user)
- **Multiple Admin Roles** — Viewer / Editor / Super Admin
  - `/admins` page (Super Admin only): list admins, add admin, change role, deactivate
  - `/profile` page: change display name, change password
  - `usePermissions` hook
  - Roles stored in separate `/admins/{uid}` Firestore collection
  - Permission guards: Update status (Editor+), Delete issue (Super Admin only), Manage admins (Super Admin only)
  - Updated Sidebar showing role badge

---

## Issue Status Values
- `"Pending"` — not yet actioned
- `"In Progress"` — assigned and being worked on
- `"Resolved"` — completed

## Issue Categories (from Flutter app)
Pothole, Streetlight, Garbage, Water Leakage, Road Damage, Other
