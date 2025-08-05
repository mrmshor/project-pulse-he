import { ReactNode } from 'react';
import { TopNavigation } from './TopNavigation';
import { TasksSidebar } from './TasksSidebar';
import { ProjectsSidebar } from './ProjectsSidebar';
import { TauriStatus } from './TauriStatus';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <TauriStatus />
      <TopNavigation />
      <div className="flex">
        <main className="flex-1 overflow-auto p-8 animate-fade-in mr-80">
          {children}
        </main>
        <TasksSidebar />
        <ProjectsSidebar />
      </div>
    </div>
  );
}