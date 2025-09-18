'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Login failed');
      return;
    }
    r.push('/overview');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        <label className="mb-2 block text-sm">Email</label>
        <input
          className="input mb-4 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="mb-2 block text-sm">Password</label>
        <input
          type="password"
          className="input mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="mt-3 text-center text-sm">
          No account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
