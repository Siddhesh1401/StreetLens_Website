# Codebase Guide — How to Work With This Code

A practical guide for anyone adding features or fixing bugs.

---

## Running the Project

```bash
pnpm install      # first time only
pnpm dev          # starts dev server at http://localhost:3000
```

If you see red underlines in VS Code after cloning, just run `pnpm install` once and restart VS Code. This is a known pnpm + VS Code issue (fixed via `.npmrc`).

---

## Key Conventions

### Imports
Always use the `@/` path alias instead of relative paths:

```ts
// ✅ correct
import { Issue } from '@/types';
import { fetchAllIssues } from '@/lib/firestore';

// ❌ avoid
import { Issue } from '../../types';
```

### TypeScript
All shared types are in `src/types/index.ts`. Add new interfaces there.

### Styling
This project uses **Tailwind CSS utility classes only** — no separate CSS files except `globals.css`.

Use `clsx` for conditional class names:
```tsx
import clsx from 'clsx';

<div className={clsx(
  'px-3 py-2 rounded',
  isActive ? 'bg-blue-600 text-white' : 'text-gray-500'
)} />
```

---

## How to Add a New Page

1. Create a folder + `page.tsx` in `src/app/`
2. Mark it `'use client'` at the top (all pages use client-side auth)
3. Add the auth guard at the top (copy from any existing page):

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function MyNewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* your content here */}
      </main>
    </div>
  );
}
```

4. Add the route to the Sidebar nav in `src/components/Sidebar.tsx`:

```ts
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/issues', label: 'All Issues', icon: List },
  { href: '/citizens', label: 'Citizens', icon: Users },
  { href: '/your-new-page', label: 'New Page', icon: SomeIcon }, // ← add here
];
```

---

## How to Add a New Firestore Query

All Firestore interactions live in `src/lib/firestore.ts`. Add your function there:

```ts
// Example: fetch issues by category
export async function fetchIssuesByCategory(category: string): Promise<Issue[]> {
  const q = query(
    collection(db, 'issues'),
    where('category', '==', category),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToIssue(d.id, d.data()));
}
```

Then import it in your page:
```ts
import { fetchIssuesByCategory } from '@/lib/firestore';
```

---

## How to Add a New TypeScript Type

Open `src/types/index.ts` and add your interface:

```ts
export interface MyNewType {
  id: string;
  name: string;
  // ...
}
```

---

## How to Add a New Component

Create `src/components/MyComponent.tsx`:

```tsx
'use client';

interface MyComponentProps {
  title: string;
  value: number;
}

export default function MyComponent({ title, value }: MyComponentProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
```

---

## Fetching Data Patterns

### One-time fetch (most pages)
```tsx
const [data, setData] = useState<Issue[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;
  fetchAllIssues().then((issues) => {
    setData(issues);
    setLoading(false);
  });
}, [user]);
```

### Real-time listener (dashboard only)
```tsx
useEffect(() => {
  if (!user) return;
  const unsub = subscribeToIssues((issues) => {
    setData(issues);
  });
  return unsub; // cleanup — unsubscribes when component unmounts
}, [user]);
```

Always return the unsubscribe function from `useEffect` to avoid memory leaks.

---

## Common Gotchas

### Firestore Timestamps
Firestore stores dates as `Timestamp` objects, not JS `Date`. The `docToIssue()` helper in `firestore.ts` converts them for you. If you're writing a new query that returns dates, always do:

```ts
createdAt: data.created_at instanceof Timestamp
  ? data.created_at.toDate()
  : new Date(data.created_at ?? Date.now()),
```

### `useEffect` and `user` dependency
Always include `user` in your `useEffect` dependency array when the effect depends on auth. The user starts as `null` and gets set after auth resolves — without it as a dependency, effects that need auth will run before the user is available.

### `router.replace` vs `router.push`
- Use `router.replace('/login')` for auth redirects (so Back button doesn't return to protected page)
- Use `router.push('/dashboard')` for user-initiated navigation

### Image component
Always use Next.js `<Image>` instead of `<img>` for Cloudinary images. You need to configure the domain in `next.config.js`:

```js
// next.config.js
images: {
  domains: ['res.cloudinary.com'],
}
```

This is already configured. If you use a different image host, add it here.

---

## Git Workflow

```bash
# Check what's changed
git status

# Stage and commit
git add .
git commit -m "Your message here"

# Push to GitHub
git push
```

Branch: `main`
Remote: `https://github.com/Siddhesh1401/StreetLens_Website.git`

---

## Icons

This project uses **lucide-react**. Browse all icons at https://lucide.dev

```tsx
import { SomeIcon } from 'lucide-react';

<SomeIcon className="w-5 h-5 text-gray-600" />
```

---

## Formatting Dates

Use **date-fns** (already installed):

```ts
import { format, formatDistanceToNow } from 'date-fns';

format(issue.createdAt, 'MMM d, yyyy')         // → "Jan 5, 2025"
format(issue.createdAt, 'dd/MM/yyyy HH:mm')    // → "05/01/2025 14:30"
formatDistanceToNow(issue.createdAt)            // → "3 days ago"
```
