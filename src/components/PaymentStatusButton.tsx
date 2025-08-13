import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Project, PaymentStatus } from '@/types';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  Edit,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusButtonProps {
  project: Project;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const paymentStatusConfig = {
  'ממתין לתשלום': {
    label: 'ממתין לתשלום',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'התשלום טרם התקבל'
  },
  'שולם חלקית': {
    label: 'שולם חלקית',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: AlertTriangle,
    description: 'התקבל תשלום חלקי'
  },
  'שולם במלואו': {
    label: 'שולם במלואו',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'התשלום התקבל במלואו'
  },
  'לא רלוונטי': {
    label: 'לא רלוונטי',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: XCircle,
    description: 'אין צורך בתשלום'
  }
} as const;

export function PaymentStatusButton({ 
  project, 
  className,
  size = 'sm' 
}: PaymentStatusButtonProps) {
  const { updateProject } = useProjectStore();
  const { toast } = useToast();
  
  // Default payment status if not set
  const currentStatus = project.paymentStatus || 'ממתין לתשלום';
  const statusConfig = paymentStatusConfig[currentStatus];
  const StatusIcon = statusConfig.icon;

  const sizeClasses = {
    sm: 'h-7 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-2',
    lg: 'h-10 px-4 text-base gap-2'
  };

  const handleStatusChange = (newStatus: PaymentStatus) => {
    const updatedProject = {
      ...project,
      paymentStatus: newStatus
    };
    
    updateProject(updatedProject);
    
    toast({
      title: "סטטוס תשלום עודכן",
      description: `הפרויקט "${project.name}" עודכן ל${newStatus}`,
    });
  };

  const calculatePaymentPercentage = () => {
    if (!project.budget || project.budget === 0) return 0;
    const paid = project.paidAmount || 0;
    return Math.round((paid / project.budget) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Payment Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'border justify-between font-medium transition-all duration-200 hover:shadow-sm w-full',
              statusConfig.color,
              sizeClasses[size]
            )}
          >
            <div className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              <span>{statusConfig.label}</span>
            </div>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 rtl">
          {(Object.keys(paymentStatusConfig) as PaymentStatus[]).map((status) => {
            const config = paymentStatusConfig[status];
            const Icon = config.icon;
            
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  currentStatus === status && 'bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Payment Information */}
      {project.budget && project.budget > 0 && (
        <div className="flex flex-col gap-1 p-2 bg-muted/30 rounded-md text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">תקציב:</span>
            <span className="font-medium">{formatCurrency(project.budget)}</span>
          </div>
          
          {project.paidAmount && project.paidAmount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">שולם:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(project.paidAmount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">נותר:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(project.budget - project.paidAmount)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground">התקדמות:</span>
                  <span className="font-medium">{calculatePaymentPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${calculatePaymentPercentage()}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-6 px-2 text-xs gap-1"
          onClick={() => {
            // TODO: Open payment edit dialog
            toast({
              title: "בקרוב",
              description: "עריכת פרטי תשלום תהיה זמינה בקרוב",
            });
          }}
        >
          <Edit className="w-3 h-3" />
          ערוך
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-6 px-2 text-xs gap-1"
          onClick={() => {
            // TODO: Generate invoice
            toast({
              title: "בקרוב",
              description: "יצירת חשבונית תהיה זמינה בקרוב",
            });
          }}
        >
          <Receipt className="w-3 h-3" />
          חשבונית
        </Button>
      </div>
    </div>
  );
}

// Utility to get payment status color for badges
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  return paymentStatusConfig[status].color;
};
