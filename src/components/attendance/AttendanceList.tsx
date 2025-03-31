
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Student } from '@/utils/data';
import { Check, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StudentCard from './StudentCard';

interface AttendanceListProps {
  students: Student[];
  presentStudents: string[];
  toggleAttendance: (rollNumber: string) => void;
}

const AttendanceList = ({ students, presentStudents, toggleAttendance }: AttendanceListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter students based on search query
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-4 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const isPresent = presentStudents.includes(student.rollNumber);
          
          return (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
            >
              <Link to={`/student/${student.rollNumber}`} className="flex-1">
                <StudentCard student={student} />
              </Link>
              
              <Button
                variant={isPresent ? "default" : "outline"}
                size="sm"
                className={`min-w-[90px] ${isPresent ? 'bg-success hover:bg-success/90' : ''}`}
                onClick={() => toggleAttendance(student.rollNumber)}
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
        })}
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No students found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
