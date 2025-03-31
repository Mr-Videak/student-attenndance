
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { getCurrentDate } from '@/utils/attendance';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import EmptyState from '@/components/ui/EmptyState';

const TakeAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(getCurrentDate());
  const [formattedDate, setFormattedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchClassAndStudents = async () => {
      try {
        setLoading(true);
        
        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .single();
        
        if (classError) throw classError;
        setClassData(classData);
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .order('roll_number', { ascending: true });
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
        
        // Check if attendance already exists for this date
        const formattedDate = date.split('/').reverse().join('-');
        const { data: existingRecord, error: recordError } = await supabase
          .from('attendance_records')
          .select('present_students')
          .eq('class_id', classId)
          .eq('date', formattedDate)
          .single();
        
        if (existingRecord) {
          setPresentStudents(existingRecord.present_students || []);
          toast({
            title: "Existing Record Found",
            description: `Loaded attendance for ${date}. You can update it.`,
          });
        } else {
          // Default all students as present
          setPresentStudents(studentsData.map(student => student.roll_number));
        }
        
        // Format the date for display
        const [day, month, year] = date.split('/');
        const displayDate = new Date(`${year}-${month}-${day}`);
        setFormattedDate(format(displayDate, 'EEEE, MMMM d, yyyy'));
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
  }, [classId, date, user]);
  
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
      // Mark all as present
      setPresentStudents(students.map(student => student.roll_number));
    } else {
      // Mark all as absent
      setPresentStudents([]);
    }
  };
  
  const handleDateChange = (newDate) => {
    const formattedNewDate = format(newDate, 'dd/MM/yyyy');
    setDate(formattedNewDate);
    setShowCalendar(false);
  };
  
  const handleSaveAttendance = async () => {
    try {
      setSubmitting(true);
      
      if (!classId || !user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Missing class or user information.",
        });
        return;
      }
      
      // Convert date from DD/MM/YYYY to YYYY-MM-DD for database
      const [day, month, year] = date.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Check if a record already exists for this date
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('class_id', classId)
        .eq('date', formattedDate);
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        result = await supabase
          .from('attendance_records')
          .update({
            present_students: presentStudents,
          })
          .eq('id', existingRecord[0].id);
      } else {
        // Create new record
        result = await supabase
          .from('attendance_records')
          .insert([{
            class_id: classId,
            date: formattedDate,
            present_students: presentStudents,
            user_id: user.id,
          }]);
      }
      
      if (result.error) throw result.error;
      
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
  
  // Filter students based on search query
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
                      selected={new Date(formattedDate)}
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
        
        <div className="attendance-grid mb-8">
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
