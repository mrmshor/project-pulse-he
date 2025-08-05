import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'דשבורד', href: '/', icon: LayoutDashboard },
  { name: 'פרויקטים', href: '/projects', icon: FolderOpen },
  { name: 'משימות', href: '/tasks', icon: CheckSquare },
  { name: 'אנשי קשר', href: '/contacts', icon: Users },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        'glass h-screen transition-smooth shadow-elegant',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent animate-float">ניהול פרויקטים</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 btn-glass transition-smooth"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'nav-item flex items-center gap-3',
                isActive
                  ? 'active'
                  : 'hover:shadow-elegant'
              )}
            >
              <item.icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}