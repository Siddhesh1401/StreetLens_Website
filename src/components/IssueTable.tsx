'use client';

import { Issue } from '@/types';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { ArrowUpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface IssueTableProps {
  issues: Issue[];
}

export default function IssueTable({ issues }: IssueTableProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-medium">No issues found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Issue
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
              Category
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Reporter
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
              Date
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
              Votes
            </th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {issues.map((issue) => (
            <tr key={issue.issueId} className="hover:bg-gray-50 transition-colors">
              {/* Thumbnail + description */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {issue.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={issue.imageUrl}
                        alt={issue.category}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <p className="text-gray-700 line-clamp-2 max-w-[200px]">
                    {issue.description || '—'}
                  </p>
                </div>
              </td>

              {/* Category */}
              <td className="py-3 px-4 hidden sm:table-cell">
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                  {issue.category}
                </span>
              </td>

              {/* Status */}
              <td className="py-3 px-4">
                <StatusBadge status={issue.status} />
              </td>

              {/* Reporter */}
              <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                <Link
                  href={`/citizens/${issue.userId}`}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  {issue.userName || '—'}
                </Link>
              </td>

              {/* Date */}
              <td className="py-3 px-4 text-gray-400 whitespace-nowrap hidden lg:table-cell">
                {format(issue.createdAt, 'dd MMM yyyy')}
              </td>

              {/* Upvotes */}
              <td className="py-3 px-4 text-center hidden md:table-cell">
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />
                  {issue.upvotes}
                </span>
              </td>

              {/* View */}
              <td className="py-3 px-4">
                <Link
                  href={`/issues/${issue.issueId}`}
                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors inline-flex"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
