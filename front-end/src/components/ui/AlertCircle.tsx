import { AlertCircle as LucideAlertCircle } from 'lucide-react';

interface AlertCircleProps {
  className?: string;
  size?: number;
}

export default function AlertCircle({ className = '', size = 20 }: AlertCircleProps) {
  return (
    <LucideAlertCircle 
      className={className} 
      size={size}
      aria-hidden="true"
    />
  );
}
