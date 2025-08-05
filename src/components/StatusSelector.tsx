import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectStatus } from '@/types';
import { ChevronDown, Check, PenTool, Play, CheckCircle2, Pause } from 'lucide-react';

interface StatusSelectorProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

const statusOptions: { 
  value: ProjectStatus; 
  label: string; 
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}[] = [
  { 
    value: 'תכנון', 
    label: 'תכנון', 
    color: 'text-slate-700 dark:text-slate-300', 
    bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
    icon: <PenTool className="w-3 h-3" />
  },
  { 
    value: 'פעיל', 
    label: 'פעיל', 
    color: 'text-blue-700 dark:text-blue-300', 
    bgColor: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600',
    icon: <Play className="w-3 h-3" />
  },
  { 
    value: 'הושלם', 
    label: 'הושלם', 
    color: 'text-green-700 dark:text-green-300', 
    bgColor: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  { 
    value: 'בהמתנה', 
    label: 'בהמתנה', 
    color: 'text-yellow-700 dark:text-yellow-300', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600',
    icon: <Pause className="w-3 h-3" />
  },
];

export function StatusSelector({ currentStatus, onStatusChange, disabled = false }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentOption = statusOptions.find(option => option.value === currentStatus);
  
  const handleStatusSelect = (status: ProjectStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  if (disabled) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border ${currentOption?.color} ${currentOption?.bgColor}`}>
        {currentOption?.icon}
        {currentOption?.label}
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent group"
        >
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 cursor-pointer group-hover:shadow-sm group-hover:scale-105 ${currentOption?.color} ${currentOption?.bgColor}`}>
            {currentOption?.icon}
            <span>{currentOption?.label}</span>
            <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-36 glass">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusSelect(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
            {currentStatus === option.value && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}