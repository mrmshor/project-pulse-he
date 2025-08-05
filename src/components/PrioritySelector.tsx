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
  icon: React.ReactNode;
}[] = [
  { 
    value: 'נמוכה', 
    label: 'נמוכה', 
    color: 'text-success',
    icon: <ArrowDown className="w-3 h-3" />
  },
  { 
    value: 'בינונית', 
    label: 'בינונית', 
    color: 'text-primary',
    icon: <ArrowRight className="w-3 h-3" />
  },
  { 
    value: 'גבוהה', 
    label: 'גבוהה', 
    color: 'text-danger',
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
      <span className={`text-sm font-medium ${currentOption?.color} flex items-center gap-1`}>
        {currentOption?.icon}
        {currentOption?.label}
      </span>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-1 hover:bg-accent/50 rounded-md group ${currentOption?.color}`}
        >
          <div className="flex items-center gap-1">
            {currentOption?.icon}
            <span className="text-sm font-medium">{currentOption?.label}</span>
            <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-32">
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