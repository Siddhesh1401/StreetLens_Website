# What's Next — Pending Features

Features that are planned but not yet built. Use this as a roadmap if you want to add new stuff.

---

## 1. Multiple Admin Roles

Right now all admins have the same permissions. The plan is to have 3 roles:

| Role | What they can do |
|---|---|
| **Viewer** | Read-only — can see everything but change nothing |
| **Editor** | Can update issue status + assign workers |
| **Super Admin** | Everything — including deleting issues and managing other admins |

### How to implement

**New Firestore collection: `/admins/{uid}`**

```
{
  uid: string,
  email: string,
  displayName: string,
  role: "viewer" | "editor" | "super_admin",
  createdAt: Timestamp,
  active: boolean
}
```

This is **separate** from `/users/` — keeps admin metadata away from citizen data.

**New hook: `usePermissions()`**

```ts
// src/hooks/usePermissions.ts
export function usePermissions() {
  const { adminRole } = useAuth(); // extend AuthContext to load this
  return {
    canUpdateStatus: adminRole === 'editor' || adminRole === 'super_admin',
    canDeleteIssue: adminRole === 'super_admin',
    canManageAdmins: adminRole === 'super_admin',
  };
}
```

**Guard components/buttons with permissions:**

```tsx
const { canUpdateStatus } = usePermissions();

// In issue detail page:
<button disabled={!canUpdateStatus}>Save Changes</button>
```

---

## 2. `/admins` Page (Super Admin only)

A management page where Super Admins can:
- See all admin accounts in a table
- Add a new admin (enter email → creates Firebase Auth user + `/admins/{uid}` doc)
- Change an admin's role (dropdown)
- Deactivate an admin account (sets `active: false`)

**Add to Sidebar** (only visible to super_admin):
```tsx
{ href: '/admins', label: 'Manage Admins', icon: ShieldCheck }
```

---

## 3. `/profile` Page

Let each admin manage their own account:
- Change display name
- Change password (using Firebase `updatePassword()`)
- See their current role (read-only)

---

## 4. Sidebar Role Badge

Show the logged-in admin's role below their email in the Sidebar:

```
siddhesh@example.com
[Super Admin]           ← colored badge
```

---

## 5. Delete Issue

The `deleteIssue()` function already exists in `src/lib/firestore.ts`. It just needs a UI:

- Add a **Delete** button on the issue detail page
- Show a confirmation dialog before deleting
- Only render the button if `canDeleteIssue` is true (Super Admin only)

```tsx
const { canDeleteIssue } = usePermissions();

{canDeleteIssue && (
  <button onClick={handleDelete} className="...">
    Delete Issue
  </button>
)}
```

---

## 6. Export to CSV

On the `/issues` page, add an **Export CSV** button that downloads all currently filtered issues as a `.csv` file.

No library needed — can be done with a plain JS blob:

```ts
function exportToCSV(issues: Issue[]) {
  const headers = ['ID', 'Category', 'Status', 'Reporter', 'Description', 'Date'];
  const rows = issues.map(i => [
    i.issueId,
    i.category,
    i.status,
    i.userName,
    `"${i.description.replace(/"/g, '""')}"`,
    format(i.createdAt, 'yyyy-MM-dd')
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'issues.csv';
  a.click();
}
```

---

## 7. Date Range Filter on Dashboard

Add a date picker to filter dashboard stats by a time range (e.g. "last 30 days", "this month").

Requires filtering the `issues` array after fetch:

```ts
const filtered = issues.filter(i =>
  i.createdAt >= startDate && i.createdAt <= endDate
);
```

---

## 8. Notifications / Alerts

Show a badge on the Sidebar "All Issues" link when new `Pending` issues come in.

Since the dashboard already has a real-time listener, you could compare the previous count vs new count and show a toast notification.

---

## 9. Map View

Add a `/map` page that shows all issues plotted on an interactive map using their `latitude` and `longitude` fields.

Suggested library: **Leaflet** (free, no API key needed) via `react-leaflet`

```
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet
```

Color-code pins by status (yellow = pending, blue = in progress, green = resolved).

---

## Priority Order (suggested)

1. Delete Issue button — quickest win, code already exists
2. Export to CSV — very useful for real admin workflows
3. `/profile` page — quality of life for admins
4. Multiple Admin Roles — most complex, do this last
