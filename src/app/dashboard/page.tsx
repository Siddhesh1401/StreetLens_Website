'use client';

import { useEffect, useState } from 'react';
import { Issue } from '@/types';
import { subscribeToIssues } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import IssueTable from '@/components/IssueTable';
import ResolutionStats from '@/components/ResolutionStats';
import { BarChart2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fetching, setFetching] = useState(true);

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

  const total = issues.length;
  const pending = issues.filter((i) => i.status === 'Pending').length;
  const inProgress = issues.filter((i) => i.status === 'In Progress').length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;

  // Recent 10 issues for the dashboard preview table
  const recent = issues.slice(0, 10);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live overview of all civic issue reports
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Issues"
            value={total}
            icon={BarChart2}
            color="blue"
            subtitle="All time"
          />
          <StatsCard
            title="Pending"
            value={pending}
            icon={AlertCircle}
            color="amber"
            subtitle="Awaiting action"
          />
          <StatsCard
            title="In Progress"
            value={inProgress}
            icon={Clock}
            color="indigo"
            subtitle="Being worked on"
          />
          <StatsCard
            title="Resolved"
            value={resolved}
            icon={CheckCircle}
            color="green"
            subtitle="Completed"
          />
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Issues by Category
          </h2>
          <CategoryBreakdown issues={issues} />
        </div>

        {/* Resolution time stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Resolution Time Stats</h2>
          <ResolutionStats issues={issues} />
        </div>

        {/* Recent issues */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Recent Issues
            </h2>
            <a
              href="/issues"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all →
            </a>
          </div>
          {fetching ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <IssueTable issues={recent} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---- helper sub-component ---- */
function CategoryBreakdown({ issues }: { issues: Issue[] }) {
  const counts: Record<string, number> = {};
  issues.forEach((i) => {
    counts[i.category] = (counts[i.category] ?? 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] ?? 1;

  if (sorted.length === 0)
    return <p className="text-sm text-gray-400">No data yet.</p>;

  return (
    <div className="space-y-3">
      {sorted.map(([cat, count]) => (
        <div key={cat} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-28 shrink-0">{cat}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 w-6 text-right">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
