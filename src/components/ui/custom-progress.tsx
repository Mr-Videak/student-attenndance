
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  max?: number;
}

const CustomProgress: React.FC<CustomProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName
}) => {
  // Ensure value is between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;
  
  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
    >
      <div
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default CustomProgress;
