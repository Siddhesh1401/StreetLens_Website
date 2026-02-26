# Features — What's Built

Every feature in the current dashboard, explained in detail.

---

## Pages

### `/login` — Login Page
**File:** `src/app/login/page.tsx`

- Email + password login form
- Show/hide password toggle (eye icon)
- Calls `login()` from AuthContext
- Shows error message if wrong credentials or citizen account tries to log in
- Redirects to `/dashboard` on success
- Already logged-in users are redirected away automatically

---

### `/dashboard` — Main Dashboard
**File:** `src/app/dashboard/page.tsx`

The home screen for admins. Uses a **real-time Firestore listener** so numbers update automatically without refresh.

**Stats row (4 cards):**
- Total Issues
- Pending
- In Progress
- Resolved

**Resolution Stats section (`ResolutionStats` component):**
- Average resolution time across all resolved issues
- Fastest resolved issue (with link)
- Slowest resolved issue (with link)
- Oldest unresolved issue (how long it's been waiting)
- Bar chart — average resolution time per category
- Top 5 workers leaderboard (by number of resolved issues)

**Recent Issues table:**
- Shows the 10 most recent issues
- Uses the reusable `IssueTable` component
- Reporter names are clickable → go to citizen profile

---

### `/issues` — All Issues List
**File:** `src/app/issues/page.tsx`

Full list of every issue in the system with filtering.

**Search:** searches across description, reporter name, and category (case-insensitive)

**Filters:**
- Status: All / Pending / In Progress / Resolved
- Category: All / Pothole / Streetlight / Garbage / Water Leakage / Road Damage / Other

Filters and search all work together (AND logic). Uses `IssueTable` component.

---

### `/issues/[id]` — Issue Detail
**File:** `src/app/issues/[id]/page.tsx`

The main management page for a single issue. Uses `onSnapshot` for real-time sync.

**What's shown:**
- Issue photo (Next.js `<Image>` component, from Cloudinary URL)
- Category badge + Status badge
- Description
- Reporter name (clickable → citizen profile)
- GPS coordinates + "View on Maps" link (opens Google Maps)
- Upvote count
- Created at / Updated at dates

**What admins can do:**
- **Change status** — dropdown: Pending / In Progress / Resolved
- **Assign worker** — text input for worker name
- **Save button** — commits both changes to Firestore, shows "Saved!" confirmation
- **Print Report button** — opens a print-ready window (see Print Report section below)

**Back navigation:** Arrow button returns to `/issues`

---

### `/citizens` — Citizens List
**File:** `src/app/citizens/page.tsx`

Table of all registered citizens (users with `role = "citizen"` in Firestore).

**Columns:** Name, Email, Phone, Total Issues, Resolved, Pending, Joined date

**Search:** filters by name or email

Each row's name is a link → `/citizens/{uid}`

---

### `/citizens/[uid]` — Citizen Profile
**File:** `src/app/citizens/[uid]/page.tsx`

Full profile page for a single citizen.

**Profile header:**
- Avatar (auto-generated initials circle using name)
- Full name, email, phone
- Member since date

**Stats row:**
- Total reported / Resolved / Pending

**Issues list:**
- Full table of all issues this citizen has reported
- Uses `IssueTable` component
- Ordered by newest first

---

## Components

### `Sidebar`
**File:** `src/components/Sidebar.tsx`

Navigation panel on the left side of all protected pages.

- **Desktop** (md+): fixed left column, 56px wide, always visible
- **Mobile**: hidden by default, opens as overlay drawer via hamburger button (top-left)
- Shows: StreetLens logo, nav links, logged-in admin email, Sign out button
- Active link is highlighted (blue background)
- Nav links: Dashboard, All Issues, Citizens

---

### `StatusBadge`
**File:** `src/components/StatusBadge.tsx`

A small colored pill showing issue status.

| Status | Color |
|---|---|
| Pending | Yellow |
| In Progress | Blue |
| Resolved | Green |

Used in `IssueTable` and the issue detail page.

---

### `StatsCard`
**File:** `src/components/StatsCard.tsx`

A metric card showing a number with a label, icon, and color variant.

Props: `title`, `value`, `icon` (lucide icon), `color` (blue/amber/indigo/green), `subtitle`

Used in the dashboard stats row.

---

### `IssueTable`
**File:** `src/components/IssueTable.tsx`

Reusable table for displaying a list of issues.

**Columns:** ID (short), Category, Description (truncated), Reporter, Status, Date

- Reporter name is a `<Link>` → `/citizens/{userId}`
- Each row is clickable → `/issues/{issueId}`
- Shows a "No issues found" message when the list is empty

Used on: Dashboard (recent 10), Issues list page, Citizen profile page.

---

### `ResolutionStats`
**File:** `src/components/ResolutionStats.tsx`

Analytics panel shown on the dashboard. Only appears when there's at least one resolved issue.

**Calculates (with `useMemo`):**
- Average resolution time in hours/days
- Fastest resolved issue
- Slowest resolved issue
- Oldest still-unresolved issue
- Per-category average resolution time (rendered as horizontal bar chart)
- Worker leaderboard (top 5 by resolved count)

All calculations happen client-side from the already-fetched issues array — no extra Firestore queries.

---

## Print Report Feature

On the issue detail page, clicking **Print Report**:

1. Builds a full HTML string with inline CSS (no external dependencies)
2. Opens a new popup window (`window.open`)
3. Writes the HTML into the new window with `document.write()`
4. The HTML includes:
   - Issue details (category, status, description, reporter, dates, GPS)
   - A QR code image (generated by `api.qrserver.com`) that links to Google Maps for the GPS location
   - An embedded `<script>` that calls `window.print()` automatically when the page loads
   - After printing (or cancelling), the window auto-closes
5. Works offline-ish (only the QR code needs internet)

This is a zero-dependency print solution — no PDF library needed.
