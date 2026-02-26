import { Issue } from '@/types';
import clsx from 'clsx';

const CONFIG: Record<
  Issue['status'],
  { label: string; bg: string; text: string; dot: string }
> = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
};

export default function StatusBadge({ status }: { status: Issue['status'] }) {
  const c = CONFIG[status] ?? CONFIG['Pending'];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        c.bg,
        c.text
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}
