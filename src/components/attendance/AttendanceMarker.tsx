
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/utils/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface AttendanceMarkerProps {
  rollNumber: string;
  name: string;
  avatar?: string;
  isPresent: boolean;
  onChange: (rollNumber: string, isPresent: boolean) => void;
}

const AttendanceMarker = ({ rollNumber, name, avatar, isPresent, onChange }: AttendanceMarkerProps) => {
  // Generate initials for avatar fallback
  const initials = name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div className="bg-card border rounded-md p-4 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{rollNumber}</p>
        </div>
      </div>
      
      <Button
        variant={isPresent ? "default" : "outline"}
        size="sm"
        className={`min-w-[90px] ${isPresent ? 'bg-success hover:bg-success/90' : ''}`}
        onClick={() => onChange(rollNumber, !isPresent)}
      >
        {isPresent ? (
          <>
            <Check className="mr-1 h-4 w-4" />
            Present
          </>
        ) : (
          <>
            <X className="mr-1 h-4 w-4" />
            Absent
          </>
        )}
      </Button>
    </div>
  );
};

export default AttendanceMarker;
