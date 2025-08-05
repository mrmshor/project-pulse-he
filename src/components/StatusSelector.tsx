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
import { ChevronDown, Check } from 'lucide-react';

interface StatusSelectorProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'תכנון', label: 'תכנון', color: 'bg-muted text-muted-foreground' },
  { value: 'פעיל', label: 'פעיל', color: 'bg-primary text-primary-foreground' },
  { value: 'הושלם', label: 'הושלם', color: 'bg-success text-success-foreground' },
  { value: 'בהמתנה', label: 'בהמתנה', color: 'bg-secondary text-secondary-foreground' },
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
      <Badge className={`${currentOption?.color} transition-smooth hover:scale-105 border border-opacity-50`}>
        {currentOption?.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-0 hover:bg-transparent group`}
        >
          <Badge className={`${currentOption?.color} transition-smooth hover:scale-105 border border-opacity-50 group-hover:shadow-md cursor-pointer`}>
            <span>{currentOption?.label}</span>
            <ChevronDown className="w-3 h-3 mr-1 transition-transform group-data-[state=open]:rotate-180" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-32">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusSelect(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{option.label}</span>
            {currentStatus === option.value && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}