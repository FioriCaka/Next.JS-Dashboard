'use client';
import { useEffect, useState } from 'react';

type Me = { uid: number; email: string; name?: string | null } | null;

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [query, setQuery] = useState('');
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    // Best-effort: reload to re-trigger server-side redirects
    location.href = '/login';
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white/80 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm shadow-sm"
          onClick={onMenuClick}
        >
          ☰
        </button>
        <div className="text-sm font-semibold text-slate-800">Welcome back 👋</div>
      </div>
      <div className="flex flex-1 justify-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-blue-500 transition focus:ring-2"
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        {me ? (
          <>
            <div className="hidden text-sm text-slate-600 sm:block">{me.name || me.email}</div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
            >
              Login
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Register
            </a>
          </>
        )}
      </div>
    </header>
  );
}
