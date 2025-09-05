import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import { loadClasses, loadAttendanceRecords, saveAttendanceRecords, AttendanceRecord } from '@/utils/data';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, parse } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import EmptyState from '@/components/ui/EmptyState';

const TakeAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(format(new Date(), 'dd/MM/yyyy'));
  const [formattedDate, setFormattedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchClassAndStudents = () => {
      try {
        setLoading(true);
        
        const classes = loadClasses();
        const classData = classes.find(c => c.id === classId);
        
        if (classData) {
          setClassData(classData);
          setStudents(classData.students || []);
          
          const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
          const formattedQueryDate = format(parsedDate, 'yyyy-MM-dd');
          
          const attendanceRecords = loadAttendanceRecords();
          const existingRecord = attendanceRecords.find(r => 
            r.classId === classId && r.date === formattedQueryDate
          );
          
          if (existingRecord) {
            setPresentStudents(existingRecord.presentStudents || []);
            toast({
              title: "Existing Record Found",
              description: `Loaded attendance for ${date}. You can update it.`,
            });
          } else {
            setPresentStudents(classData.students.map(student => student.rollNumber));
          }
          
          setFormattedDate(format(parsedDate, 'EEEE, MMMM d, yyyy'));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class data.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassAndStudents();
  }, [classId, date]);
  
  const handleAttendanceChange = (rollNumber, isPresent) => {
    setPresentStudents(prev => {
      if (isPresent) {
        return [...prev, rollNumber];
      } else {
        return prev.filter(roll => roll !== rollNumber);
      }
    });
  };
  
  const handleToggleAll = (present) => {
    if (present) {
      setPresentStudents(students.map(student => student.roll_number));
    } else {
      setPresentStudents([]);
    }
  };
  
  const handleDateChange = (newDate) => {
    const formattedNewDate = format(newDate, 'dd/MM/yyyy');
    setDate(formattedNewDate);
    setShowCalendar(false);
  };
  
  const handleSaveAttendance = () => {
    try {
      setSubmitting(true);
      
      if (!classId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Missing class information.",
        });
        return;
      }
      
      const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
      const formattedDate = format(parsedDate, 'yyyy-MM-dd');
      
      const existingRecords = loadAttendanceRecords();
      const recordIndex = existingRecords.findIndex(r => 
        r.classId === classId && r.date === formattedDate
      );
      
      const newRecord: AttendanceRecord = {
        id: recordIndex >= 0 ? existingRecords[recordIndex].id : `record-${Date.now()}`,
        classId,
        date: formattedDate,
        presentStudents
      };
      
      let updatedRecords;
      if (recordIndex >= 0) {
        // Update existing record
        updatedRecords = [...existingRecords];
        updatedRecords[recordIndex] = newRecord;
      } else {
        // Create new record
        updatedRecords = [...existingRecords, newRecord];
      }
      
      saveAttendanceRecords(updatedRecords);
      
      toast({
        title: "Attendance Saved",
        description: `Attendance for ${date} has been saved successfully.`,
      });
      
      navigate(`/class/${classId}`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!classData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl px-4 py-8">
          <EmptyState
            title="Class Not Found"
            description="The class you're looking for doesn't exist."
            action={{
              label: "Go Back",
              onClick: () => navigate('/'),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }
  
  const presentCount = presentStudents.length;
  const totalCount = students.length;
  const percentagePresent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl px-4 py-8">
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
          <h1 className="text-3xl font-bold">Take Attendance</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{classData.name}</h2>
          <p className="text-muted-foreground">
            Section {classData.section} | Batch {classData.batch}
          </p>
        </div>
        
        <div className="mb-6 bg-card rounded-lg border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="mb-2 sm:mb-0">
              <p className="text-sm text-muted-foreground">Date</p>
              <div className="flex items-center">
                <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">{formattedDate}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Date</DialogTitle>
                      <DialogDescription>
                        Choose a date for attendance
                      </DialogDescription>
                    </DialogHeader>
                    <CalendarComponent
                      mode="single"
                      selected={parse(date, 'dd/MM/yyyy', new Date())}
                      onSelect={handleDateChange}
                      className="mx-auto"
                    />
                    <DialogFooter>
                      <Button onClick={() => setShowCalendar(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleToggleAll(true)}
              >
                Mark All Present
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleToggleAll(false)}
              >
                Mark All Absent
              </Button>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="ml-1 font-medium">
                {presentCount} present, {totalCount - presentCount} absent
              </span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 text-sm font-medium">{percentagePresent}%</div>
              <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    percentagePresent >= 75 
                    ? 'bg-success' 
                    : percentagePresent >= 50 
                      ? 'bg-warning' 
                      : 'bg-destructive'}`}
                  style={{ width: `${percentagePresent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <AttendanceMarker
                key={student.id}
                rollNumber={student.roll_number}
                name={student.name}
                avatar={student.avatar}
                isPresent={presentStudents.includes(student.roll_number)}
                onChange={handleAttendanceChange}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveAttendance} 
            disabled={submitting}
            className="px-6"
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TakeAttendance;
