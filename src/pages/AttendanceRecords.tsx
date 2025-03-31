
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, ChevronLeft, CopyIcon, Share } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Class,
  AttendanceRecord,
  loadClasses,
  loadAttendanceRecords,
  getClassAttendanceRecords,
  formatAttendanceReport,
} from '@/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const AttendanceRecords = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  useEffect(() => {
    const loadedClasses = loadClasses();
    setClasses(loadedClasses);
    
    if (loadedClasses.length > 0 && !selectedClass) {
      setSelectedClass(loadedClasses[0].id);
    }
  }, []);
  
  useEffect(() => {
    if (selectedClass) {
      const records = getClassAttendanceRecords(selectedClass);
      setAttendanceRecords(records);
    }
  }, [selectedClass]);
  
  useEffect(() => {
    setFormattedDate(format(date, 'yyyy-MM-dd'));
  }, [date]);
  
  const handleCopyAttendance = (classObj: Class | undefined) => {
    if (!classObj) return;
    
    const report = formatAttendanceReport(classObj, formattedDate);
    navigator.clipboard.writeText(report);
    toast.success('Attendance report copied to clipboard');
  };
  
  const handleShareAttendance = async (classObj: Class | undefined) => {
    if (!classObj) return;
    
    const report = formatAttendanceReport(classObj, formattedDate);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Attendance Report for ${classObj.name}`,
          text: report,
        });
        toast.success('Attendance report shared');
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy if sharing fails
        navigator.clipboard.writeText(report);
        toast.success('Attendance report copied to clipboard');
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(report);
      toast.success('Attendance report copied to clipboard');
    }
  };
  
  const filteredRecords = attendanceRecords.filter(record => 
    selectedClass && record.classId === selectedClass
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const selectedClassData = classes.find(c => c.id === selectedClass);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Attendance Records</h1>
        </div>
        
        {classes.length > 0 ? (
          <>
            <Tabs defaultValue={selectedClass || ''} onValueChange={setSelectedClass} className="mb-6">
              <TabsList className="mb-4 overflow-auto flex whitespace-nowrap">
                {classes.map(classItem => (
                  <TabsTrigger key={classItem.id} value={classItem.id}>
                    {classItem.name} ({classItem.section})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {classes.map(classItem => (
                <TabsContent key={classItem.id} value={classItem.id}>
                  <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{classItem.name}</h2>
                        <p className="text-muted-foreground">
                          Section {classItem.section} | Batch {classItem.batch} | {classItem.students.length} Students
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
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
                        
                        <Button 
                          variant="outline" 
                          onClick={() => handleCopyAttendance(classItem)}
                          className="flex items-center"
                        >
                          <CopyIcon className="mr-1 h-4 w-4" />
                          Copy
                        </Button>
                        
                        <Button 
                          onClick={() => handleShareAttendance(classItem)}
                          className="flex items-center"
                        >
                          <Share className="mr-1 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                    
                    {filteredRecords.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Present</TableHead>
                            <TableHead>Absent</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.map(record => {
                            const totalStudents = classItem.students.length;
                            const presentCount = record.presentStudents.length;
                            const absentCount = totalStudents - presentCount;
                            
                            return (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                  {format(new Date(record.date), 'PP')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="success" className="mr-1">{presentCount}</Badge>
                                  <span className="text-muted-foreground">
                                    ({Math.round((presentCount / totalStudents) * 100)}%)
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="destructive" className="mr-1">{absentCount}</Badge>
                                  <span className="text-muted-foreground">
                                    ({Math.round((absentCount / totalStudents) * 100)}%)
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => navigate(`/attendance/${classItem.id}?date=${record.date}`)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        const formattedRecord = formatAttendanceReport(classItem, record.date);
                                        navigator.clipboard.writeText(formattedRecord);
                                        toast.success('Attendance report copied to clipboard');
                                      }}
                                    >
                                      <CopyIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 bg-muted/40 rounded-lg">
                        <p className="text-muted-foreground mb-4">No attendance records found for this class</p>
                        <Button onClick={() => navigate(`/attendance/${classItem.id}`)}>
                          Take Attendance
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No classes found</h2>
            <p className="text-muted-foreground mb-6">
              You need to create classes before you can take or view attendance
            </p>
            <Button onClick={() => navigate('/create-class')}>
              Create Class
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AttendanceRecords;
