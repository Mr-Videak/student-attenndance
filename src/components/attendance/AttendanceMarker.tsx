
import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Check, Save, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  AttendanceRecord, 
  Class, 
  createAttendanceRecord, 
  formatDate, 
  getAttendanceRecord, 
  getCurrentDate, 
  saveAttendanceRecord 
} from '@/utils';
import { format } from 'date-fns';
import AttendanceList from './AttendanceList';

interface AttendanceMarkerProps {
  classData: Class;
}

const AttendanceMarker = ({ classData }: AttendanceMarkerProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(getCurrentDate());
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load attendance data when date changes
  useEffect(() => {
    const newFormattedDate = formatDate(date);
    setFormattedDate(newFormattedDate);
    
    // Load existing attendance record for this date if it exists
    const record = getAttendanceRecord(classData.id, newFormattedDate);
    if (record) {
      setPresentStudents(record.presentStudents);
    } else {
      // Default to all students being present
      setPresentStudents(classData.students.map(student => student.rollNumber));
    }
  }, [date, classData]);
  
  // Toggle attendance for a student
  const toggleAttendance = (rollNumber: string) => {
    setPresentStudents(prev => {
      if (prev.includes(rollNumber)) {
        return prev.filter(rn => rn !== rollNumber);
      } else {
        return [...prev, rollNumber];
      }
    });
  };
  
  // Set all students present
  const markAllPresent = () => {
    setPresentStudents(classData.students.map(student => student.rollNumber));
    toast.success("All students marked present");
  };
  
  // Set all students absent
  const markAllAbsent = () => {
    setPresentStudents([]);
    toast.success("All students marked absent");
  };
  
  // Save attendance
  const saveAttendance = async () => {
    setIsLoading(true);
    
    try {
      const record: AttendanceRecord = createAttendanceRecord(
        classData.id,
        formattedDate,
        presentStudents
      );
      
      saveAttendanceRecord(record);
      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllPresent}
            className="flex items-center"
          >
            <Check className="mr-1 h-4 w-4" />
            Mark All Present
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAbsent}
            className="flex items-center"
          >
            <X className="mr-1 h-4 w-4" />
            Mark All Absent
          </Button>
          <Button 
            onClick={saveAttendance} 
            disabled={isLoading}
            className="flex items-center"
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Student List for Attendance */}
      <div className="bg-card rounded-lg border shadow-sm">
        <AttendanceList 
          students={classData.students}
          presentStudents={presentStudents}
          toggleAttendance={toggleAttendance}
        />
      </div>
      
      {/* Information about attendance */}
      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="flex items-center">
          <span className="font-medium">Present: </span>
          <span className="ml-2">{presentStudents.length} / {classData.students.length}</span>
          <span className="ml-4 font-medium">Absent: </span>
          <span className="ml-2">{classData.students.length - presentStudents.length}</span>
        </p>
      </div>
    </div>
  );
};

export default AttendanceMarker;
