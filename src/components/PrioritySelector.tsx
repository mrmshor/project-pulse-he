import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Priority } from '@/types';
import { ChevronDown, Check, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PrioritySelectorProps {
  currentPriority: Priority;
  onPriorityChange: (priority: Priority) => void;
  disabled?: boolean;
}

const priorityOptions: { 
  value: Priority; 
  label: string; 
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}[] = [
  { 
    value: 'נמוכה', 
    label: 'נמוכה', 
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-600',
    icon: <ArrowDown className="w-3 h-3" />
  },
  { 
    value: 'בינונית', 
    label: 'בינונית', 
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-600',
    icon: <ArrowRight className="w-3 h-3" />
  },
  { 
    value: 'גבוהה', 
    label: 'גבוהה', 
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-600',
    icon: <ArrowUp className="w-3 h-3" />
  },
];

export function PrioritySelector({ currentPriority, onPriorityChange, disabled = false }: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentOption = priorityOptions.find(option => option.value === currentPriority);
  
  const handlePrioritySelect = (priority: Priority) => {
    onPriorityChange(priority);
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
        {priorityOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handlePrioritySelect(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
            {currentPriority === option.value && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}