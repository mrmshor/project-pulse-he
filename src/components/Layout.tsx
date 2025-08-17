import { ReactNode, useState } from 'react';
import { TopNavigation } from './TopNavigation';
import { TasksSidebar } from './TasksSidebar';
import { ProjectsSidebar } from './ProjectsSidebar';
import { TauriStatus } from './TauriStatus';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DesktopCompanionStatus } from './DesktopCompanionStatus';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      <TauriStatus />
      <TopNavigation onSignOut={signOut} />
      
      <div className="relative w-full overflow-hidden">
        {/* Mobile sidebar toggle buttons */}
        <div className="lg:hidden fixed top-20 right-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="bg-white/90 backdrop-blur-sm shadow-md"
          >
            {rightSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            פרויקטים
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="bg-white/90 backdrop-blur-sm shadow-md"
          >
            {leftSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            משימות
          </Button>
        </div>

        {/* Main content area - responsive margins */}
        <main 
          className={`
            transition-all duration-300 ease-in-out
            px-4 md:px-6 lg:px-8 py-8 
            animate-fade-in
            min-h-[calc(100vh-4rem)]
            
            /* Mobile: Full width */
            lg:mr-80 lg:ml-80
            
            /* When sidebars are closed on mobile */
            ${leftSidebarOpen ? 'ml-80' : ''}
            ${rightSidebarOpen ? 'mr-80' : ''}
          `}
        >
          {children}
        </main>

        {/* Right Sidebar - Projects */}
        <div 
          className={`
            fixed right-0 top-16 h-[calc(100vh-4rem)] z-40 w-80 
            bg-white border-l shadow-lg
            transition-transform duration-300 ease-in-out
            
            /* Desktop: Always visible */
            lg:translate-x-0
            
            /* Mobile: Slide in/out */
            ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
        >
          <ProjectsSidebar />
        </div>

        {/* Left Sidebar - Tasks */}
        <div 
          className={`
            fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 w-80 
            bg-white border-r shadow-lg
            transition-transform duration-300 ease-in-out
            
            /* Desktop: Always visible */
            lg:translate-x-0
            
            /* Mobile: Slide in/out */
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <TasksSidebar />
        </div>

        {/* Mobile overlay when sidebars are open */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
            onClick={() => {
              setLeftSidebarOpen(false);
              setRightSidebarOpen(false);
            }}
          />
        )}
      </div>

      {/* Desktop Companion Status */}
      <DesktopCompanionStatus />
    </div>
  );
}
