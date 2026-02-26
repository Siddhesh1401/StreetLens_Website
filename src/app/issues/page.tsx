'use client';

import { useEffect, useState } from 'react';
import { Issue, FilterStatus, FilterCategory } from '@/types';
import { subscribeToIssues } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import IssueTable from '@/components/IssueTable';
import { Search, SlidersHorizontal } from 'lucide-react';

const STATUSES: FilterStatus[] = ['All', 'Pending', 'In Progress', 'Resolved'];
const CATEGORIES: FilterCategory[] = [
  'All',
  'Pothole',
  'Garbage',
  'Street Light',
  'Water Leak',
  'Road Damage',
  'Other',
];

export default function IssuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [categoryFilter, setCategoryFilter] =
    useState<FilterCategory>('All');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToIssues((data) => {
      setIssues(data);
      setFetching(false);
    });
    return unsub;
  }, [user]);

  if (loading || !user) return null;

  const filtered = issues.filter((i) => {
    const matchStatus =
      statusFilter === 'All' || i.status === statusFilter;
    const matchCategory =
      categoryFilter === 'All' || i.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      i.description.toLowerCase().includes(q) ||
      i.userName.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.issueId.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Issues</h1>
          <p className="text-gray-500 text-sm mt-1">
            {issues.length} total · {filtered.length} shown
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, reporter, category…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as FilterStatus)
              }
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as FilterCategory)
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {fetching ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Loading issues…
            </div>
          ) : (
            <IssueTable issues={filtered} />
          )}
        </div>
      </main>
    </div>
  );
}
