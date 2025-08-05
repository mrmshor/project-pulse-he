import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TasksSidebar } from './TasksSidebar';
import { ProjectsSidebar } from './ProjectsSidebar';
import { TauriStatus } from './TauriStatus';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <TauriStatus />
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 animate-fade-in mx-80">
        {children}
      </main>
      <TasksSidebar />
      <ProjectsSidebar />
    </div>
  );
}