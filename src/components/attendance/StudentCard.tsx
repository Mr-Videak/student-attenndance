
import React from 'react';
import { Student } from '@/utils/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StudentCardProps {
  student: Student;
}

const StudentCard = ({ student }: StudentCardProps) => {
  // Generate initials for avatar fallback
  const initials = student.name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  return (
    <div className="flex items-center space-x-3">
      <Avatar>
        <AvatarImage src={student.avatar} alt={student.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{student.name}</p>
        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
      </div>
    </div>
  );
};

export default StudentCard;
