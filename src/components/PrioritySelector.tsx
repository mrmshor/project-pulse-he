import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Priority } from '@/types';
import { ChevronDown, Check, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const priorityConfig = {
  'גבוהה': {
    label: 'גבוהה',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: ArrowUp,
    description: 'עדיפות גבוהה - דחוף',
    weight: 3
  },
  'בינונית': {
    label: 'בינונית',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: ArrowRight,
    description: 'עדיפות בינונית',
    weight: 2
  },
  'נמוכה': {
    label: 'נמוכה',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: ArrowDown,
    description: 'עדיפות נמוכה',
    weight: 1
  }
} as const;

export function PrioritySelector({ 
  value, 
  onChange, 
  disabled = false, 
  className,
  size = 'md' 
}: PrioritySelectorProps) {
  const currentPriority = priorityConfig[value];
  const CurrentIcon = currentPriority.icon;

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
            currentPriority.color,
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center gap-1">
            <CurrentIcon className="w-3 h-3" />
            <span>{currentPriority.label}</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48 rtl">
        {(Object.keys(priorityConfig) as Priority[]).map((priority) => {
          const config = priorityConfig[priority];
          const Icon = config.icon;
          
          return (
            <DropdownMenuItem
              key={priority}
              onClick={() => onChange(priority)}
              className={cn(
                'flex items-center justify-between cursor-pointer transition-colors duration-150',
                'hover:bg-muted/50 focus:bg-muted/50',
                value === priority && 'bg-muted'
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
              
              {value === priority && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for getting priority color and icon
export const usePriorityConfig = (priority: Priority) => {
  return priorityConfig[priority];
};

// Utility function for priority badge
export const getPriorityBadgeClass = (priority: Priority): string => {
  return priorityConfig[priority].color;
};

// Utility function for priority weight (for sorting)
export const getPriorityWeight = (priority: Priority): number => {
  return priorityConfig[priority].weight;
};

// Utility function to get priority icon component
export const getPriorityIcon = (priority: Priority) => {
  const config = priorityConfig[priority];
  return config.icon;
};
