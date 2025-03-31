
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, Edit, ListFilter, Trash2, UserPlus } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentCard from '@/components/attendance/StudentCard';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Student name must be at least 2 characters.",
  }),
  rollNumber: z.string().min(1, {
    message: "Roll number is required",
  }),
});

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
    },
  });
  
  useEffect(() => {
    fetchClassData();
    fetchStudents();
    fetchAttendanceRecords();
  }, [classId]);
  
  const fetchClassData = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (error) throw error;
      setClassData(data);
    } catch (error) {
      console.error('Error fetching class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load class data.",
      });
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('roll_number', { ascending: true });
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', classId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };
  
  const handleAddStudent = async (values) => {
    try {
      const newStudent = {
        name: values.name,
        roll_number: values.rollNumber,
        section: classData.section,
        batch: classData.batch,
        class_id: classId,
      };
      
      const { data, error } = await supabase
        .from('students')
        .insert([newStudent])
        .select();
      
      if (error) throw error;
      
      setStudents([...students, data[0]]);
      toast({
        title: "Student added",
        description: "The student has been added successfully.",
      });
      
      setAddStudentOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add student.",
      });
    }
  };
  
  const handleEditStudent = (student) => {
    setEditStudentData(student);
    form.reset({
      name: student.name,
      rollNumber: student.roll_number,
    });
  };
  
  const handleUpdateStudent = async (values) => {
    try {
      if (!editStudentData) return;
      
      const { error } = await supabase
        .from('students')
        .update({
          name: values.name,
          roll_number: values.rollNumber,
        })
        .eq('id', editStudentData.id);
      
      if (error) throw error;
      
      // Update local state
      setStudents(students.map(s => 
        s.id === editStudentData.id 
          ? {...s, name: values.name, roll_number: values.rollNumber} 
          : s
      ));
      
      toast({
        title: "Student updated",
        description: "The student details have been updated successfully.",
      });
      
      setEditStudentData(null);
      form.reset();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update student.",
      });
    }
  };
  
  const handleDeleteStudent = async (studentId) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);
      
      if (error) throw error;
      
      // Update local state
      setStudents(students.filter(s => s.id !== studentId));
      
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete student.",
      });
    }
  };
  
  // Filter students based on search query
  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (!classData && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-6xl px-4 py-8">
          <EmptyState
            title="Class Not Found"
            description="The class you're looking for doesn't exist."
            action={{
              label: "Go Back",
              onClick: () => navigate('/classes'),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8 animate-fade-in">
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
          <h1 className="text-3xl font-bold">{classData?.name || 'Loading...'}</h1>
        </div>
        
        {classData && (
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div>
              <p className="text-muted-foreground">
                Section {classData.section} | Batch {classData.batch}
              </p>
              <p className="mt-1 font-medium">
                {students.length} Students
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Link to={`/attendance/${classData.id}`}>
                <Button className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Take Attendance
                </Button>
              </Link>
              <Link to={`/edit-class/${classData.id}`}>
                <Button variant="outline" className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">Students</h2>
                  <Button variant="ghost" size="icon">
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </div>
                
                <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Add a new student to this class.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddStudent)} className="space-y-4">
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
                          <Button type="submit">Add Student</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={!!editStudentData} onOpenChange={(open) => !open && setEditStudentData(null)}>
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
              </div>
              
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search students by name or roll number..."
              />
              
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center p-2 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="divide-y">
                    {filteredStudents.map(student => (
                      <div key={student.id} className="p-4 hover:bg-muted transition-colors flex justify-between items-center">
                        <Link to={`/student/${student.roll_number}`} className="flex-grow">
                          <StudentCard student={{
                            id: student.id,
                            rollNumber: student.roll_number,
                            name: student.name,
                            section: student.section,
                            batch: student.batch,
                            avatar: student.avatar
                          }} />
                        </Link>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this student? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Students Found"
                    description={
                      searchQuery
                        ? `No students matching "${searchQuery}"`
                        : "This class doesn't have any students yet."
                    }
                    action={{
                      label: "Add Student",
                      onClick: () => setAddStudentOpen(true),
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Attendance Records</h2>
              </div>
              
              {attendanceRecords.length > 0 ? (
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => {
                        const presentCount = record.present_students.length;
                        const absentCount = students.length - presentCount;
                        const attendanceDate = new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        });
                        
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{attendanceDate}</TableCell>
                            <TableCell>
                              <span className="status-present">{presentCount}</span>
                            </TableCell>
                            <TableCell>
                              <span className="status-absent">{absentCount}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={`/view-attendance/${record.id}`}>
                                <Button variant="ghost" size="sm">View</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title="No Attendance Records"
                  description="You haven't taken attendance for this class yet."
                  action={{
                    label: "Take Attendance",
                    onClick: () => navigate(`/attendance/${classId}`),
                  }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ClassDetails;
