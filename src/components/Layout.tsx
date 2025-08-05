import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TauriStatus } from './TauriStatus';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background" dir="rtl">
      <TauriStatus />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Sidebar />
    </div>
  );
}