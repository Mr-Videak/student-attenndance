
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Download,
  Share
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import EmptyState from '@/components/ui/EmptyState';

const AttendanceRecords = () => {
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [classesMap, setClassesMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchClasses();
    fetchAttendanceRecords();
  }, [currentMonth]);
  
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, section, batch');
      
      if (error) throw error;
      
      // Convert to map for easier lookup
      const classes = {};
      data.forEach(cls => {
        classes[cls.id] = cls;
      });
      
      setClassesMap(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };
  
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance records.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const navigateToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const getClassName = (classId) => {
    return classesMap[classId]?.name || 'Unknown Class';
  };
  
  const getClassDetails = (classId) => {
    const cls = classesMap[classId];
    if (!cls) return 'Unknown';
    return `${cls.name} | Section ${cls.section} | Batch ${cls.batch}`;
  };
  
  const shareAttendanceOnWhatsApp = async (recordId) => {
    try {
      // Fetch detailed attendance information
      const { data: recordData, error: recordError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (recordError) throw recordError;
      
      const classId = recordData.class_id;
      
      // Fetch class data
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (classError) throw classError;
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId);
      
      if (studentsError) throw studentsError;
      
      const date = new Date(recordData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      let message = `*Attendance Report*\n\n`;
      message += `📆 *Date:* ${date}\n`;
      message += `📚 *Class:* ${classData.name}\n`;
      message += `👥 *Section:* ${classData.section}\n`;
      message += `🎓 *Batch:* ${classData.batch}\n\n`;
      
      const presentStudents = studentsData.filter(student => 
        recordData.present_students.includes(student.roll_number)
      );
      
      const absentStudents = studentsData.filter(student => 
        !recordData.present_students.includes(student.roll_number)
      );
      
      message += `✅ *Present (${presentStudents.length}/${studentsData.length})*\n`;
      presentStudents.forEach((student, index) => {
        message += `${index + 1}. ${student.roll_number} - ${student.name}\n`;
      });
      
      message += `\n❌ *Absent (${absentStudents.length}/${studentsData.length})*\n`;
      absentStudents.forEach((student, index) => {
        message += `${index + 1}. ${student.roll_number} - ${student.name}\n`;
      });
      
      message += `\n📊 *Attendance Percentage:* ${Math.round((presentStudents.length / studentsData.length) * 100)}%\n`;
      message += `\nGenerated by HighClass Attendance App`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error sharing attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share attendance report.",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Attendance Records</h1>
            <p className="text-muted-foreground mt-1">
              View and manage attendance records
            </p>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Monthly Records</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={navigateToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="w-36 text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button variant="outline" size="icon" onClick={navigateToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Showing attendance records for {format(currentMonth, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : attendanceRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => {
                    const date = new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{date}</TableCell>
                        <TableCell>{getClassName(record.class_id)}</TableCell>
                        <TableCell>{record.present_students.length} present</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/view-attendance/${record.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => shareAttendanceOnWhatsApp(record.id)}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No Records Found"
                description={`No attendance records for ${format(currentMonth, 'MMMM yyyy')}.`}
                icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AttendanceRecords;
