'use client';

import { Issue } from '@/types';
import { useMemo } from 'react';
import React from 'react';
import { differenceInHours, differenceInDays } from 'date-fns';
import { Timer, Zap, AlertTriangle, Trophy } from 'lucide-react';

interface ResolutionStatsProps {
  issues: Issue[];
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export default function ResolutionStats({ issues }: ResolutionStatsProps) {
  const stats = useMemo(() => {
    const resolved = issues.filter((i) => i.status === 'Resolved');

    if (resolved.length === 0) return null;

    // Resolution times in hours
    const times = resolved.map((i) => ({
      issue: i,
      hours: differenceInHours(i.updatedAt, i.createdAt),
    }));

    const avgHours =
      times.reduce((sum, t) => sum + t.hours, 0) / times.length;

    const fastest = times.reduce((a, b) => (a.hours < b.hours ? a : b));
    const slowest = times.reduce((a, b) => (a.hours > b.hours ? a : b));

    // Oldest unresolved
    const unresolved = issues.filter((i) => i.status !== 'Resolved');
    const oldestUnresolved =
      unresolved.length > 0
        ? unresolved.reduce((a, b) =>
            a.createdAt < b.createdAt ? a : b
          )
        : null;

    // Resolution time by category
    const catMap: Record<string, number[]> = {};
    times.forEach(({ issue, hours }) => {
      if (!catMap[issue.category]) catMap[issue.category] = [];
      catMap[issue.category].push(hours);
    });
    const catAvg = Object.entries(catMap)
      .map(([cat, hrs]) => ({
        cat,
        avg: hrs.reduce((a, b) => a + b, 0) / hrs.length,
        count: hrs.length,
      }))
      .sort((a, b) => b.avg - a.avg);

    // Worker leaderboard
    const workerMap: Record<string, number> = {};
    resolved.forEach((i) => {
      if (i.assignedWorker) {
        workerMap[i.assignedWorker] =
          (workerMap[i.assignedWorker] ?? 0) + 1;
      }
    });
    const workers = Object.entries(workerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { avgHours, fastest, slowest, oldestUnresolved, catAvg, workers, resolvedCount: resolved.length };
  }, [issues]);

  if (!stats) {
    return (
      <p className="text-sm text-gray-400 py-2">
        No resolved issues yet — stats will appear here once issues are resolved.
      </p>
    );
  }

  const maxCatAvg = stats.catAvg[0]?.avg ?? 1;

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard
          icon={Timer}
          color="blue"
          label="Avg Resolution Time"
          value={formatDuration(stats.avgHours)}
          sub={`across ${stats.resolvedCount} resolved`}
        />
        <MiniCard
          icon={Zap}
          color="green"
          label="Fastest Resolved"
          value={formatDuration(stats.fastest.hours)}
          sub={stats.fastest.issue.category}
        />
        <MiniCard
          icon={AlertTriangle}
          color="amber"
          label="Slowest Resolved"
          value={formatDuration(stats.slowest.hours)}
          sub={stats.slowest.issue.category}
        />
        <MiniCard
          icon={AlertTriangle}
          color="red"
          label="Oldest Unresolved"
          value={
            stats.oldestUnresolved
              ? `${differenceInDays(new Date(), stats.oldestUnresolved.createdAt)}d`
              : '—'
          }
          sub={stats.oldestUnresolved?.category ?? 'All good!'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resolution time by category */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Avg Resolution Time by Category
          </h3>
          <div className="space-y-2.5">
            {stats.catAvg.map(({ cat, avg, count }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 shrink-0 truncate">{cat}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(avg / maxCatAvg) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-14 text-right shrink-0">
                  {formatDuration(avg)} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Worker leaderboard */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Top Workers by Resolutions
          </h3>
          {stats.workers.length === 0 ? (
            <p className="text-xs text-gray-400">No workers assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.workers.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{name}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <Trophy className="w-3 h-3" />{count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red';
  label: string;
  value: string;
  sub: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
    </div>
  );
}
