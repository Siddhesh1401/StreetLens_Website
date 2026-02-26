'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { fetchAllCitizens, fetchAllIssues } from '@/lib/firestore';
import { Citizen, Issue } from '@/types';
import { format } from 'date-fns';
import { Search, Users, ChevronRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

interface CitizenRow extends Citizen {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
}

export default function CitizensPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<CitizenRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [citizens, issues] = await Promise.all([
        fetchAllCitizens(),
        fetchAllIssues(),
      ]);

      // Build issue count map per user
      const countMap: Record<string, { total: number; resolved: number; pending: number }> = {};
      issues.forEach((i: Issue) => {
        if (!countMap[i.userId]) countMap[i.userId] = { total: 0, resolved: 0, pending: 0 };
        countMap[i.userId].total++;
        if (i.status === 'Resolved') countMap[i.userId].resolved++;
        if (i.status === 'Pending') countMap[i.userId].pending++;
      });

      const enriched: CitizenRow[] = citizens.map((c) => ({
        ...c,
        totalIssues: countMap[c.userId]?.total ?? 0,
        resolvedIssues: countMap[c.userId]?.resolved ?? 0,
        pendingIssues: countMap[c.userId]?.pending ?? 0,
      }));

      // Sort by most issues first
      enriched.sort((a, b) => b.totalIssues - a.totalIssues);
      setRows(enriched);
      setFetching(false);
    })();
  }, [user]);

  if (loading || !user) return null;

  const filtered = rows.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Citizens
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {rows.length} registered citizens · {filtered.length} shown
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          {fetching ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading citizens…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No citizens found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reports</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Resolved</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Pending</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.userId} className="hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                          {c.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-medium text-gray-800">{c.name || '—'}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Mail className="w-3 h-3" />{c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Phone className="w-3 h-3" />{c.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="py-3 px-4 text-gray-400 text-xs hidden sm:table-cell">
                      {format(c.createdAt, 'dd MMM yyyy')}
                    </td>

                    {/* Stats */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-gray-700">{c.totalIssues}</span>
                    </td>
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <span className="text-green-600 font-medium">{c.resolvedIssues}</span>
                    </td>
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <span className="text-amber-600 font-medium">{c.pendingIssues}</span>
                    </td>

                    {/* View */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/citizens/${c.userId}`}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors inline-flex"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
