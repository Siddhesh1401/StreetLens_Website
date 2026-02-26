# Project Architecture

How all the pieces of StreetLens Admin Dashboard fit together.

---

## High-Level Overview

```
Browser
  │
  ├── Next.js App Router (src/app/)
  │       Pages render with data from Firestore
  │
  ├── AuthContext (src/contexts/AuthContext.tsx)
  │       Wraps entire app, provides user + login/logout
  │       Blocks citizens from accessing the dashboard
  │
  ├── Firestore Layer (src/lib/firestore.ts)
  │       All DB reads/writes go through here
  │
  └── Firebase (src/lib/firebase.ts)
          Initializes Firebase app once, exports auth + db
```

---

## Folder Structure Explained

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout — wraps everything in <AuthProvider>
│   ├── globals.css             # Global Tailwind base styles
│   ├── page.tsx                # "/" — just redirects to /dashboard
│   │
│   ├── login/
│   │   └── page.tsx            # Login form (email + password)
│   │
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard with stats + charts
│   │
│   ├── issues/
│   │   ├── page.tsx            # Issue list with search + filters
│   │   └── [id]/
│   │       └── page.tsx        # Single issue detail + management
│   │
│   └── citizens/
│       ├── page.tsx            # Citizens list table
│       └── [uid]/
│           └── page.tsx        # Single citizen profile
│
├── components/                 # Reusable UI pieces
│   ├── Sidebar.tsx             # Left nav (used on all protected pages)
│   ├── IssueTable.tsx          # Table of issues (used on dashboard + issues page)
│   ├── StatusBadge.tsx         # Colored status chip
│   ├── StatsCard.tsx           # Metric card (count + icon)
│   └── ResolutionStats.tsx     # Analytics section on dashboard
│
├── contexts/
│   └── AuthContext.tsx         # Global auth state + role check
│
├── lib/
│   ├── firebase.ts             # Firebase init (runs once)
│   └── firestore.ts            # All Firestore CRUD functions
│
└── types/
    └── index.ts                # TypeScript interfaces used everywhere
```

---

## Data Flow

### On page load (protected page)
```
Page mounts
  → useAuth() checks if user is set
  → if no user → redirect to /login
  → if user exists → fetch data from Firestore
  → render UI with data
```

### Auth state
```
AuthContext uses onAuthStateChanged (runs on every page)
  → checks /users/{uid} in Firestore
  → sets user in context if admin
  → signs out + redirects if citizen
```

### Dashboard real-time data
```
Dashboard uses subscribeToIssues() (onSnapshot)
  → fires immediately with current data
  → fires again whenever any issue changes in Firestore
  → React state updates → UI re-renders automatically
```

### Other pages (non-real-time)
```
Citizens page, Citizen profile, Issues list
  → one-time fetch (getDocs) on mount
  → no live updates — user must refresh to see new data
```

---

## Component Relationships

```
layout.tsx
  └── AuthProvider (wraps everything)
        └── [any page]
              ├── Sidebar              ← navigation
              ├── StatsCard            ← used on dashboard
              ├── IssueTable           ← used on dashboard + /issues
              ├── ResolutionStats      ← used on dashboard
              └── StatusBadge          ← used inside IssueTable + issue detail
```

---

## Authentication Flow

```
/login page
  → user submits email + password
  → signInWithEmailAndPassword (Firebase Auth)
  → check /users/{uid} doc (isAdmin function)
  → if admin → router.push('/dashboard')
  → if citizen → signOut + throw error (shown in login form)

Protected pages
  → useAuth() hook
  → if loading → show nothing (prevent flash)
  → if !user → router.replace('/login')
  → if user → show page content
```

---

## TypeScript Types

All shared types are in `src/types/index.ts`:

```ts
Issue          // A single issue report
Citizen        // A citizen user profile
AdminUser      // The logged-in admin (Firebase User wrapper)
FilterStatus   // 'All' | 'Pending' | 'In Progress' | 'Resolved'
FilterCategory // 'All' | 'Pothole' | 'Garbage' | ...
```

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| App Router (not Pages Router) | Next.js 14 default, better layouts and nested routing |
| All pages are `'use client'` | Was simplest for auth/state — could be refactored to Server Components later |
| Firestore in a separate `lib/` module | Keeps pages clean, single place to change queries |
| `onSnapshot` only on dashboard | Real-time updates most valuable on the overview; detail pages don't need it |
| pnpm instead of npm | Faster installs, better disk usage |
| `.npmrc` with `node-linker=hoisted` | Fixes VS Code TypeScript not finding pnpm packages |
