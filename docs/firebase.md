# Firebase — Complete Reference

Everything you need to know about how this project uses Firebase.

---

## Project Details

| Key | Value |
|---|---|
| Project ID | `streetlens-8a15c` |
| Auth Domain | `streetlens-8a15c.firebaseapp.com` |
| Console URL | https://console.firebase.google.com/project/streetlens-8a15c |

> Credentials (API key, App ID, etc.) live in `.env.local` — never commit this file.

---

## Services Used

| Service | Purpose |
|---|---|
| **Firebase Authentication** | Login for admins and citizens |
| **Cloud Firestore** | Primary database for issues and user profiles |

> Storage is NOT used here — images are hosted on **Cloudinary**. Only the URL string is stored in Firestore.

---

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

All variables are prefixed with `NEXT_PUBLIC_` so they're accessible in the browser (client-side). Firebase config is safe to expose publicly — security is enforced by Firestore Rules, not by hiding the config.

---

## Firestore Collections

### `/issues/{issueId}`

Each document is one civic issue reported by a citizen.

| Field | Type | Description |
|---|---|---|
| `user_id` | `string` | Firebase UID of the citizen who reported |
| `user_name` | `string` | Display name of citizen |
| `image_url` | `string` | Cloudinary URL of the photo |
| `category` | `string` | One of: `Pothole`, `Streetlight`, `Garbage`, `Water Leakage`, `Road Damage`, `Other` |
| `description` | `string` | Free-text description |
| `latitude` | `number` | GPS latitude |
| `longitude` | `number` | GPS longitude |
| `status` | `string` | `Pending` → `In Progress` → `Resolved` |
| `upvotes` | `number` | Number of citizens who upvoted this issue |
| `assigned_worker` | `string` | Name of the worker assigned (can be empty string) |
| `created_at` | `Timestamp` | When the report was submitted |
| `updated_at` | `Timestamp` | When status was last changed |

**Note on field naming:** Firestore fields use `snake_case` (e.g. `user_id`), but the TypeScript `Issue` interface uses `camelCase` (e.g. `userId`). The mapping happens in the `docToIssue()` function in `src/lib/firestore.ts`.

---

### `/users/{uid}`

Each document is a user profile. The document ID is the Firebase Auth UID.

| Field | Type | Description |
|---|---|---|
| `user_id` | `string` | Same as the document ID (Firebase UID) |
| `name` | `string` | Full name |
| `email` | `string` | Email address |
| `phone` | `string` | Phone number |
| `role` | `string` | `citizen` or `admin` |
| `created_at` | `Timestamp` | When the account was created |

**Important:** Citizen profiles are created by the Flutter mobile app when a user registers. Admin accounts may or may not have a Firestore document — see Auth section below.

---

## Authentication & Role System

Firebase Auth is **shared** between the Flutter app and this web dashboard. Same project, same user pool.

### How role checking works

When someone logs in (or is already logged in), the app checks their Firestore `/users/{uid}` document:

```
User logs in
    │
    ├── No /users/{uid} doc found
    │       → This is a manually created admin (via Firebase console)
    │       → ✅ ALLOWED
    │
    ├── doc.role === "admin"
    │       → ✅ ALLOWED
    │
    └── doc.role === "citizen"
            → ❌ BLOCKED
            → Immediately signed out
            → Redirected to /login with error message
```

This logic lives in `src/contexts/AuthContext.tsx` → `isAdmin()` function.

### Creating an Admin Account

1. Go to Firebase Console → Authentication → Users → **Add user**
2. Enter any email + password
3. The new user will have no Firestore doc → treated as admin automatically
4. Optionally, create a `/users/{uid}` doc with `role: "admin"` for consistency

---

## Firestore Security Rules

Current rules (update in Firebase Console → Firestore → Rules):

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
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**Problem with current rules:** The `allow update` rule requires a Firestore `/users/{uid}` doc with `role = "admin"`. But manually created admins (no doc) can't update issues via these rules. For now the app is likely still in test mode — tighten rules before going live.

---

## Free Tier Limits (Spark Plan)

| Resource | Daily Free Limit |
|---|---|
| Firestore Reads | **50,000 / day** |
| Firestore Writes | **20,000 / day** |
| Firestore Deletes | **20,000 / day** |
| Stored data | 1 GB total |
| Network egress | 10 GB / month |
| Auth (email/password) | Unlimited |

### Watch out for real-time listeners

`onSnapshot()` counts reads for every document returned when the listener first connects, AND for every document that changes. If you have 500 issues and 3 dashboards open, that's ~1,500 reads just on load. Stay mindful for large datasets.

---

## Firebase SDK Usage in This Project

```
src/lib/firebase.ts    ← Initializes the app, exports auth and db
src/lib/firestore.ts   ← All query/write functions (imported by pages)
```

Never import `firebase/app` directly in page files — always go through `@/lib/firebase` or `@/lib/firestore`.
