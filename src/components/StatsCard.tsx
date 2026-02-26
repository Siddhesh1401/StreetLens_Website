import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'amber' | 'indigo' | 'green';
  subtitle?: string;
}

const COLORS = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
  amber: { bg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-200' },
  indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', border: 'border-indigo-200' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatsCardProps) {
  const c = COLORS[color];
  return (
    <div className={clsx('bg-white rounded-xl border p-5 shadow-sm', c.border)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl', c.bg)}>
          <Icon className={clsx('w-6 h-6', c.icon)} />
        </div>
      </div>
    </div>
  );
}
