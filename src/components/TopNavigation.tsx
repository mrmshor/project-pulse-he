import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CheckSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'דשבורד', href: '/', icon: LayoutDashboard },
  { name: 'פרויקטים', href: '/projects', icon: FolderOpen },
  { name: 'משימות', href: '/tasks', icon: CheckSquare },
  { name: 'אנשי קשר', href: '/contacts', icon: Users },
];

interface TopNavigationProps {
  onSignOut?: () => void;
}

export function TopNavigation({ onSignOut }: TopNavigationProps = {}) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* לוגו ושם */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                מערכת ניהול פרויקטים Pro
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-full"></div>
            </div>
          </div>

          {/* ניווט ראשי */}
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200',
                    'hover:scale-105 hover:shadow-md',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  
                  {/* אינדיקטור פעיל */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full"></div>
                  )}
                  
                  {/* אפקט הובר */}
                  <div className={cn(
                    'absolute inset-0 rounded-xl transition-opacity duration-200',
                    'bg-gradient-to-r from-primary/10 to-blue-600/10 opacity-0',
                    !isActive && 'hover:opacity-100'
                  )}></div>
                </NavLink>
              );
            })}
          </nav>

          {/* אזור סטטוס */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              מחובר
            </div>
            {onSignOut && (
              <Button variant="outline" onClick={onSignOut} size="sm">
                התנתק
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}