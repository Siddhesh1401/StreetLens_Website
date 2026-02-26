'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Issue } from '@/types';
import { getFirestore, doc, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import { updateIssueStatus } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ArrowUpCircle,
  Wrench,
  Save,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import app from '@/lib/firebase';

function docToIssue(id: string, data: DocumentData): Issue {
  return {
    issueId: id,
    userId: data.user_id ?? '',
    imageUrl: data.image_url ?? '',
    category: data.category ?? '',
    description: data.description ?? '',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    status: data.status ?? 'Pending',
    upvotes: data.upvotes ?? 0,
    assignedWorker: data.assigned_worker ?? '',
    createdAt:
      data.created_at instanceof Timestamp
        ? data.created_at.toDate()
        : new Date(data.created_at ?? Date.now()),
    updatedAt:
      data.updated_at instanceof Timestamp
        ? data.updated_at.toDate()
        : new Date(data.updated_at ?? Date.now()),
    userName: data.user_name ?? '',
  };
}

export default function IssueDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [fetching, setFetching] = useState(true);
  const [newStatus, setNewStatus] = useState<Issue['status']>('Pending');
  const [worker, setWorker] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !issueId) return;
    const db = getFirestore(app);
    const ref = doc(db, 'issues', issueId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const i = docToIssue(snap.id, snap.data());
        setIssue(i);
        setNewStatus(i.status);
        setWorker(i.assignedWorker);
      }
      setFetching(false);
    });
    return unsub;
  }, [user, issueId]);

  if (loading || !user) return null;

  const handleSave = async () => {
    if (!issue) return;
    setSaving(true);
    try {
      await updateIssueStatus(issue.issueId, newStatus, worker);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const mapsUrl =
    issue
      ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
      : '#';

  const handlePrint = () => {
    if (!issue) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
      `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
    )}`;
    const statusColors: Record<string, string> = {
      Pending: 'background:#fef3c7;color:#92400e',
      'In Progress': 'background:#dbeafe;color:#1e40af',
      Resolved: 'background:#d1fae5;color:#065f46',
    };
    const badgeStyle = statusColors[issue.status] ?? statusColors['Pending'];
    const now = format(new Date(), 'dd MMM yyyy, HH:mm');

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>StreetLens Issue Report – ${issue.issueId}</title>
<style>
  body{margin:0;padding:32px;font-family:Arial,sans-serif;color:#0f172a;font-size:13px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1d4ed8;padding-bottom:12px;margin-bottom:20px}
  .title{font-size:22px;font-weight:800;color:#1d4ed8;margin:0}
  .subtitle{font-size:11px;color:#64748b;margin:2px 0 0}
  .badge{padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;${badgeStyle}}
  .row{display:flex;gap:24px;margin-bottom:20px;align-items:flex-start}
  .photo{width:260px;height:180px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0}
  .qr-wrap{text-align:center}
  .qr-label{font-size:10px;color:#94a3b8;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  td{padding:7px 10px;border:1px solid #e2e8f0}
  tr:nth-child(odd) td{background:#f8fafc}
  td:first-child{font-weight:600;color:#475569;width:160px}
  .footer{font-size:10px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:10px}
</style>
</head><body>
<div class="header">
  <div>
    <p class="title">StreetLens</p>
    <p class="subtitle">Municipal Civic Issue Report</p>
  </div>
  <span class="badge">${issue.status}</span>
</div>
<div class="row">
  ${issue.imageUrl ? `<img src="${issue.imageUrl}" class="photo" alt="Issue photo"/>` : ''}
  <div class="qr-wrap">
    <img src="${qrUrl}" width="120" height="120" alt="QR"/>
    <p class="qr-label">Scan for GPS location</p>
  </div>
</div>
<table><tbody>
  <tr><td>Issue ID</td><td>${issue.issueId}</td></tr>
  <tr><td>Category</td><td>${issue.category}</td></tr>
  <tr><td>Description</td><td>${issue.description || '—'}</td></tr>
  <tr><td>Reporter</td><td>${issue.userName || '—'}</td></tr>
  <tr><td>Reported On</td><td>${format(issue.createdAt, 'dd MMM yyyy, HH:mm')}</td></tr>
  <tr><td>Last Updated</td><td>${format(issue.updatedAt, 'dd MMM yyyy, HH:mm')}</td></tr>
  <tr><td>GPS Coordinates</td><td>${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}</td></tr>
  <tr><td>Maps Link</td><td>${mapsUrl}</td></tr>
  <tr><td>Assigned Worker</td><td>${issue.assignedWorker || 'Not assigned'}</td></tr>
  <tr><td>Upvotes</td><td>${issue.upvotes}</td></tr>
  <tr><td>Status</td><td>${issue.status}</td></tr>
</tbody></table>
<p class="footer">Generated by StreetLens Admin Portal &middot; ${now}</p>
<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Back */}
        <Link
          href="/issues"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issues
        </Link>

        {fetching ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Loading…
          </div>
        ) : !issue ? (
          <div className="text-center py-16 text-gray-500">
            Issue not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              {issue.imageUrl && (
                <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  <Image
                    src={issue.imageUrl}
                    alt={issue.category}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 66vw"
                  />
                </div>
              )}

              {/* Info card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {issue.category}
                    </span>
                    <h1 className="text-lg font-semibold text-gray-900 mt-2">
                      {issue.description || 'No description provided.'}
                    </h1>
                  </div>
                  <StatusBadge status={issue.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{issue.userName || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{format(issue.createdAt, 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4 text-blue-400" />
                    <span>{issue.upvotes} upvotes</span>
                  </div>
                  {issue.assignedWorker && (
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-gray-400" />
                      <span>{issue.assignedWorker}</span>
                    </div>
                  )}
                </div>

                {/* Map link */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps ({issue.latitude.toFixed(5)},{' '}
                  {issue.longitude.toFixed(5)})
                </a>

                <p className="text-xs text-gray-400">
                  Last updated: {format(issue.updatedAt, 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>

            {/* RIGHT — actions */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  Update Issue
                </h2>

                {/* Status */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as Issue['status'])
                    }
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>

                {/* Assigned worker */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Assigned Worker (optional)
                  </label>
                  <input
                    type="text"
                    value={worker}
                    onChange={(e) => setWorker(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>
              </div>

              {/* Issue ID */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-1">Issue ID</p>
                <p className="text-xs font-mono text-gray-600 break-all">
                  {issue.issueId}
                </p>
              </div>

              {/* Print Report */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}