'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'classnames';

const nav = [
  { href: '/' as const, label: 'Overview', icon: '📊' },
  { href: '/analytics' as const, label: 'Analytics', icon: '📈' },
  { href: '/table' as const, label: 'Table', icon: '📋' },
  { href: '/settings' as const, label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({
  className = '',
  onNavigate,
}: { className?: string; onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  return (
    <aside className={clsx('w-64 shrink-0 border-r bg-white p-4', className)}>
      <div className="mb-6 px-2 text-xl font-bold text-slate-800">Dashboard</div>
      <nav className="space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              pathname === item.href && 'bg-blue-50 text-blue-700'
            )}
            onClick={onNavigate}
          >
            <span className="text-base" aria-hidden>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
