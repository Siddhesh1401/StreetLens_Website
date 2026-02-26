'use client';

import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { fetchCitizenById, fetchIssuesByUserId } from '@/lib/firestore';
import { Citizen, Issue } from '@/types';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function CitizenProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;

  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !uid) return;
    (async () => {
      const [c, i] = await Promise.all([
        fetchCitizenById(uid),
        fetchIssuesByUserId(uid),
      ]);
      setCitizen(c);
      setIssues(i);
      setFetching(false);
    })();
  }, [user, uid]);

  if (loading || !user) return null;

  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;
  const inProgress = issues.filter((i) => i.status === 'In Progress').length;
  const pending = issues.filter((i) => i.status === 'Pending').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Back */}
        <Link
          href="/citizens"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Citizens
        </Link>

        {fetching ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : !citizen ? (
          <div className="py-16 text-center text-gray-500">Citizen not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0">
                  {citizen.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">{citizen.name}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />{citizen.email}
                    </span>
                    {citizen.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />{citizen.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {format(citizen.createdAt, 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Reports" value={total} icon={FileText} color="blue" />
              <StatBox label="Pending" value={pending} icon={AlertCircle} color="amber" />
              <StatBox label="In Progress" value={inProgress} icon={Clock} color="indigo" />
              <StatBox label="Resolved" value={resolved} icon={CheckCircle} color="green" />
            </div>

            {/* Issues list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">All Reports by {citizen.name}</h2>
              </div>
              {issues.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No issues reported yet.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {issues.map((issue) => (
                    <div key={issue.issueId} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{issue.category}</span>
                          <StatusBadge status={issue.status} />
                        </div>
                        <p className="text-sm text-gray-700 truncate">{issue.description || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{format(issue.createdAt, 'dd MMM yyyy, HH:mm')}</p>
                      </div>
                      <Link
                        href={`/issues/${issue.issueId}`}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'indigo' | 'green';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
