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
        'bg-white dark:bg-gray-900 h-screen transition-all duration-300 shadow-lg border-r border-gray-200 dark:border-gray-700',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-foreground">ניהול פרויקטים Pro</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'
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