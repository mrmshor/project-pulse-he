import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface PaymentStatusButtonProps {
  projectId: string;
  isPaid: boolean;
  amount?: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PaymentStatusButton({ 
  projectId, 
  isPaid, 
  amount, 
  currency = 'ILS',
  size = 'sm' 
}: PaymentStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateProject, projects } = useProjectStore();

  const handleTogglePayment = async () => {
    setIsUpdating(true);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedPayment = {
      ...project.payment,
      isPaid: !isPaid,
      paidDate: !isPaid ? new Date() : undefined
    };

    updateProject(projectId, {
      ...project,
      payment: updatedPayment
    });

    setIsUpdating(false);
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    const currencySymbol = currency === 'ILS' ? '₪' : currency === 'USD' ? '$' : '€';
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const getButtonSize = () => {
    switch (size) {
      case 'lg': return 'h-10 px-4';
      case 'md': return 'h-8 px-3';
      default: return 'h-6 px-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'lg': return 'w-5 h-5';
      case 'md': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'lg': return 'text-sm';
      case 'md': return 'text-xs';
      default: return 'text-xs';
    }
  };

  if (isPaid) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleTogglePayment}
        disabled={isUpdating}
        className={`${getButtonSize()} ${getTextSize()} border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors`}
      >
        <CheckCircle className={`${getIconSize()} ml-1`} />
        שולם
        {amount && (
          <span className="mr-1">({formatAmount(amount)})</span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTogglePayment}
      disabled={isUpdating}
      className={`${getButtonSize()} ${getTextSize()} border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors`}
    >
      <XCircle className={`${getIconSize()} ml-1`} />
      לא שולם
      {amount && (
        <span className="mr-1">({formatAmount(amount)})</span>
      )}
    </Button>
  );
}