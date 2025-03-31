
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const EmptyState = ({
  title,
  description,
  action,
  icon = <ClipboardList className="h-12 w-12 text-muted-foreground" />,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
};

export default EmptyState;
