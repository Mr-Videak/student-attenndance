
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  Edit,
  User,
  GraduationCap,
  Clock
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import EmptyState from '@/components/ui/EmptyState';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Student name must be at least 2 characters.",
  }),
  rollNumber: z.string().min(1, {
    message: "Roll number is required",
  }),
});

const StudentDetails = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
    },
  });
  
  useEffect(() => {
    fetchStudentAndClass();
  }, [rollNumber]);
  
  const fetchStudentAndClass = async () => {
    try {
      setLoading(true);
      
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', rollNumber)
        .single();
      
      if (studentError) throw studentError;
      setStudent(studentData);
      
      if (studentData?.class_id) {
        // Fetch class data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', studentData.class_id)
          .single();
        
        if (classError) throw classError;
        setClassData(classData);
        
        // Fetch attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('class_id', studentData.class_id)
          .order('date', { ascending: false });
        
        if (attendanceError) throw attendanceError;
        setAttendanceRecords(attendanceData || []);
      }
      
      // Set form values
      if (studentData) {
        form.reset({
          name: studentData.name,
          rollNumber: studentData.roll_number,
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student data.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStudent = async (values) => {
    try {
      if (!student) return;
      
      const { error } = await supabase
        .from('students')
        .update({
          name: values.name,
          roll_number: values.rollNumber,
        })
        .eq('id', student.id);
      
      if (error) throw error;
      
      toast({
        title: "Student updated",
        description: "The student details have been updated successfully.",
      });
      
      // Update local state
      setStudent({
        ...student,
        name: values.name,
        roll_number: values.rollNumber,
      });
      
      setEditDialogOpen(false);
      
      // If roll number changed, navigate to the new URL
      if (values.rollNumber !== rollNumber) {
        navigate(`/student/${values.rollNumber}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update student.",
      });
    }
  };
  
  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    if (!attendanceRecords.length) return { present: 0, absent: 0, percentage: 0 };
    
    let presentCount = 0;
    
    attendanceRecords.forEach(record => {
      if (record.present_students.includes(student.roll_number)) {
        presentCount++;
      }
    });
    
    const totalClasses = attendanceRecords.length;
    const absentCount = totalClasses - presentCount;
    const percentage = (presentCount / totalClasses) * 100;
    
    return {
      present: presentCount,
      absent: absentCount,
      percentage: Math.round(percentage),
    };
  };
  
  const attendanceStats = student ? calculateAttendanceStats() : { present: 0, absent: 0, percentage: 0 };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl px-4 py-8">
          <EmptyState
            title="Student Not Found"
            description="The student you're looking for doesn't exist."
            action={{
              label: "Go Back",
              onClick: () => navigate(-1),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }
  
  // Create initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.avatar || '/placeholder.svg'} alt={student.name} />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{student.name}</CardTitle>
                  <CardDescription className="text-lg font-medium">{student.roll_number}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>Section {student.section} | Batch {student.batch}</span>
                </div>
                {classData && (
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Class: {classData.name}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>Student's attendance statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-xl font-bold">{attendanceStats.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold">{attendanceStats.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold">{attendanceStats.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Percentage</p>
                  </div>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      attendanceStats.percentage >= 75 
                      ? 'bg-success' 
                      : attendanceStats.percentage >= 50 
                        ? 'bg-warning' 
                        : 'bg-destructive'}`}
                    style={{ width: `${attendanceStats.percentage}%` }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  {attendanceStats.percentage >= 75 
                    ? 'Good attendance' 
                    : attendanceStats.percentage >= 50 
                      ? 'Average attendance' 
                      : 'Poor attendance'}
                </p>
              </CardContent>
              <CardFooter>
                {classData && (
                  <Link to={`/class/${classData.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Class
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="space-y-2">
                  {attendanceRecords.slice(0, 10).map((record) => {
                    const isPresent = record.present_students.includes(student.roll_number);
                    const date = new Date(record.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric' 
                    });
                    
                    return (
                      <div key={record.id} className="flex justify-between items-center p-2 border-b last:border-0">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{date}</span>
                        </div>
                        <div>
                          {isPresent ? (
                            <span className="status-present">Present</span>
                          ) : (
                            <span className="status-absent">Absent</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No attendance records available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student details.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateStudent)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2023BQ1A4755" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Update Student</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDetails;
