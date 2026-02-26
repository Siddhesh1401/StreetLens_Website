# StreetLens Admin Dashboard

> Municipal admin portal for the **StreetLens** civic issue reporting platform. Admins can monitor, manage, and resolve road/infrastructure complaints submitted by citizens via the StreetLens Flutter mobile app.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?logo=firebase)

---

## Overview

StreetLens is a two-part platform:
- **Flutter mobile app** — Citizens report road issues (potholes, broken streetlights, garbage, water leaks, etc.) with photos and GPS coordinates.
- **This Next.js web dashboard** — Municipal admins review all reports, assign workers, update statuses, and track resolution metrics.

Both apps share the same **Firebase project** (Firestore + Auth).

---

## Features

| Feature | Details |
|---|---|
| **Dashboard** | Live stats cards (total / pending / in-progress / resolved), category bar chart, resolution analytics, recent issues table |
| **Issues List** | Full paginated table with search (description, reporter, category) + status filter + category filter |
| **Issue Detail** | Photo viewer, Google Maps GPS link, status selector, worker assignment, Save button, Print Report (PDF-ready) |
| **Citizens** | All registered citizens with per-citizen issue counts (total / resolved / pending), searchable |
| **Citizen Profile** | Avatar, contact info, join date, stats row, full issue history |
| **Resolution Stats** | Average resolution time, fastest & slowest resolution, per-category breakdown, top-5 worker leaderboard |
| **Print Report** | Self-contained HTML print window with QR code linking to GPS location |
| **Auth Guard** | Citizens blocked from admin portal; only `role = "admin"` (or manually created admin) accounts allowed |
| **Responsive** | Mobile hamburger sidebar + full desktop sidebar |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.3 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4.1 + clsx |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Image Storage | Cloudinary (URLs stored in Firestore) |
| Icons | lucide-react 0.376.0 |
| Date utilities | date-fns 3.6.0 |
| Package manager | pnpm |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Redirect → /dashboard
│   ├── login/page.tsx          # Email/password login
│   ├── dashboard/page.tsx      # Stats + charts + recent issues
│   ├── issues/
│   │   ├── page.tsx            # All issues (search + filters)
│   │   └── [id]/page.tsx       # Issue detail + management
│   └── citizens/
│       ├── page.tsx            # All citizens table
│       └── [uid]/page.tsx      # Citizen profile + issue history
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar (responsive)
│   ├── IssueTable.tsx          # Reusable issues table
│   ├── StatusBadge.tsx         # Pending / In Progress / Resolved chips
│   ├── StatsCard.tsx           # Stat counter card
│   └── ResolutionStats.tsx     # Analytics panel
├── contexts/
│   └── AuthContext.tsx         # Firebase auth + role check
├── lib/
│   ├── firebase.ts             # Firebase app init (auth + db exports)
│   └── firestore.ts            # All Firestore CRUD operations
└── types/
    └── index.ts                # Issue, Citizen, AdminUser, FilterStatus types
```

---

## Firestore Data Model

### `/issues/{issueId}`
| Field | Type | Description |
|---|---|---|
| `user_id` | string | UID of the reporting citizen |
| `user_name` | string | Display name of citizen |
| `image_url` | string | Cloudinary image URL |
| `category` | string | Pothole / Streetlight / Garbage / Water Leakage / Road Damage / Other |
| `description` | string | Text description of the issue |
| `latitude` | number | GPS latitude |
| `longitude` | number | GPS longitude |
| `status` | string | `Pending` / `In Progress` / `Resolved` |
| `upvotes` | number | Community upvote count |
| `assigned_worker` | string | Assigned worker name |
| `created_at` | Timestamp | Report submission time |
| `updated_at` | Timestamp | Last status update time |

### `/users/{uid}`
| Field | Type | Description |
|---|---|---|
| `user_id` | string | Firebase UID |
| `name` | string | Full name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `role` | string | `citizen` or `admin` |
| `created_at` | Timestamp | Account creation time |

---

## Auth & Role Logic

```
Login attempt
    │
    ├─ No /users/{uid} doc  →  Manually-created admin  →  ✅ ALLOWED
    ├─ role = "admin"       →  Admin account           →  ✅ ALLOWED
    └─ role = "citizen"     →  Citizen account         →  ❌ BLOCKED
                                                             (signed out + redirected to /login)
```

Admins are created manually via the Firebase Auth console.

---

## Getting Started

### Prerequisites
- Node.js v18+
- pnpm (`npm install -g pnpm`)

### 1. Clone the repo
```bash
git clone https://github.com/Siddhesh1401/StreetLens_Website.git
cd StreetLens_Website
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> Get these values from: Firebase Console → Project Settings → Your Apps → Web App config

### 4. Run locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Vercel (recommended)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add the environment variables from `.env.local` in the Vercel dashboard
4. Deploy — you get a free URL like `streetlens-admin.vercel.app`

### Firebase Hosting
```bash
pnpm build
npx firebase-tools deploy --only hosting
```

---

## Firestore Security Rules

Before going live, update the rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Related

- **StreetLens Flutter App** — The mobile app citizens use to submit reports (same Firebase project)

---

## License

MIT
