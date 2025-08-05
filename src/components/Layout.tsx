import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background" dir="rtl">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Sidebar />
    </div>
  );
}