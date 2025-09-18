'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  return (
    <div className="max-w-xl space-y-4">
      <div className="text-lg font-semibold text-slate-800">Settings</div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-600">Notification email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
        />
        <button
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
        >
          Save changes
        </button>
        {saved && <div className="mt-2 text-xs text-green-600">Saved!</div>}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-sm font-medium text-slate-700">Change password</div>
        <input
          type="password"
          placeholder="Current password"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New password"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={async () => {
            setPwMsg(null);
            const res = await fetch('/api/auth/change-password', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentPassword, newPassword }),
            });
            const ok = res.ok;
            setPwMsg(ok ? 'Password changed.' : 'Failed to change password.');
            if (ok) {
              setCurrentPassword('');
              setNewPassword('');
            }
          }}
        >
          Change password
        </button>
        {pwMsg && <div className="mt-2 text-xs text-slate-600">{pwMsg}</div>}
      </div>
    </div>
  );
}
