'use client';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar always visible */}
      <div className="sticky top-0 h-screen">
        <Sidebar className="h-full" />
      </div>
      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
