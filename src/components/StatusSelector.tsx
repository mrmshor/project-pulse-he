import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectStatus } from '@/types';
import { ChevronDown, Check, Clock, Play, CheckCircle, Pause, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  value: ProjectStatus;
  onChange: (status: ProjectStatus) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  'תכנון': {
    label: 'תכנון',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
    description: 'פרויקט בשלב התכנון'
  },
  'פעיל': {
    label: 'פעיל',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Play,
    description: 'פרויקט פעיל'
  },
  'הושלם': {
    label: 'הושלם',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'פרויקט הושלם בהצלחה'
  },
  'מושהה': {
    label: 'מושהה',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Pause,
    description: 'פרויקט מושהה זמנית'
  },
  'בוטל': {
    label: 'בוטל',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Archive,
    description: 'פרויקט בוטל'
  }
} as const;

export function StatusSelector({ 
  value, 
  onChange, 
  disabled = false, 
  className,
  size = 'md' 
}: StatusSelectorProps) {
  const currentStatus = statusConfig[value];
  const CurrentIcon = currentStatus.icon;

  const sizeClasses = {
    sm: 'h-7 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-2',
    lg: 'h-10 px-4 text-base gap-2'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'border justify-between font-medium transition-all duration-200 hover:shadow-sm',
            currentStatus.color,
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center gap-1">
            <CurrentIcon className="w-3 h-3" />
            <span>{currentStatus.label}</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 rtl">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onChange(status)}
              className={cn(
                'flex items-center justify-between cursor-pointer transition-colors duration-150',
                'hover:bg-muted/50 focus:bg-muted/50',
                value === status && 'bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </div>
              </div>
              
              {value === status && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for getting status color and icon
export const useStatusConfig = (status: ProjectStatus) => {
  return statusConfig[status];
};

// Utility function for status badge
export const getStatusBadgeClass = (status: ProjectStatus): string => {
  return statusConfig[status].color;
};
