import { RotateCw } from 'lucide-react';

interface Loader2Props {
  className?: string;
  size?: number;
}

export default function Loader2({ className = '', size = 24 }: Loader2Props) {
  return (
    <RotateCw 
      className={`animate-spin ${className}`} 
      size={size}
      aria-hidden="true"
    />
  );
}
