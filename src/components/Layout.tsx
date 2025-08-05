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
      <div className="relative w-full overflow-hidden">
        <main className="mx-auto max-w-none px-8 py-8 animate-fade-in" style={{ 
          marginRight: '320px', 
          marginLeft: '320px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {children}
        </main>
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] z-40 w-80 bg-white border-l shadow-lg">
          <ProjectsSidebar />
        </div>
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 w-80 bg-white border-r shadow-lg">
          <TasksSidebar />
        </div>
      </div>
    </div>
  );
}